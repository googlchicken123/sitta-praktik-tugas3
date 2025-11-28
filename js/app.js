// js/app.js
(async function () {
  async function fetchTemplate(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal fetch template: " + path);
    return await res.text();
  }

  try {
    const tplStock = await fetchTemplate("/templates/stock-table.html");
    const tplTracking = await fetchTemplate("/templates/do-tracking.html");
    const tplHistori = await fetchTemplate("/templates/histori-transaksi.html");


    const stockComp = window.createStockComponent(tplStock);
    const trackingComp = window.createDoTrackingComponent(tplTracking);

    const { createApp } = Vue;

    const app = createApp({
      data() {
        return { tab: "dashboard" };
      },
      methods: {
        setTab(name) { this.tab = name; }
      },
      mounted() {
        try {
          const u = JSON.parse(localStorage.getItem("sitta_user") || "null");
          if (u && u.nama) {
            const el = document.getElementById("greeting");
            if (el) el.textContent = `Halo, ${u.nama}`;
          }
        } catch (e) {}
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            localStorage.removeItem("sitta_user");
            Swal.fire({ icon: "success", title: "Berhasil logout", timer: 700, showConfirmButton: false })
              .then(() => { window.location.href = "index.html"; });
          });
        }
      }
    });

    app.component("ba-stock-table", stockComp);
    app.component("ba-do-tracking", trackingComp);
    app.component("ba-histori-transaksi", createHistoriComponent(tplHistori));

// komponen copyright footer - hidden logic :) - biar ga gampang dicuri tugasnya
app.component("app-footer", {
  template: `
    <footer class="app-footer">
      Made with ❤️ by <strong>Reza Rinaldi – 050601026</strong>
    </footer>
  `
});

    app.mount("#app");
  } catch (err) {
    console.error("Bootstrap error:", err);
    Swal.fire({ icon: "error", title: "Gagal inisialisasi aplikasi", text: err.message });
  }
})();
