## SITTA – Tugas Praktik 3
**Disusun oleh:** Reza Rinaldi  
**NIM:** 050601026  
**UPJJ:** Surabaya  
**Program Studi:** Sistem Informasi  

**Pemrograman Berbasis Web – STSI4209**  
Universitas Terbuka  

Tugas Praktik 3 ini merupakan kelanjutan dari tugas sebelumnya dan berfokus pada implementasi **sistem pengorganisasian kode menggunakan JavaScript Framework Vue.js**. Pada tugas ini mahasiswa diminta untuk menerapkan konsep **Vue Component** dan **Template** dalam membangun antarmuka serta alur interaktif untuk aplikasi pemesanan bahan ajar SITTA.  

Pengembangan ini bertujuan untuk mendukung kebutuhan proses pemesanan dan distribusi bahan ajar di Universitas Terbuka melalui arsitektur aplikasi yang lebih modular, terstruktur, dan mudah dirawat.

> **Catatan:** Untuk kebutuhan simulasi realtime aplikasi SITTA, seluruh struktur kode telah saya host melalui GitHub Pages.  
> Silakan mengakses hasil running aplikasi pada link berikut:  
> **https://googlchicken123.github.io/sitta-praktik-tugas3/**

> Username: admin@ut.ac.id, Password: admin123  

---

### Phase 1 – Analisis Struktur HTML Lama

#### Tujuan Phase

Phase ini bertujuan mengaudit struktur project berbasis HTML lama untuk memahami pola halaman, duplikasi elemen, serta potensi modularisasi. Tahapan ini menjadi landasan sebelum masuk ke proses refraktor SPA Vue.

  

#### Kondisi Awal

Pada Tugas 1 dan 2 sebelumnya project menggunakan struktur multi-page:

- index.html
- stock.html
- tracking.html
- dashboard.html
- dan beberapa file .js untuk fungsinya

Setiap halaman bekerja secara mandiri dan menggunakan full page reload.

  

#### Temuan Utama
-  **Duplikasi elemen** seperti header, footer, card layout.
-  **Tidak ada modularisasi** karena semuanya hard-coded di setiap halaman.
-  **Tidak ada routing client-side** sehingga navigasi kurang efisien.
-  **Fetch data masih menempel di halaman** dan tidak dipisahkan dalam service.
-  **Banyak peluang komponenisasi** untuk diubah menjadi komponen Vue.

  

#### Hasil Output

- Mapping struktur lama
- Daftar elemen yang akan diubah menjadi komponen Vue
- Identifikasi bagian yang disederhanakan saat migrasi ke SPA

  

---

#### Benefit Pendekatan SPA (Single Page Application)

- **Reusability tinggi** karena komponen dibuat sekali lalu digunakan di banyak halaman.
- **Maintenance lebih efisien** karena perubahan satu komponen langsung berdampak ke seluruh aplikasi.
- **User experience lebih mulus** karena navigasi berjalan tanpa reload halaman.
- **Struktur project lebih scalable** memudahkan penambahan fitur tanpa membuat banyak file HTML baru.
- **Pemisahan concern lebih bersih** dengan memindahkan logika fetch JSON ke service layer.
- **Siap dideploy ke static hosting** seperti GitHub Pages atau Netlify.

### Phase 2 – Refraktorisasi Struktur Folder ke Arsitektur SPA

#### Tujuan Phase
- Mengonversi struktur HTML lama menjadi pondasi SPA yang lebih modular.
- Menyatukan halaman terpisah menjadi komponen dalam satu aplikasi.
- Memastikan setiap file lama memiliki posisi jelas sebelum masuk proses migrasi SPA.

### Struktur Project

```
root/
├─ dashboard.html
├─ index.html
├─ readme.md
│
├─ assets/
│  ├─ css/
│  │  └─ style.css
│  └─ img/
│     └─ ut2.png
│
├─ data/
│  ├─ dataBahanAjar.json
│  ├─ dataMaster.json
│  └─ users.json
│
├─ js/
│  ├─ app.js
│  ├─ auth.js
│  ├─ components/
│  │  ├─ do-tracking.js
│  │  ├─ histori-transaksi.js
│  │  └─ stock-table.js
│  └─ services/
│     └─ api.js
│
└─ templates/
   ├─ do-tracking.html
   ├─ histori-transaksi.html
   └─ stock-table.html
```
### Phase 3 – Membentuk Komponen Dasar untuk SPA

#### Tujuan Phase
- Mengonversi bagian UI yang berulang menjadi komponen terpisah.
- Menyederhanakan struktur halaman agar mudah dipindahkan ke dalam ekosistem SPA.
- Menentukan komponen mana yang akan menjadi pondasi tampilan utama.

#### Komponen Dasar yang Diidentifikasi
- **Header** – elemen navigasi utama.
- **Footer** – elemen informasi bawah halaman.
- **Stock Table** – tabel stok dari `stock-table.js`.
- **DO Tracking** – form dan tabel tracking dari `do-tracking.js`.
- **Histori Transaksi** – tampilan riwayat dari `histori-transaksi.js`.

#### Hasil Output
- Setiap blok UI dari file HTML dan JS lama sudah dikelompokkan.
- Reduksi duplikasi UI karena komponen akan digunakan ulang di seluruh halaman.

### Phase 4 – Integrasi Data Service dan Mekanisme Fetch JSON

### Tujuan
- Memusatkan seluruh proses pengambilan data ke satu service.
- Memastikan setiap halaman atau komponen mengambil data melalui fungsi terstruktur, bukan langsung dari HTML.
- Menjaga arsitektur SPA tetap bersih dan mudah dirawat.

### Penempatan File Data
- Semua file JSON berada di folder `data/`
  - `dataBahanAjar.json`
  - `dataMaster.json`
  - `users.json`

Folder ini tetap digunakan sebagai sumber data utama yang akan di-fetch melalui service.

### Service Layer (`api.js`)
- Bertugas menangani semua request data.
- Menyediakan fungsi seperti:
  - ambil data master  
  - ambil user  
  - ambil data bahan ajar  
- Logika fetch dipusatkan sehingga komponen tidak lagi melakukan fetch langsung.

### Cara Kerja
- Komponen hanya memanggil fungsi dari service.
- Service mengirim request JSON menggunakan fetch().
- Data dikembalikan ke komponen sebagai hasil.

### Hasil Output
- Alur data lebih terstruktur dan terkontrol.
- Komponen menjadi lebih ringan karena tidak memuat logika fetch.
- Sistem siap dipakai untuk arsitektur SPA yang lebih modular.

### Penutup
Fase ini memastikan seluruh data diakses melalui satu jalur yang konsisten, dengan pondasi service layer yang rapi project siap melangkah ke tahap penyempurnaan berikutnya.