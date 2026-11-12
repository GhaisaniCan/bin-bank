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

- **Petugas:** bertanggung jawab memasukkan data hasil penimbangan dan setoran sampah nasabah, mendaftarkan akun nasabah, serta memproses penarikan saldo.
- **Nasabah:** dapat melihat informasi saldo dan mengajukan penarikan saldo.
- **Admin:** bertanggung jawab mengelola harga jenis sampah dan akun pengguna, membatalkan setoran, serta mengakses laporan rekapitulasi.

## Teknologi yang Digunakan

- **Node.js + Express:** sebagai lingkungan dan framework pengembangan backend.
- **MongoDB Atlas + Mongoose:** sebagai database dan ODM untuk pengelolaan data.
- **JWT (jsonwebtoken):** digunakan untuk autentikasi berbasis token.
- **bcrypt:** digunakan untuk melakukan hashing terhadap password pengguna.
- **Postman:** untuk pengujian API secara otomatis.

## Struktur Folder dan File

```
bin-bank/
├── config/
│   └── db.js                        # Koneksi ke MongoDB Atlas
├── controllers/                     # Menangani request dan response API
│   ├── authController.js            # Registrasi admin pertama, login, profil, ganti password
│   ├── jenisSampahController.js     # CRUD jenis sampah dan harga
│   ├── laporanController.js         # Laporan setoran dan penarikan
│   ├── penarikanController.js       # Saldo, riwayat, pengajuan, pemrosesan, dan penyelesaian penarikan
│   └── setoranController.js         # Pencatatan, riwayat, dan pembatalan setoran
├── middlewares/
│   ├── authenticate.js              # Verifikasi token JWT
│   └── authorize.js                 # Pembatasan akses berdasarkan role
├── models/                          # Schema Mongoose
│   ├── BukuBesar.js                 # Ledger mutasi kredit/debit
│   ├── JenisSampah.js               # Katalog jenis sampah dan harga per kg
│   ├── Penarikan.js                 # Pengajuan dan status penarikan
│   ├── Setoran.js                   # Transaksi setoran beserta rincian
│   └── User.js                      # Akun pengguna (petugas, nasabah, admin)
├── postman/                         # Postman Collection
│   ├── BinBank-Akun.postman_collection.json
│   └── BinBank-Modul-C.postman_collection.json
├── routes/                          # Definisi endpoint dan penyisipan middleware
│   ├── jenisSampahRoutes.js
│   ├── laporanRoutes.js
│   ├── nasabahRoutes.js             # Saldo dan riwayat nasabah untuk petugas/admin
│   ├── setoranRoutes.js
│   └── userRoutes.js                # Manajemen akun pengguna
├── services/                        # Logika bisnis utama
│   ├── authService.js
│   ├── laporanService.js
│   ├── ledgerService.js             # Pencatatan mutasi saldo
│   ├── nasabahService.js
│   ├── penarikanService.js
│   ├── setoranService.js
│   └── userService.js
├── tests/
│   └── uji-modul-c.js               # Skrip pengujian Modul C (setoran)
├── utils/
│   ├── AppError.js                  # Kelas error kustom
│   └── angka.js                     # Helper format angka
├── .env.example                     # Contoh variabel environment
├── .gitignore                       # File yang diabaikan Git (node_modules, .env)
├── README.md                        # Dokumentasi proyek
├── package-lock.json                # Versi dependency yang dikunci
├── package.json                     # Dependency dan script npm
└── server.js                        # Entry point aplikasi
```

## Cara Menjalankan Aplikasi

1. Clone repository BinBank.
2. Install seluruh dependency yang dibutuhkan:
   ```bash
   npm install
   ```
3. Buat file `.env` pada root folder. Variabel yang diperlukan dapat dilihat pada file `.env.example`. `MONGO_URI` harus berupa MongoDB Atlas (bukan MongoDB lokal) karena pencatatan setoran memakai transaksi database.
4. Jalankan server dengan mode development:
   ```bash
   npm run dev
   ```
5. Server akan berjalan pada: `http://localhost:5001`

### Akun Pertama

