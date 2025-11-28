// js/services/api.js
// ==============================================
// SISTEM DATA SITTA-UT LocalStorage + JSON Bootstrap
// ==============================================

const API = (function () {
  const LS_KEY = "sitta_data_v1";

  async function loadJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal load ${path}`);
    return await res.json();
  }

  async function loadMaster() {
    const rawLS = localStorage.getItem(LS_KEY);
    if (rawLS) {
      try {
        return JSON.parse(rawLS);
      } catch (e) {
        console.warn("LocalStorage corrupt, reload JSON");
      }
    }

    const data = await loadJson("/data/dataMaster.json");
    saveMaster(data);
    return data;
  }

  function saveMaster(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  // ==============================================
  // GETTERS
  // ==============================================

  async function getUsers() {
    return await loadJson("/data/users.json");
  }

  async function getAll() {
    return await loadMaster();
  }

  async function getStocks() {
    const d = await loadMaster();
    return d.stok || [];    
  }

  async function getLegacyItems() {
    const d = await loadMaster();
    return d.legacyItems || [];
  }

  async function getTracking() {
    const d = await loadMaster();
    return d.tracking || [];
  }

  // ==============================================
  // TRACKING MUTATORS
  // ==============================================

  async function addTracking(item) {
    const d = await loadMaster();
    d.tracking.push(item);
    saveMaster(d);
  }

  async function updateTracking(noDO, patch) {
    const d = await loadMaster();
    const idx = d.tracking.findIndex(t => t.noDO === noDO);
    if (idx !== -1) {
      d.tracking[idx] = { ...d.tracking[idx], ...patch };
      saveMaster(d);
    }
  }

  // HAPUS TRACKING
  async function deleteTracking(noDO) {
    const d = await loadMaster();
    d.tracking = d.tracking.filter(t => t.noDO !== noDO);
    saveMaster(d);
  }

  // ==============================================
  // STOCK MUTATORS
  // ==============================================

  async function addStock(item) {
    const d = await loadMaster();
    d.stok.push(item);   
    saveMaster(d);
  }

  async function updateStock(kode, patch) {
    const d = await loadMaster();
    const idx = d.stok.findIndex(s => s.kode === kode);
    if (idx !== -1) {
      d.stok[idx] = { ...d.stok[idx], ...patch };
      saveMaster(d);
    }
  }

  async function deleteStock(kode) {
    const d = await loadMaster();
    d.stok = d.stok.filter(s => s.kode !== kode);
    saveMaster(d);
  }

  // ==============================================
  // EXPORT API
  // ==============================================

  return {
    getUsers,
    getAll,
    getStocks,
    getLegacyItems,
    getTracking,

    addTracking,
    updateTracking,
    deleteTracking, 

    addStock,
    updateStock,
    deleteStock
  };
})();
