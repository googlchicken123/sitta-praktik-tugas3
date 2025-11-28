// js/components/do-tracking.js
(function (global) {
  function createDoTrackingComponent(template) {
    return {
      template: template,
      data() {
        return {
          list: [],            // tracking list
          paketList: [],       // dari dataMaster.json
          ekspedisiList: ["JNE","J&T","POS","SICEPAT","TIKI"],
          form: {
            noDO: "",
            nim: "",
            nama: "",
            ekspedisi: "",
            paketKode: "",
            tanggalKirim: "",
            total: 0
          },

          // tambahan baru untuk timeline modal
          showTimelineModal: false,
          currentDO: {},
          timelineInput: "",

          q: ""
        };
      },

      computed: {
        filteredList() {
          if (!this.q || !this.q.trim()) return this.list;
          const ql = this.q.toLowerCase();
          return this.list.filter(d =>
            (d.noDO || "").toLowerCase().includes(ql) ||
            (d.nim || "").toLowerCase().includes(ql) ||
            (d.nama || "").toLowerCase().includes(ql)
          );
        }
      },

      methods: {

        // ======================================================
        // LOAD DATA
        // ======================================================
        async loadData() {
          try {
            const master = await API.getAll();
            this.paketList = master.paket || [];
            this.list = await API.getTracking() || [];

            // compute total dari harga paket
            this.list = this.list.map(it => {
              if (!it.total && it.paket) {
                const p = this.paketList.find(x => x.kode === it.paket);
                if (p) it.total = p.harga;
              }
              return it;
            });

            this.ensureFormDo();

          } catch (err) {
            console.error("load tracking err", err);
            Swal.fire({ icon: "error", title: "Gagal memuat data tracking" });
          }
        },

        ensureFormDo() {
          if (!this.form.noDO || this.form.noDO.trim() === "") {
            this.form.noDO = this.generateNoDO();
          }
        },

        generateNoDO() {
          const year = new Date().getFullYear();
          const existing = this.list
            .map(d => d.noDO)
            .filter(Boolean)
            .filter(n => n.indexOf(`DO${year}`) === 0);

          const seqs = existing.map(n => Number(n.split("-")[1]) || 0);

          const next = seqs.length ? Math.max(...seqs) + 1 : 1;

          return `DO${year}-${String(next).padStart(4, "0")}`;
        },

        formatRp(v) {
          if (!v) return "Rp 0";
          return "Rp " + Number(v).toLocaleString("id-ID");
        },

        // ======================================================
        // ADD DO
        // ======================================================
        async addDO() {
          if (!this.form.nim || !this.form.nama || !this.form.paketKode ||
              !this.form.ekspedisi || !this.form.tanggalKirim) {

            Swal.fire({ icon: "warning", title: "Lengkapi semua field" });
            return;
          }

          const paket = this.paketList.find(p => p.kode === this.form.paketKode);
          const total = paket ? paket.harga : 0;

          const newDO = {
            noDO: this.form.noDO,
            nim: this.form.nim,
            nama: this.form.nama,
            ekspedisi: this.form.ekspedisi,
            paket: this.form.paketKode,
            tanggalKirim: this.form.tanggalKirim,
            total: total,
            perjalanan: [
              { waktu: new Date().toISOString(), keterangan: "DO dibuat" }
            ]
          };

          try {
            await API.addTracking(newDO);
            await this.loadData();

            Swal.fire({ icon: "success", title: "DO berhasil ditambahkan" });

            this.resetForm();
            this.form.noDO = this.generateNoDO();

          } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Gagal menambahkan DO" });
          }
        },

        resetForm() {
          this.form.nim = "";
          this.form.nama = "";
          this.form.ekspedisi = "";
          this.form.paketKode = "";
          this.form.tanggalKirim = "";
        },

        // ======================================================
        // EDIT DO
        // ======================================================
        async editDO(item) {
          const { value: values } = await Swal.fire({
            title: `Edit ${item.noDO}`,
            html:
              `<input id="ed-nim" class="swal2-input" placeholder="NIM" value="${item.nim || ''}">` +
              `<input id="ed-nama" class="swal2-input" placeholder="Nama" value="${item.nama || ''}">` +
              `<select id="ed-ekspedisi" class="swal2-select">${this.ekspedisiList.map(e => `<option ${e===item.ekspedisi?'selected':''}>${e}</option>`).join('')}</select>` +
              `<select id="ed-paket" class="swal2-select">${this.paketList.map(p => `<option value="${p.kode}" ${p.kode===item.paket?'selected':''}>${p.kode} - ${p.nama}</option>`).join('')}</select>` +
              `<input id="ed-tgl" type="date" class="swal2-input" value="${item.tanggalKirim || ''}">`,

            focusConfirm: false,

            preConfirm: () => ({
              nim: document.getElementById("ed-nim").value.trim(),
              nama: document.getElementById("ed-nama").value.trim(),
              ekspedisi: document.getElementById("ed-ekspedisi").value,
              paket: document.getElementById("ed-paket").value,
              tanggalKirim: document.getElementById("ed-tgl").value
            })
          });

          if (values) {
            try {
              const paket = this.paketList.find(p => p.kode === values.paket);

              const patch = {
                nim: values.nim,
                nama: values.nama,
                ekspedisi: values.ekspedisi,
                paket: values.paket,
                tanggalKirim: values.tanggalKirim,
                total: paket ? paket.harga : item.total
              };

              await API.updateTracking(item.noDO, patch);
              await this.loadData();

              Swal.fire({ icon: "success", title: "Berhasil update DO" });

            } catch (err) {
              console.error(err);
              Swal.fire({ icon: "error", title: "Gagal update DO" });
            }
          }
        },

        // ======================================================
        // DELETE DO
        // ======================================================
        async deleteDO(item) {
          const res = await Swal.fire({
            title: `Hapus ${item.noDO}?`,
            text: "Data akan terhapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal"
          });

          if (!res.isConfirmed) return;

          try {
            await API.deleteTracking(item.noDO);
            await this.loadData();

            Swal.fire({ icon: "success", title: "Terhapus" });

          } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Gagal menghapus" });
          }
        },

        // ======================================================
        // TIMELINE — STYLE B (MODAL)
        // ======================================================
        openProgressModal(item) {
          this.currentDO = JSON.parse(JSON.stringify(item));
          this.timelineInput = "";
          this.showTimelineModal = true;
        },

        closeTimelineModal() {
          this.showTimelineModal = false;
        },

        formatTanggalWaktu(iso) {
          const d = new Date(iso);
          return d.toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
          });
        },

        async submitTimeline() {
          if (!this.timelineInput.trim()) {
            Swal.fire({ icon: "warning", title: "Isi keterangan progress" });
            return;
          }

          const entry = {
            waktu: new Date().toISOString(),
            keterangan: this.timelineInput.trim()
          };

          const updated = (this.currentDO.perjalanan || []).concat([entry]);

          try {
            await API.updateTracking(this.currentDO.noDO, { perjalanan: updated });
            await this.loadData();

            this.timelineInput = "";
            this.currentDO.perjalanan = updated;

            Swal.fire({ icon: "success", title: "Progress ditambahkan" });

          } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Gagal menambahkan progress" });
          }
        },

        // ======================================================
        // SEARCH KEY EVENTS
        // ======================================================
        onSearchEnter() {},

        resetSearch() {
          this.q = "";
          this.$refs.searchInput && this.$refs.searchInput.focus();
        },

        onKeydown(e) {
          if (e.key === "Escape") this.resetSearch();
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

  global.createDoTrackingComponent = createDoTrackingComponent;
})(window);