Registrasi publik (`POST /auth/register`) hanya berfungsi selama database belum berisi akun, agar admin pertama dapat dibuat. Setelah itu endpoint tersebut ditolak (403) dan akun baru dibuat lewat `POST /users` oleh Admin (semua peran) atau Petugas (hanya nasabah).

## Model Data Utama

### 1. User
Menyimpan data otentikasi dan identitas pengguna.
| Field      | Tipe   | Keterangan                                                     |
| ---------- | ------ | ---------------------------------------------------------------- |
| `nama`     | String | Nama pengguna, wajib diisi                                       |
| `email`    | String | Email pengguna, wajib diisi dan bersifat unik                    |
| `password` | String | Password pengguna, wajib diisi dan disimpan dalam bentuk hash    |
| `role`     | String | Peran pengguna: `petugas`, `nasabah`, atau `admin`               |
| `saldo`    | Number | Akumulasi saldo (default 0), tidak boleh negatif                 |
| `aktif`    | Boolean | Status akun (default true); akun nonaktif tidak dapat login     |
| `wajibGantiPassword` | Boolean | Penanda password awal/sementara (default false); bila true, pengguna hanya dapat mengganti password |

### 2. JenisSampah
Menyimpan katalog harga dan jenis sampah yang diterima.
| Field        | Tipe    | Keterangan                                                   |
| ------------ | ------- | -------------------------------------------------------------- |
| `nama`       | String  | Nama atau kategori sampah (misal: "Karton", "Plastik Bening")  |
| `hargaPerKg` | Number  | Harga beli per kilogram sampah                                 |
| `aktif`      | Boolean | Status aktif/tidaknya jenis sampah (default true)              |

### 3. Setoran
Mencatat riwayat transaksi penyetoran sampah oleh nasabah.
| Field        | Tipe     | Keterangan                                                   |
| ------------ | -------- | -------------------------------------------------------------- |
| `nasabah`    | ObjectId | Relasi ke model User (Nasabah)                                 |
| `petugas`    | ObjectId | Relasi ke model User (Petugas yang melayani)                   |
| `tanggal`    | Date     | Waktu setoran dilakukan                                        |
| `rincian`    | Array    | Daftar objek sampah (jenis, nama, harga, berat, subtotal)      |
| `totalBerat` | Number   | Total berat seluruh rincian sampah                             |
| `totalNilai` | Number   | Total akumulasi nilai/uang dari setoran                        |
| `status`     | String   | Status setoran: `TERCATAT` atau `DIBATALKAN`                   |
| `catatan`    | String   | Catatan tambahan opsional                                      |
| `alasanBatal`    | String   | Alasan pembatalan (terisi saat dibatalkan)                 |
| `dibatalkanOleh` | ObjectId | Relasi ke model User (Admin yang membatalkan)              |
| `dibatalkanPada` | Date     | Waktu pembatalan                                           |

### 4. Penarikan
Mencatat proses pencairan saldo oleh nasabah.
| Field          | Tipe     | Keterangan                                                   |
| -------------- | -------- | -------------------------------------------------------------- |
| `nasabah`      | ObjectId | Relasi ke model User (Nasabah yang menarik saldo)              |
| `jumlah`       | Number   | Nominal saldo yang ditarik                                     |
| `metode`       | String   | Metode penarikan: `tunai` atau `e-wallet`                      |
| `namaEwallet`  | String   | Nama e-wallet tujuan (wajib bila metode `e-wallet`)            |
| `nomorEwallet` | String   | Nomor e-wallet tujuan, isian bebas (wajib bila metode `e-wallet`) |
| `status`       | String   | `diajukan`, `disetujui`, `ditolak`, atau `selesai`             |
| `diprosesOleh` | ObjectId | Relasi ke model User (Petugas/Admin yang menyetujui atau menolak) |
| `diprosesPada` | Date     | Waktu pengajuan disetujui atau ditolak                         |
| `dikonfirmasiOleh` | ObjectId | Relasi ke model User (Petugas/Admin yang menandai selesai) |
| `dikonfirmasiPada` | Date     | Waktu penarikan ditandai selesai                           |
| `catatanKonfirmasi` | String  | Catatan opsional saat ditandai selesai (misal: referensi transfer) |
| `catatan`      | String   | Alasan penolakan atau catatan transfer                         |

