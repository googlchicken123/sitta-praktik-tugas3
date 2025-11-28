// js/auth.js
console.log("Auth script loaded");

// Load users dari JSON
async function loadUsers() {
    try {
        const res = await fetch("/data/users.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat users.json");
        return await res.json();
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Gagal Load Data Pengguna",
            text: "Terjadi masalah saat memuat data pengguna."
        });
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("loginForm");
    const forgetLink = document.getElementById("forgetLink");
    const registerLink = document.getElementById("registerLink");

    const users = await loadUsers();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            Swal.fire({
                icon: "warning",
                title: "Lengkapi Data",
                text: "Email dan password wajib diisi."
            });
            return;
        }

        const found = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!found) {
            Swal.fire({
                icon: "error",
                title: "Login Gagal",
                text: "Email atau password salah."
            });
            return;
        }

        // simpan session
        localStorage.setItem("sitta_user", JSON.stringify(found));

        Swal.fire({
            icon: "success",
            title: "Berhasil Masuk",
            timer: 1000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = "dashboard.html"; // redirect setelah login
        }, 1000);
    });

    // lupa password
    forgetLink.addEventListener("click", (e) => {
        e.preventDefault();
        Swal.fire({
            icon: "info",
            title: "Hubungi Admin",
            text: "Silakan hubungi admin UT jika lupa password."
        });
    });

    // link registrasi
    registerLink.addEventListener("click", (e) => {
        e.preventDefault();
        Swal.fire({
            icon: "info",
            title: "Registrasi Ditutup",
            text: "Fitur ini belum tersedia di sistem."
        });
    });
});
