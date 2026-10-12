[🚀 **Buka Aplikasi — SIA Realisasi Anggaran Event**](https://ikhbarnugraha.github.io/SIA-Realisasi-Anggaran-Event/)

# Sistem Informasi Akuntansi Realisasi Anggaran Event Kepanitiaan Berbasis Web

Aplikasi berbasis web untuk membantu panitia dalam mengelola anggaran kegiatan, mencatat realisasi pengeluaran, memantau sisa anggaran, melakukan approval transaksi, serta menyusun laporan realisasi anggaran secara terstruktur.

## 📌 Deskripsi Proyek

Sistem Informasi Akuntansi (SIA) Realisasi Anggaran Event Kepanitiaan dikembangkan untuk meningkatkan efektivitas dan transparansi pengelolaan keuangan dalam sebuah acara atau kegiatan kepanitiaan.

Aplikasi ini mengintegrasikan perencanaan anggaran dengan pencatatan transaksi realisasi sehingga pengguna dapat memantau penggunaan dana dan membandingkan anggaran yang direncanakan dengan pengeluaran aktual.

## ✨ Fitur Utama

- **Dashboard** — Menampilkan ringkasan jumlah event, total anggaran, total realisasi, sisa anggaran, dan persentase realisasi.
- **Manajemen Event** — Menambah, melihat, mengubah, dan menghapus data kegiatan.
- **Manajemen Anggaran** — Mengelola anggaran kegiatan berdasarkan kategori dan item pengeluaran.
- **Realisasi Anggaran** — Mencatat transaksi pengeluaran yang berkaitan dengan anggaran kegiatan.
- **Approval Transaksi** — Memfasilitasi proses persetujuan atau penolakan transaksi realisasi.
- **Validasi Anggaran** — Membantu mencegah pencatatan realisasi yang melebihi sisa anggaran.
- **Laporan Realisasi** — Menyajikan perbandingan anggaran, realisasi, sisa anggaran, dan status penggunaan dana.
- **Ekspor Data** — Mendukung ekspor laporan ke format CSV dan pencetakan laporan.

## 🛠️ Teknologi yang Digunakan

- HTML5 — Struktur halaman aplikasi.
- CSS3 — Desain antarmuka dan efek visual Liquid Glass.
- JavaScript — Logika aplikasi dan interaksi pengguna.
- Supabase — Database PostgreSQL dan integrasi data.
- Git dan GitHub — Pengelolaan versi kode sumber.
- GitHub Pages — Deployment aplikasi secara online.

## 📂 Struktur Proyek

```text
SIA-Realisasi-Anggaran-Event/
├── index.html
├── event.html
├── anggaran.html
├── realisasi.html
├── approval.html
├── laporan.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── event.js
│   ├── anggaran.js
│   ├── realisasi.js
│   ├── approval.js
│   ├── laporan.js
│   └── supabase.js
└── assets/
```

## 🗄️ Database

Aplikasi menggunakan Supabase dengan tabel utama berikut:

| Tabel | Fungsi |
|---|---|
| `profiles` | Menyimpan data profil pengguna jika digunakan. |
| `events` | Menyimpan data kegiatan atau event. |
| `categories` | Menyimpan kategori pengeluaran. |
| `budgets` | Menyimpan data anggaran kegiatan. |
| `budget_details` | Menyimpan rincian item anggaran. |
| `transactions` | Menyimpan transaksi realisasi anggaran. |
| `approvals` | Menyimpan status persetujuan transaksi. |

Selain tabel tersebut, aplikasi menggunakan view `v_realisasi_anggaran` untuk membantu penyajian ringkasan realisasi anggaran.

## ⚙️ Instalasi dan Konfigurasi

### 1. Clone Repository

```bash
git clone https://github.com/ikhbarnugraha/SIA-Realisasi-Anggaran-Event.git
```

### 2. Buka Folder Proyek

```bash
cd SIA-Realisasi-Anggaran-Event
```

### 3. Konfigurasi Supabase

- Buat proyek di [Supabase](https://supabase.com/).
- Siapkan tabel dan view database sesuai kebutuhan aplikasi.
- Buka file `js/supabase.js`.
- Sesuaikan konfigurasi koneksi menggunakan URL proyek Supabase dan publishable key atau `anon` key yang sesuai.

Jangan memasukkan `service_role` key atau kredensial rahasia ke dalam kode frontend maupun repository publik.

### 4. Jalankan Aplikasi

Buka file `index.html` melalui ekstensi Live Server di Visual Studio Code untuk menjalankan aplikasi secara lokal.

## 🌐 Deployment

Aplikasi dipublikasikan menggunakan GitHub Pages.

**Link aplikasi:**

https://ikhbarnugraha.github.io/SIA-Realisasi-Anggaran-Event/

**Repository GitHub:**

https://github.com/ikhbarnugraha/SIA-Realisasi-Anggaran-Event

Setiap perubahan kode dapat diperbarui ke GitHub melalui perintah berikut:

```bash
git add .
git commit -m "Update aplikasi"
git push origin main
```

Pastikan proses deployment GitHub Pages telah selesai agar perubahan terbaru tampil pada aplikasi online.

## 🎯 Tujuan Pengembangan

Pengembangan aplikasi ini bertujuan untuk menyediakan sistem pengelolaan anggaran kepanitiaan yang terintegrasi, mempermudah pemantauan realisasi pengeluaran, membantu pengendalian penggunaan dana, serta meningkatkan transparansi dan akuntabilitas laporan keuangan kegiatan.

## 👨‍💻 Pengembang

**Ikhbar Nugraha**

Proyek Sistem Informasi Akuntansi — Realisasi Anggaran Event Kepanitiaan Berbasis Web.