### 5. BukuBesar (Ledger)
Buku besar mutasi keuangan (ACID Transaction) yang tidak bisa dihapus.
| Field          | Tipe     | Keterangan                                                   |
| -------------- | -------- | -------------------------------------------------------------- |
| `nasabah`      | ObjectId | Pemilik rekening (Nasabah)                                     |
| `tipe`         | String   | Jenis arus kas: `KREDIT` (masuk) atau `DEBIT` (keluar)         |
| `jumlah`       | Number   | Nominal transaksi yang terjadi                                 |
| `saldoSetelah` | Number   | Snapshot saldo akhir nasabah setelah transaksi ini             |
| `sumber`       | String   | Asal transaksi: `SETORAN`, `PENARIKAN`, `PEMBATALAN_SETORAN`   |
| `referensiId`  | ObjectId | ID dokumen sumber (ID Setoran / ID Penarikan)                  |
| `keterangan`   | String   | Deskripsi mutasi (misal: "Setoran 2.5 kg")                     |

## Endpoint yang Tersedia

### Modul A (Fondasi & Akun)
| Method | Endpoint              | Deskripsi                                                                  | Autentikasi                  |
| ------ | --------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| POST   | `/auth/register`      | Membuat admin pertama; ditolak (403) bila database sudah berisi akun       | Tidak diperlukan             |
| POST   | `/auth/login`         | Melakukan login dan mendapatkan token JWT; akun nonaktif ditolak           | Tidak diperlukan             |
| GET    | `/auth/profile`       | Menampilkan profil pengguna yang sedang login                              | Semua Role                   |
| PATCH  | `/auth/password`      | Mengganti password sendiri (`passwordLama`, `passwordBaru`); mengembalikan token baru | Semua Role        |
| GET    | `/users`              | Daftar akun (filter `?role=`); Petugas hanya melihat nasabah               | **Admin**, **Petugas**       |
| POST   | `/users`              | Membuat akun; Petugas hanya boleh membuat akun nasabah                     | **Admin**, **Petugas**       |
| PATCH  | `/users/:id/password` | Mereset password pengguna (`passwordBaru`, minimal 8 karakter)             | **Admin**                    |
| PATCH  | `/users/:id/status`   | Mengaktifkan atau menonaktifkan akun (`aktif`: `true` atau `false`)        | **Admin**                    |

### Modul B (Harga & Laporan)
| Method | Endpoint              | Deskripsi                                           | Autentikasi                  |
| ------ | ---------------------- | ------------------------------------------------------ | ------------------------------- |
| GET    | `/jenis-sampah`       | Melihat daftar katalog harga sampah                 | Bebas                           |
| POST   | `/jenis-sampah`       | Menambah jenis sampah baru                          | **Admin**                       |
| PUT    | `/jenis-sampah/:id`   | Mengubah detail harga sampah                        | **Admin**                       |
| GET    | `/laporan`            | Rekap setoran, penarikan, saldo, setoran per jenis sampah, dan penarikan per status (filter `?dari=&sampai=`) | **Admin** |

### Modul C (Setoran)
| Method | Endpoint           | Deskripsi                                           | Autentikasi                  |
| ------ | ------------------- | ------------------------------------------------------ | ------------------------------- |
| POST   | `/setoran`         | Mencatat setoran nasabah baru                       | **Petugas**                     |
| GET    | `/setoran`         | Melihat daftar riwayat setoran                      | **Petugas**, **Admin**          |
| GET    | `/setoran/:id`     | Melihat detail rincian satu setoran                 | **Petugas**, **Admin**          |
| PATCH  | `/setoran/:id/batal` | Membatalkan setoran (`alasan`); saldo nasabah dikurangi lewat buku besar | **Admin**     |

