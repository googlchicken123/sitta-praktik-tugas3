// js/components/stock-table.js
// defines createStockComponent(templateString) -> returns component options (ini catatan internal)
(function (global) {
  function createStockComponent(template) {
    return {
      template: template,
      data() {
        return {
          allStocks: [],
          upbjjList: [],
          kategoriList: [],
          selectedUpbjj: "",
          selectedKategori: "",
          sortBy: "",
          isSafety: false,
          q: "",
          hoverNote: null
        };
      },
      computed: {
        selectKategoriStyle() {
          return {
            backgroundColor: !this.selectedUpbjj ? "#f0f0f0" : "#fff",
            cursor: !this.selectedUpbjj ? "not-allowed" : "pointer"
          };
        },
        kategoriListFiltered() {
          if (!this.selectedUpbjj) return this.kategoriList;
          // hitung category tersedia for selected UPBJJ
          const set = new Set(this.allStocks.filter(s => s.upbjj === this.selectedUpbjj).map(s => s.kategori));
          return Array.from(set);
        },
        filteredData() {
          let data = this.allStocks.slice();

          if (this.selectedUpbjj) data = data.filter(d => d.upbjj === this.selectedUpbjj);
          if (this.selectedKategori) data = data.filter(d => d.kategori === this.selectedKategori);
          if (this.isSafety) data = data.filter(d => d.qty <= d.safety);
          if (this.q && this.q.trim()) {
            const ql = this.q.toLowerCase();
            data = data.filter(d => (d.judul || "").toLowerCase().includes(ql) || (d.kode || "").toLowerCase().includes(ql));
          }

          if (this.sortBy === "judul") data.sort((a, b) => a.judul.localeCompare(b.judul));
          if (this.sortBy === "qty") data.sort((a, b) => b.qty - a.qty);
          if (this.sortBy === "harga") data.sort((a, b) => b.harga - a.harga);

          return data;
        }
      },
      methods: {
        async loadData() {
          try {
            const stocks = await API.getStocks();
            const master = await API.getAll();
            this.allStocks = stocks || [];
            this.upbjjList = master.upbjjList || [];
            this.kategoriList = master.kategoriList || [];
          } catch (err) {
            console.error("loadData stock:", err);
            Swal.fire({ icon: "error", title: "Gagal memuat data stok" });
          }
        },
        formatRp(val) {
          if (typeof val !== "number") return val;
          return "Rp " + val.toLocaleString("id-ID");
        },
        statusText(item) {
          if (item.qty === 0) return "Kosong";
          if (item.qty < item.safety) return "Menipis";
          return "Aman";
        },
        statusClass(item) {
          if (item.qty === 0) return "danger";      
          if (item.qty < item.safety) return "warning";  
          return "success";                        
      },
        shortNote(item) {
          if (!item.catatanHTML) return "";
          // show truncated
          const tmp = item.catatanHTML.replace(/<[^>]*>/g, "");
          if (tmp.length > 30) return tmp.slice(0, 30) + "...";
          return tmp;
        },
        showNote(item) {
          this.hoverNote = item;
        },
        hideNote() {
          this.hoverNote = null;
        },
        resetFilter() {
          this.selectedUpbjj = "";
          this.selectedKategori = "";
          this.sortBy = "";
          this.isSafety = false;
          this.q = "";
        },

        // CRUD handlers pakai SweetAlert2 modals
        async openAddModal() {
          const { value: formValues } = await Swal.fire({
            title: "Tambah Bahan Ajar",
            html:
              `<input id="sw-kode" class="swal2-input" placeholder="Kode MK">` +
              `<input id="sw-judul" class="swal2-input" placeholder="Judul">` +
              `<input id="sw-kategori" class="swal2-input" placeholder="Kategori">` +
              `<input id="sw-upbjj" class="swal2-input" placeholder="UPBJJ">` +
              `<input id="sw-lokasi" class="swal2-input" placeholder="Lokasi Rak">` +
              `<input id="sw-harga" type="number" class="swal2-input" placeholder="Harga">` +
              `<input id="sw-qty" type="number" class="swal2-input" placeholder="Jumlah">` +
              `<input id="sw-safety" type="number" class="swal2-input" placeholder="Safety">` +
              `<textarea id="sw-catatan" class="swal2-textarea" placeholder="Catatan HTML (optional)"></textarea>`,
            focusConfirm: false,
            preConfirm: () => {
              return {
                kode: document.getElementById("sw-kode").value.trim(),
                judul: document.getElementById("sw-judul").value.trim(),
                kategori: document.getElementById("sw-kategori").value.trim(),
                upbjj: document.getElementById("sw-upbjj").value.trim(),
                lokasiRak: document.getElementById("sw-lokasi").value.trim(),
                harga: Number(document.getElementById("sw-harga").value) || 0,
                qty: Number(document.getElementById("sw-qty").value) || 0,
                safety: Number(document.getElementById("sw-safety").value) || 0,
                catatanHTML: document.getElementById("sw-catatan").value || ""
              };
            }
          });

          if (formValues) {
            // basic validation
            if (!formValues.kode || !formValues.judul) {
              Swal.fire({ icon: "warning", title: "Kode dan Judul wajib" });
              return;
            }

            // persist via API
            try {
              await API.addStock(formValues);
              await this.loadData();
              Swal.fire({ icon: "success", title: "Berhasil ditambahkan" });
            } catch (err) {
              console.error(err);
              Swal.fire({ icon: "error", title: "Gagal menambah stok" });
            }
          }
        },

        async editItem(item) {
          const { value: formValues } = await Swal.fire({
            title: "Edit Bahan Ajar",
            html:
              `<input id="sw-kode" class="swal2-input" placeholder="Kode MK" value="${item.kode}" disabled>` +
              `<input id="sw-judul" class="swal2-input" placeholder="Judul" value="${item.judul}">` +
              `<input id="sw-kategori" class="swal2-input" placeholder="Kategori" value="${item.kategori}">` +
              `<input id="sw-upbjj" class="swal2-input" placeholder="UPBJJ" value="${item.upbjj}">` +
              `<input id="sw-lokasi" class="swal2-input" placeholder="Lokasi Rak" value="${item.lokasiRak}">` +
              `<input id="sw-harga" type="number" class="swal2-input" placeholder="Harga" value="${item.harga}">` +
              `<input id="sw-qty" type="number" class="swal2-input" placeholder="Jumlah" value="${item.qty}">` +
              `<input id="sw-safety" type="number" class="swal2-input" placeholder="Safety" value="${item.safety}">` +
              `<textarea id="sw-catatan" class="swal2-textarea" placeholder="Catatan HTML (optional)">${item.catatanHTML || ""}</textarea>`,
            focusConfirm: false,
            preConfirm: () => {
              return {
                judul: document.getElementById("sw-judul").value.trim(),
                kategori: document.getElementById("sw-kategori").value.trim(),
                upbjj: document.getElementById("sw-upbjj").value.trim(),
                lokasiRak: document.getElementById("sw-lokasi").value.trim(),
                harga: Number(document.getElementById("sw-harga").value) || 0,
                qty: Number(document.getElementById("sw-qty").value) || 0,
                safety: Number(document.getElementById("sw-safety").value) || 0,
                catatanHTML: document.getElementById("sw-catatan").value || ""
              };
            }
          });

          if (formValues) {
            try {
              await API.updateStock(item.kode, formValues);
              await this.loadData();
              Swal.fire({ icon: "success", title: "Berhasil diupdate" });
            } catch (err) {
              console.error(err);
              Swal.fire({ icon: "error", title: "Gagal update stok" });
            }
          }
        },

        async deleteItem(item) {
          const res = await Swal.fire({
            title: `Hapus ${item.judul}?`,
            text: "Data akan terhapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal"
          });
          if (res.isConfirmed) {
            try {
              await API.deleteStock(item.kode);
              await this.loadData();
              Swal.fire({ icon: "success", title: "Terhapus" });
            } catch (err) {
              console.error(err);
              Swal.fire({ icon: "error", title: "Gagal menghapus" });
            }
          }
        },

        // keyboard shortcut
        onKeydown(e) {
          if (e.key === "Escape") this.resetFilter();
          if (e.key === "Enter") {
            // if focused inside search, perform nothing special (handle by v-model)
          }
        },

        focusSearch() {
          // intentionally small helper
        }
      },
      mounted() {
        this.loadData();
        window.addEventListener("keydown", this.onKeydown);
      },
      unmounted() {
        window.removeEventListener("keydown", this.onKeydown);
      }
    };
  }

  // expose factory to global so app.js can call it yess :)
  global.createStockComponent = createStockComponent;
})(window);
