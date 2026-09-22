# BinBank: Bank Sampah Digital

**BinBank** merupakan aplikasi digitalisasi pengelolaan bank sampah tingkat RW yang dirancang untuk membantu pencatatan setoran sampah, pengelolaan saldo nasabah, serta proses penarikan saldo secara terstruktur dan terintegrasi.

## Anggota Kelompok

| Nama                            | NIM                 | 
| --------------------------------| ------------------- | 
| **Muhammad Falah Aufa Anggara** | 24/540500/TK/59995  | 
| **Naufal Dzaky**                | 24/543697/TK/60431  | 
| **Violin Mulya Putra**          | 24/534192/TK/59201  | 
| **Ghaisan Rifqi Kamiel**        | 24/540091/TK/59899  | 

## Deskripsi Aplikasi

Bank sampah tingkat RW pada umumnya masih melakukan pencatatan setoran nasabah secara manual menggunakan buku tabungan. Data yang dicatat meliputi jenis sampah, berat sampah, dan nilai setoran yang kemudian diakumulasikan menjadi saldo nasabah. Metode pencatatan secara manual memiliki risiko terjadinya kesalahan perhitungan serta kerusakan atau kehilangan data.

**BinBank** dikembangkan untuk mendigitalisasi proses tersebut. Melalui aplikasi ini, petugas dapat mencatat hasil penimbangan dan setoran nasabah secara digital. Nilai setoran akan diakumulasikan secara otomatis menjadi saldo nasabah. Selain itu, nasabah dapat memantau saldo yang dimiliki serta mengajukan permohonan penarikan saldo melalui sistem.

Aplikasi ini memiliki tiga peran pengguna dengan hak akses yang berbeda, yaitu:

- **Petugas:** bertanggung jawab memasukkan data hasil penimbangan dan setoran sampah nasabah.
- **Nasabah:** dapat melihat informasi saldo dan mengajukan penarikan saldo.
- **Admin:** bertanggung jawab mengelola harga jenis sampah serta mengakses laporan.

## Teknologi yang Digunakan

- **Node.js + Express:** sebagai lingkungan dan framework pengembangan backend.
- **MongoDB Atlas + Mongoose:** sebagai database dan ODM untuk pengelolaan data.
- **JWT (jsonwebtoken):** digunakan untuk autentikasi berbasis token.
- **bcrypt:** digunakan untuk melakukan hashing terhadap password pengguna.

## Struktur Folder

```text
config/         : Konfigurasi server dan koneksi database
controllers/    : Menangani routing dari endpoint ke service
services/       : Menangani logika bisnis dan fitur utama aplikasi
models/         : Mendefinisikan schema MongoDB menggunakan Mongoose
middlewares/    : Menangani autentikasi, otorisasi, dan error handling
dto/            : Mendefinisikan struktur request dan response API
server.js       : Entry point aplikasi
```

## Cara Menjalankan Aplikasi

1. Clone repository BinBank.
2. Install seluruh dependency yang dibutuhkan:

   ```bash
   npm install
   ```

3. Buat file `.env` pada root folder. Variabel yang diperlukan dapat dilihat pada file `.env.example`.
4. Jalankan server dengan perintah:

   ```bash
   node server.js
   ```

5. Server akan berjalan pada:

   ```text
   http://localhost:5001
   ```

## Model Data

### User

| Field      | Tipe   | Keterangan                                                     |
| ---------- | ------ | ---------------------------------------------------------------- |
| `nama`     | String | Nama pengguna, wajib diisi                                       |
| `email`    | String | Email pengguna, wajib diisi dan bersifat unik                    |
| `password` | String | Password pengguna, wajib diisi dan disimpan dalam bentuk hash    |
| `role`     | String | Peran pengguna: `petugas`, `nasabah`, atau `admin`               |

## Endpoint yang Tersedia

| Method | Endpoint           | Deskripsi                                           | Autentikasi                  |
| ------ | ------------------- | ------------------------------------------------------ | ------------------------------- |
| POST   | `/auth/register`   | Melakukan registrasi pengguna baru                  | Tidak diperlukan              |
| POST   | `/auth/login`      | Melakukan login dan menghasilkan token autentikasi  | Tidak diperlukan              |
| GET    | `/auth/profile`    | Menampilkan profil pengguna yang sedang login       | Bearer Token                   |
| GET    | `/auth/admin-only` | Contoh endpoint yang hanya dapat diakses oleh admin | Bearer Token (`role: admin`)   |

> **Catatan:** Daftar endpoint akan diperbarui secara berkala seiring dengan penyelesaian Modul B: Harga & Laporan, Modul C: Setoran & Buku Besar, serta Modul D: Saldo & Penarikan.

## Autentikasi

Setelah berhasil melakukan login, pengguna akan memperoleh **JWT token**. Token tersebut harus disertakan pada header setiap request yang memerlukan autentikasi dengan format berikut:

```text
Authorization: Bearer <token>
```

## Aturan Kontribusi

Untuk menjaga konsistensi dan keteraturan proses pengembangan, setiap anggota kelompok wajib mengikuti aturan kontribusi berikut:

- **Branch:** menggunakan format `feature/nama-fitur`, misalnya:
  - `feature/setoran`
  - `feature/laporan-pdf`
- **Commit message:** ditulis secara singkat, jelas, dan menggambarkan perubahan yang dilakukan.
- **Sinkronisasi repository:** sebelum memulai pekerjaan, lakukan `git pull` untuk memastikan branch telah tersinkronisasi dengan branch `main`.
- **Push:** setiap anggota melakukan push hasil pekerjaan ke branch masing-masing.
- **Pull Request:** setelah pekerjaan selesai, buat Pull Request dari branch fitur menuju branch `main`.
- **Code Review:** setiap Pull Request diharapkan memperoleh review dari minimal satu anggota kelompok lainnya sebelum dilakukan merge.
- **Keamanan konfigurasi:** file `.env` **tidak diperbolehkan untuk di-commit** ke repository. Pastikan file tersebut telah tercantum dalam `.gitignore`.