### Modul D (Saldo & Penarikan)
| Method | Endpoint                  | Deskripsi                                           | Autentikasi                  |
| ------ | -------------------------- | ------------------------------------------------------ | ------------------------------- |
| GET    | `/penarikan`              | Daftar penarikan, bawaan status `diajukan` (`?status=` diajukan/disetujui/ditolak/selesai/semua, `?nasabah=`, `?dari=`, `?sampai=`, `?halaman=`, `?limit=`) | **Petugas**, **Admin** |
| GET    | `/penarikan/saya`         | Daftar pengajuan penarikan milik nasabah sendiri (`?status=`, `?halaman=`, `?limit=`) | **Nasabah** |
| GET    | `/penarikan/saldo`        | Cek saldo, saldo tertahan, dan saldo tersedia milik nasabah sendiri | **Nasabah** |
| GET    | `/penarikan/riwayat`      | Riwayat mutasi buku besar milik nasabah             | **Nasabah**                     |
| POST   | `/penarikan/ajukan`       | Mengajukan penarikan (`jumlah` bilangan bulat, `metode`); untuk `e-wallet` wajib `namaEwallet` dan `nomorEwallet`; tidak boleh melebihi saldo tersedia | **Nasabah** |
| PATCH  | `/penarikan/:id/proses`   | Menyetujui (`keputusan: setuju`, saldo didebit) atau menolak (`keputusan: tolak`, `catatan` alasan wajib) pengajuan | **Petugas**, **Admin** |
| PATCH  | `/penarikan/:id/selesai`  | Menandai penarikan `disetujui` sebagai `selesai` (dana sudah diserahkan; `catatan` opsional) | **Petugas**, **Admin** |
| GET    | `/nasabah/:id/saldo`      | Melihat saldo seorang nasabah                       | **Petugas**, **Admin**          |
| GET    | `/nasabah/:id/riwayat`    | Melihat riwayat mutasi seorang nasabah              | **Petugas**, **Admin**          |

### Alur Status Penarikan

```
diajukan --(proses: setuju)--> disetujui --(selesai)--> selesai
    |
    +--(proses: tolak)--> ditolak
```

Saldo tersedia adalah saldo dikurangi total pengajuan berstatus `diajukan`, dan pengajuan tidak boleh melebihi saldo tersedia. Saldo nasabah didebit saat penarikan disetujui; persetujuan dan pencatatan buku besar berjalan dalam satu transaksi. Status `selesai` hanya dapat dicapai dari `disetujui`, dan setiap perubahan status mencatat petugas serta waktunya.

## Autentikasi

Setelah berhasil melakukan login, pengguna akan memperoleh **JWT token**. Token tersebut harus disertakan pada header setiap request yang memerlukan autentikasi dengan format berikut:

```text
Authorization: Bearer <token>
```

Akun yang baru dibuat lewat `POST /users` atau yang passwordnya direset admin memiliki penanda wajib ganti password. Selama penanda itu aktif, token hanya dapat dipakai untuk `PATCH /auth/password`; endpoint lain dijawab 403. Setelah password berhasil diganti, respons memberi token baru tanpa pembatasan.

## Aturan Kontribusi

Untuk menjaga konsistensi dan keteraturan proses pengembangan, setiap anggota kelompok wajib mengikuti aturan kontribusi berikut:

- **Branch:** menggunakan format `feature/nama-fitur`, misalnya `feature/setoran`.
- **Commit message:** ditulis secara singkat, jelas, dan menggambarkan perubahan yang dilakukan.
- **Sinkronisasi repository:** sebelum memulai pekerjaan, lakukan `git pull` untuk memastikan branch telah tersinkronisasi dengan branch `main`.
- **Push:** setiap anggota melakukan push hasil pekerjaan ke branch masing-masing.
- **Pull Request:** setelah pekerjaan selesai, buat Pull Request dari branch fitur menuju branch `main`.
- **Code Review:** setiap Pull Request diharapkan memperoleh review dari minimal satu anggota kelompok lainnya sebelum dilakukan merge.
- **Keamanan konfigurasi:** file `.env` **tidak diperbolehkan untuk di-commit** ke repository. Pastikan file tersebut telah tercantum dalam `.gitignore`.

## Link Laporan
[Laporan M1](https://drive.google.com/drive/folders/17cAvS_kADuyAK6d_yNE4U3xiEHBzJa7F?usp=sharing)