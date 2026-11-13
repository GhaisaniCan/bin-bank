# Design Brief BinBank: Bank Sampah Digital RW

Nov 11, 2026 · @Violin

## 1. Design principles

Tiga aturan ini mengikat setiap screen. Layar yang melanggar salah satunya dikembalikan ke tahap desain, bukan diperbaiki saat coding. Brief ini mengacu pada [PRD BinBank](https://claude.ai/artifact/J65rGY8xWGCiqFDEoe2dQq) (fitur F1 sampai F14, tiga peran, web responsif).

### Aturan 1. Angka adalah produknya

BinBank ada karena saldo di buku tabungan bisa salah hitung dan tidak bisa ditelusuri (PRD bagian 1, G1 dan G2). Orang membuka aplikasi ini untuk melihat angka dan memercayainya, jadi angka mendapat perlakuan paling serius di setiap layar.

- Setiap nilai uang dan berat memakai satuan (Rp, kg), rata kanan, dan angka bertipe tabular supaya digit sejajar.
- Setiap angka bisa ditelusuri satu ketukan ke sumbernya: saldo ke riwayat mutasi, nilai setoran ke rincian jenis, berat, dan harga.
- Total diberi garis ganda di atasnya, seperti baris jumlah di buku kas.
- **Uji:** tidak ada angka tanpa satuan. Dua angka di kolom yang sama sejajar digit demi digit. Saldo di Beranda bisa dibuka sampai ke baris mutasi.

### Aturan 2. Aksi yang menulis ke buku besar dibaca dulu, baru dikonfirmasi

Setoran, persetujuan penarikan, dan pembatalan tidak bisa diedit atau dihapus; koreksi hanya lewat entri pembalik (PRD F4.10, F5.4, F10.4). Salah ketik 250 kg untuk 2,5 kg tetap lolos validasi, jadi satu-satunya penjaga adalah mata petugas.

- Aksi tersebut selalu melewati ringkasan berisi nama, rincian, dan total dalam rupiah.
- Tombol utamanya menyebut hasilnya, misalnya "Simpan setoran Rp 25.000", bukan "Simpan" atau "OK".
- Aksi merusak (Tolak, Batalkan setoran) memakai tombol berbentuk lain dan wajib alasan.
- Tombol langsung nonaktif saat proses berjalan, supaya tidak ada setoran ganda (PRD bagian 8).
- **Uji:** tidak ada tombol aksi permanen bertuliskan Simpan, OK, atau Ya tanpa objek. Jarak antara tombol konfirmasi dan tombol batal minimal 16 px.

### Aturan 3. Terbaca di luar ruangan, oleh siapa saja, di ponsel murah

Petugas bekerja di lokasi penimbangan dan nasabah adalah warga satu RW dengan usia dan kemahiran digital yang beragam (PRD bagian 2). Asumsi bahwa lokasi penimbangan terbuka dan terkena cahaya terang belum dikonfirmasi; lihat bagian Asumsi.

- Teks isi dan angka berkontras minimal 7:1; teks pendukung minimal 4,5:1.
- Ukuran huruf isi 16 px ke atas. Target sentuh minimal 48 × 48 px.
- Ikon tidak pernah berdiri sendiri; selalu ada kata di sebelahnya.
- Status selalu terdiri dari kata, bentuk, dan warna. Warna saja tidak pernah cukup.
- Semua layar dirancang mulai dari lebar 360 px.
- **Uji:** cetak layar dalam skala abu-abu, semua status harus tetap bisa dibedakan. Tidak ada scroll horizontal di 360 px.

## 2. Visual direction

### Konsep: Buku Besar

BinBank menggantikan buku tabungan kertas yang sudah dikenal warga RW. Kepercayaan terhadap angka di layar paling mudah lahir kalau layar itu terlihat seperti dokumen pembukuan yang rapi, bukan seperti aplikasi dompet digital. Maka seluruh antarmuka meminjam bahasa buku kas: kertas putih, tinta gelap, garis tipis, kolom angka rata kanan, total bergaris ganda, dan status yang tampil seperti cap.

**Mood:** tenang, rapi, jujur, sedikit hangat. Seperti halaman buku kas RW yang diisi dengan teliti, bukan seperti iklan. Tidak ada kejutan visual; kejutan di layar yang menyangkut uang adalah kesalahan.

### Referensi

Referensi diambil dari benda nyata yang dilihat warga setiap hari, bukan dari produk digital lain.

- **Buku tabungan dan buku kas cetak:** kolom Tanggal, Keterangan, Kredit, Debit, Saldo yang dipisah garis tipis. Dijadikan dasar tabel mutasi (PRD F8).
- **Nota kontan dan kuitansi:** satu halaman ringkas, rincian baris, garis ganda sebelum jumlah, ruang untuk cap. Dijadikan dasar layar konfirmasi dan bukti setoran.
- **Layar timbangan digital:** angka besar, satuan jelas, tidak ada hiasan. Dijadikan dasar layar input berat petugas.
- **Formulir kas RT/RW:** kolom diberi label, isian jelas, tanda tangan di bawah. Dijadikan dasar formulir pendaftaran dan penarikan.
- **Desain awal tim dan warna kemasan:** hijau zaitun dan hijau muda dari desain awal tim dijadikan palet utama; cokelat kardus, biru plastik PET, dan merah bata dijadikan dasar warna status (bagian 3).

### Bahan visual yang dipakai

- Latar putih (`putih`) dengan teks tinta gelap (`ink`). Bidang hijau muda (`olive-50`, `olive-100`) hanya untuk area sekunder, item terpilih, dan hiasan.
- Garis tipis 1 px sebagai pemisah utama. Bayangan hanya untuk lapisan yang melayang (menu, dialog, toast).
- Seluruh teks memakai Outfit; angka memakai angka tabular Outfit (`tnum`) supaya digit sejajar.
- Status tampil sebagai **cap**: kata kapital dalam bingkai tipis berwarna, dengan bentuk ikon yang berbeda per status (bagian 7, komponen Cap Status).
- Pictogram jenis sampah (botol, kardus, kaleng, kertas, logam) digambar sendiri dalam satu gaya garis, 24 px, supaya petugas mengenali jenis dari bentuk sebelum membaca nama.
- Gerak seminimal mungkin: perubahan status instan, tanpa animasi dekoratif.

### Yang dihindari

- Gaya dompet digital dan aplikasi bank: kartu mengilap, angka saldo raksasa berlatar gradien, ilustrasi orang memegang ponsel.
- Gaya "hijau ramah lingkungan" klise: daun, bumi, ikon daur ulang berputar sebagai dekorasi. Hijau zaitun hanya muncul sebagai warna aksi utama, bidang latar muda, dan status.
- Halaman beranda berisi promosi fitur. Ini alat kerja; layar pertama langsung berisi data pengguna.
- Salinan teks pemasaran. Semua teks layar memakai istilah RW (setoran, timbangan, saldo, tarik).

### Kepatuhan terhadap 19 larangan

Setiap larangan di brief ini dijawab dengan keputusan konkret. Tabel ini juga menjadi daftar periksa saat desain ditinjau.

| No | Larangan | Keputusan di BinBank |
| --- | --- | --- |
| 1 | Gradien ungu ke biru | Tidak ada gradien di mana pun. Semua warna datar dari token. |
| 2 | Teks hero bergradien | Judul halaman berwarna `ink-900` solid. |
| 3 | Emoji di heading | Heading hanya berisi teks. Ikon hanya di tombol dan menu, selalu bersama kata. |
| 4 | Inter di mana-mana | Outfit untuk semua teks, angka memakai fitur angka tabular Outfit (bagian 3). |
| 5 | Kartu dengan border berwarna | Kartu dipisah garis netral `line-500` atau perbedaan latar. Warna status hanya di dalam Cap Status, tidak pernah sebagai bingkai atau garis tepi kartu. |
| 6 | Kartu glassmorphism | Tidak ada transparansi atau blur. Semua permukaan opak. |
| 7 | Dark mode berkontras rendah | MVP hanya tema terang. Dark mode ditunda sampai bisa memenuhi kontras 7:1 yang sama (lihat Asumsi). |
| 8 | Tiga kotak ikon berjajar | Tidak ada. Ringkasan di Beranda berbentuk baris berlabel dan tabel, bukan deretan kotak ikon. |
| 9 | Badge di atas headline | Tidak ada label kecil di atas judul. Judul halaman selalu elemen pertama konten. |
| 10 | Ikon Lucide di mana-mana | Ikon fungsional memakai Phosphor Regular, dibatasi pada daftar di bagian 7. Jenis sampah memakai pictogram buatan sendiri. |
| 11 | shadcn UI tanpa diubah | Komponen dibangun di atas primitif headless (Radix) dan seluruh gayanya dari token BinBank. Tidak ada kelas atau tampilan bawaan shadcn. |
| 12 | Berkas cahaya yang mengikuti kursor | Tidak ada efek berbasis posisi pointer. |
| 13 | Tombol memudar saat hover | Hover mengganti warna latar langsung (0 ms) ke tingkat lebih gelap. Tidak ada transisi opasitas. |
| 14 | Spacing tidak konsisten | Skala kelipatan 4 px; hanya nilai token yang boleh dipakai (bagian 3). |
| 15 | Em dash di mana-mana | Tidak ada em dash di teks layar maupun di brief ini. Pemisah memakai titik, koma, titik dua. Aturan lint pada string antarmuka. |
| 16 | Copy buzzword generik | Teks memakai kosakata RW dan menyebut objek nyata: "Saldo Rp 128.500", bukan "Kelola tabunganmu dengan mudah". |
| 17 | Aksen serif miring | Tidak ada serif dan tidak ada italic. Penekanan lewat berat huruf. |
| 18 | Space Grotesk + Instrument Serif | Tidak dipakai. |
| 19 | Grain di atas gradien | Tidak ada gradien dan tidak ada grain. Kesan kertas dibuat dari warna datar dan garis. |

## 3. Design tokens

Semua nilai visual berasal dari token berikut, ditulis sebagai CSS custom property (`--color-putih`, `--space-4`, dan seterusnya). Nilai di luar tabel tidak boleh muncul di kode. Rasio kontras di bagian ini dihitung dengan rumus luminans relatif WCAG 2.x dari hex yang tertulis, bukan diperkirakan.

### Palet warna

Palet mengikuti desain awal tim: putih sebagai latar, tinta gelap sebagai teks, hijau zaitun sebagai warna aksi, dan hijau muda sebagai bidang pendukung. Warna status tetap dipetakan ke bahan sampah yang ditimbang di RW (kardus, PET, bata, daun).

| Token | Hex | Peran |
| --- | --- | --- |
| `putih` | #FFFFFF | Latar halaman utama dan permukaan terangkat: kartu, dialog, kolom isian |
| `olive-50` | #EAF3DE | Baris tabel selang-seling, area sekunder, skeleton, tombol sekunder saat hover |
| `ink-900` | #1D2420 | Teks isi, angka, judul |
| `ink-700` | #394240 | Teks sekunder yang tetap penting (label kolom, keterangan) |
| `ink-500` | #5A625E | Teks pendukung (bantuan isian, waktu, placeholder) |
| `olive-700` | #4F5C23 | Aksi utama, tautan, focus ring |
| `olive-800` | #3F4A1C | Tombol utama saat ditekan dan hover; tautan di atas `olive-50` |
| `olive-100` | #CDE1B3 | Latar item terpilih, sorotan baris baru, bidang dekoratif |
| `forest-900` | #114B38 | Merek: logo dan ilustrasi. Bukan untuk teks isi atau tombol |
| `kardus-700` / `kardus-100` | #6B3F08 / #F8EBD2 | Status MENUNGGU, peringatan |
| `pet-700` / `pet-100` | #1A4670 / #E2ECF5 | Status DISETUJUI, informasi |
| `bata-700` / `bata-100` | #8A2615 / #FAE6E0 | Status DITOLAK dan DIBATALKAN, galat, aksi merusak |
| `daun-700` / `daun-100` | #335512 / #E4F0D6 | Status SELESAI dan TERCATAT, keberhasilan |
| `line-500` | #767B73 | Batas komponen interaktif (isian, tombol sekunder, kotak centang) |
| `line-300` | #CFC8B4 | Pemisah dekoratif: garis antarbaris, pembatas bagian |

**Mengapa olive-700 sebagai warna utama.** Zaitun pada desain awal tim (#849347) hanya berkontras 3,36:1 dengan putih, sehingga tidak lolos target 7:1 untuk teks dan tombol. Warna itu digelapkan dengan rona yang sama menjadi #4F5C23: tombol berteks putih dan teks tautan di atas putih mencapai 7,27:1 dan tetap terbaca di bawah sinar matahari. Hijau muda #CDE1B3 dari desain awal dipertahankan apa adanya, tetapi hanya sebagai bidang latar: `olive-700` di atasnya hanya 5,20:1, jadi teks di atas `olive-100` memakai `ink-900` atau `ink-700`.

**Mengapa status berwarna kardus, PET, bata, daun.** Empat status penarikan (MENUNGGU, DISETUJUI, DITOLAK, SELESAI) membutuhkan empat warna yang bisa dibedakan, dan setiap warna dipetakan ke satu bahan yang dikenal petugas. Warna tidak pernah menjadi satu-satunya penanda: setiap status membawa kata kapital dan bentuk ikon sendiri (bagian 7).

**Aturan penggunaan.**

- Satu layar hanya memiliki satu tombol berlatar `olive-700`.
- Mutasi saldo memakai kolom Masuk dan Keluar, tanpa warna merah atau hijau. Saldo bukan soal baik atau buruk, dan sekitar 1 dari 12 laki-laki sulit membedakan keduanya.
- Tidak ada gradien. Tidak ada transparansi pada permukaan, kecuali scrim di belakang dialog.
- Kartu tidak pernah diberi garis tepi berwarna; warna status hanya hidup di dalam Cap Status.
- Teks pendukung di atas `olive-100` memakai `ink-700`, bukan `ink-500` (4,49:1). Tautan di atas `olive-50` memakai `olive-800`, bukan `olive-700` (6,36:1).

### Rasio kontras terverifikasi

| Pasangan | Rasio | Dipakai untuk | Target |
| --- | --- | --- | --- |
| `ink-900` pada `putih` | 15,84:1 | Teks isi, angka, dan judul di halaman dan kartu | 7:1 |
| `ink-900` pada `olive-50` | 13,86:1 | Teks di baris selang-seling | 7:1 |
| `ink-700` pada `putih` | 10,36:1 | Label kolom, keterangan | 7:1 |
| `ink-700` pada `olive-50` | 9,06:1 | Label di area sekunder | 7:1 |
| `ink-500` pada `putih` | 6,28:1 | Teks pendukung di halaman dan kartu | 4,5:1 |
| `ink-500` pada `olive-50` | 5,50:1 | Teks pendukung di area sekunder | 4,5:1 |
| putih pada `olive-700` | 7,27:1 | Tombol utama | 7:1 |
| putih pada `olive-800` | 9,51:1 | Tombol utama saat ditekan | 7:1 |
| `olive-700` pada `putih` | 7,27:1 | Tautan dan teks aksi | 7:1 |
| `olive-800` pada `olive-50` | 8,32:1 | Tautan di atas area `olive-50` | 7:1 |
| `forest-900` pada `putih` | 10,06:1 | Logo dan ilustrasi | 7:1 |
| `kardus-700` pada `kardus-100` | 7,61:1 | Cap MENUNGGU | 7:1 |
| `pet-700` pada `pet-100` | 8,15:1 | Cap DISETUJUI | 7:1 |
| `bata-700` pada `bata-100` | 7,37:1 | Cap DITOLAK, pesan galat | 7:1 |
| `daun-700` pada `daun-100` | 7,24:1 | Cap SELESAI, pesan berhasil | 7:1 |
| putih pada `bata-700` | 8,87:1 | Tombol aksi merusak | 7:1 |
| putih pada `ink-900` | 15,84:1 | Toast | 7:1 |
| `line-500` pada `putih` | 4,33:1 | Batas isian dan tombol sekunder di halaman dan kartu | 3:1 |
| `line-500` pada `olive-50` | 3,79:1 | Batas komponen di area sekunder | 3:1 |
| `line-300` pada `putih` | 1,67:1 | Hanya dekoratif; tidak boleh menjadi batas komponen | tidak berlaku |

### Tipografi

**Keputusan: Outfit untuk semua teks dan angka.**

Outfit adalah huruf sans geometris berlisensi terbuka (SIL OFL), tersedia dalam bobot 100 sampai 900, dan boleh di-self-host. Huruf ini dipilih mengikuti desain awal tim. Semua teks memakai Outfit. Nilai uang dan berat memakai fitur angka tabular bawaan Outfit (`font-variant-numeric: tabular-nums`, fitur `tnum`, sudah diperiksa ada pada berkas Outfit bobot 400 dan 700), sehingga digit berlebar sama dan sejajar di kolom tabel dan di layar konfirmasi, sesuai prinsip 1. Konsekuensi yang diterima: Outfit tidak membedakan huruf I besar dan l kecil sejelas Atkinson Hyperlegible, jadi password awal dan password sementara dibuat tanpa karakter yang mudah tertukar (I, l, 1, O, 0).

**Pemuatan.** Dua berkas WOFF2 Outfit di-self-host (bobot 400 dan 700), subset Latin dengan angka dan simbol Rp. Subset harus mempertahankan fitur `tnum` (pyftsubset: `--layout-features+=tnum`). Berkas Latin Outfit sekitar 13 KB per bobot, jauh di bawah batas total 120 KB yang tetap berlaku. Cadangan: `system-ui, sans-serif` untuk semua teks, dengan `font-display: swap`.

| Token | Ukuran / tinggi baris | Bobot | Huruf | Dipakai untuk |
| --- | --- | --- | --- | --- |
| `text-display` | 40 / 44 px (desktop 48 / 52) | 700 | Outfit tabular | Saldo di Beranda, berat di layar timbang |
| `text-h1` | 28 / 34 px (desktop 32 / 40) | 700 | Outfit | Judul halaman |
| `text-h2` | 22 / 28 px | 700 | Outfit | Judul bagian |
| `text-h3` | 18 / 24 px | 700 | Outfit | Judul kartu, judul kolom |
| `text-body` | 16 / 24 px | 400 | Outfit | Teks isi, label isian |
| `text-body-strong` | 16 / 24 px | 700 | Outfit | Nama nasabah, penekanan |
| `text-amount` | 18 / 24 px | 700 | Outfit tabular | Nilai uang dan berat dalam daftar dan tabel |
| `text-amount-sm` | 16 / 24 px | 400 | Outfit tabular | Nilai dalam sel tabel padat |
| `text-small` | 14 / 20 px | 400 | Outfit | Teks pendukung, waktu, bantuan isian |
| `text-cap` | 14 / 16 px, jarak huruf 0,04 em, kapital | 700 | Outfit | Cap Status |

Aturan tipografi: tidak ada ukuran di bawah 14 px; teks isi tidak pernah di bawah 16 px; panjang baris paragraf dibatasi 70 karakter; tidak ada italic; penekanan memakai bobot 700. Nilai uang ditulis `Rp 25.000` (spasi tak terputus setelah Rp, titik sebagai pemisah ribuan) dan berat ditulis `2,50 kg` (koma desimal, dua angka di belakang koma sesuai presisi 0,01 kg di PRD).

### Skala spacing

Semua jarak adalah kelipatan 4 px dan hanya delapan nilai yang boleh dipakai.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `space-1` | 4 px | Jarak ikon ke kata |
| `space-2` | 8 px | Label ke isian, jarak antarbaris rapat |
| `space-3` | 12 px | Padding vertikal tombol kecil, jarak antarelemen dalam sel |
| `space-4` | 16 px | Padding kartu di ponsel, jarak antarisian, gutter ponsel, jarak minimal konfirmasi ke batal |
| `space-5` | 24 px | Padding kartu di tablet ke atas, jarak antarkelompok |
| `space-6` | 32 px | Jarak antarbagian di satu halaman |
| `space-7` | 48 px | Tinggi target sentuh minimum, jarak antarbagian besar di desktop |
| `space-8` | 64 px | Margin atas halaman desktop |

### Radius

Sudut dibuat melengkung lembut agar antarmuka terasa ramah, tetapi bentuk dasarnya tetap persegi seperti halaman buku besar. Tidak ada bentuk pil dan tidak ada bentuk bulat penuh.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `radius-0` | 0 | Tabel, garis pemisah |
| `radius-1` | 4 px | Cap Status |
| `radius-2` | 12 px | Tombol, isian, kartu |
| `radius-3` | 20 px | Dialog, bottom sheet (sudut atas) |

### Garis dan bayangan

Di dunia buku kas, hierarki dibuat dengan garis, bukan bayangan. Bayangan hanya untuk lapisan yang benar-benar melayang di atas halaman.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `rule-1` | 1 px solid `line-300` | Pemisah antarbaris dan antarbagian |
| `rule-ui` | 1 px solid `line-500` | Batas isian, tombol sekunder, kotak centang |
| `rule-total` | 3 px double `ink-900` | Garis di atas baris total (prinsip 1) |
| `shadow-0` | tanpa bayangan | Kartu, tombol, tabel |
| `shadow-1` | 0 1px 2px rgba(29,36,32,0.16), 0 4px 12px rgba(29,36,32,0.10) | Menu dan popover |
| `shadow-2` | 0 8px 24px rgba(29,36,32,0.20) | Dialog dan bottom sheet |
| `scrim` | `ink-900` pada 50% | Latar di belakang dialog |
| `focus-ring` | 3 px solid `olive-700`, offset 2 px | Semua elemen interaktif saat fokus keyboard |

### Gerak

- Perubahan warna saat hover, fokus, dan tekan bersifat instan (0 ms). Tombol tidak memudar.
- Hanya bottom sheet dan dialog yang bergerak: geser 8 px dan tampil dalam 150 ms.
- Skeleton berupa blok `olive-50` statis, tanpa kilau. Layar menimbang tidak boleh menampilkan animasi yang bisa disangka angka berubah.
- Dengan pengaturan `prefers-reduced-motion`, semua gerak menjadi 0 ms.

## 4. Screen inventory

Total 33 screen untuk 14 fitur MVP. Kolom Bentuk membedakan halaman penuh dari dialog dan sheet: dialog dipakai untuk keputusan singkat yang tidak perlu alamat sendiri (setujui, tolak, batalkan), halaman penuh untuk apa pun yang diisi atau dibaca lama. Screen bertanda **Kunci** mendapat penanganan state lengkap di bagian 8.

### Struktur navigasi

Setiap peran hanya melihat menu miliknya (PRD F1.5). Di ponsel, menu berupa bilah bawah dengan paling banyak lima item, ikon selalu bersama kata. Di desktop, menu menjadi bilah samping. Pilihan bilah bawah dibanding menu hamburger: petugas memakai satu tangan sambil memegang timbangan atau catatan, dan menu yang tersembunyi menambah satu ketukan pada setiap pekerjaan.

| Peran | Item menu | Item utama |
| --- | --- | --- |
| Nasabah | Beranda, Riwayat, Tarik Saldo, Harga | Tarik Saldo |
| Petugas | Beranda, Catat Setoran, Setoran, Penarikan, Nasabah | Catat Setoran |
| Admin | Beranda, Setoran, Penarikan, Laporan, Kelola | Tidak ada; pekerjaan admin bervariasi |

"Kelola" milik admin memuat Jenis Sampah, Pengguna, dan Daftar Harga. Menu Profil dan Keluar berada di kepala halaman (nama pengguna), tersedia untuk semua peran.

### Screen umum

| ID | Screen | Bentuk | Tujuan | Fitur |
| --- | --- | --- | --- | --- |
| U1 | Masuk | Halaman | Pengguna masuk dengan email dan password; pesan galat sama untuk email salah dan password salah. **Kunci** | F1.1, F1.4 |
| U2 | Ganti Password Wajib | Halaman | Satu-satunya layar yang boleh dibuka pengguna ber-password sementara; tidak ada menu lain sampai selesai. **Kunci** | F2.6 |
| U3 | Ganti Password Sendiri | Halaman | Pengguna mengganti password kapan saja dengan memasukkan password lama | F2.6 |
| U4 | Daftar Harga | Halaman | Semua peran melihat jenis sampah aktif dan harga per kg yang berlaku | F3.2 |

### Screen Nasabah

| ID | Screen | Bentuk | Tujuan | Fitur |
| --- | --- | --- | --- | --- |
| N1 | Beranda Nasabah | Halaman | Menjawab "berapa uang saya?": saldo, saldo tersedia, status pengajuan terakhir, lima mutasi terbaru. **Kunci** | F6.1, F6.2 |
| N2 | Riwayat Mutasi | Halaman | Daftar mutasi buku besar lengkap dengan saldo setelah tiap baris, terbaru dulu, dipaginasi. **Kunci** | F6.2, F6.4, F6.6 |
| N3 | Rincian Setoran | Halaman | Satu setoran: tanggal, jenis, berat, harga, subtotal, total. Membuktikan asal angka. | F6.3 |
| N4 | Ajukan Penarikan | Halaman | Mengisi nominal dan metode TUNAI atau E-WALLET, dengan saldo tersedia selalu terlihat. **Kunci** | F7.1, F7.2 |
| N5 | Pengajuan Saya | Halaman | Daftar pengajuan dengan status dan alasan penolakan. **Kunci** | F7.4, F14.5 |

### Screen Petugas (juga dipakai Admin bila ditandai)

| ID | Screen | Bentuk | Tujuan | Fitur |
| --- | --- | --- | --- | --- |
| P1 | Beranda Petugas | Halaman | Pintu masuk kerja: tombol Catat Setoran, jumlah pengajuan yang perlu diproses, setoran terakhir | F4, F8 |
| P2 | Cari Nasabah | Halaman | Mencari nasabah menurut nama atau email; hasil menampilkan nama dan email untuk membedakan nama kembar. Dipakai untuk memulai setoran dan untuk melihat saldo. **Kunci** | F2.8, F4.1 |
| P3 | Form Setoran | Halaman | Mengisi baris jenis dan berat; total terlihat sementara sebagai perkiraan, nilai resmi dihitung server. **Kunci** | F4.1, F4.3 |
| P4 | Konfirmasi Setoran | Halaman | Ringkasan nasabah, rincian, total; satu-satunya jalan menuju penyimpanan. **Kunci** | F4.5 |
| P5 | Setoran Tersimpan | Halaman | Bukti: rincian, total nilai, saldo baru nasabah; pintu menuju setoran berikutnya. **Kunci** | F4.9 |
| P6 | Daftar Setoran (Admin juga) | Halaman | Daftar dengan filter tanggal dan nasabah. **Kunci** | F4.11, F13 |
| P7 | Rincian Setoran (Admin juga) | Halaman | Rincian satu setoran dan statusnya; Admin mendapat tombol Batalkan Setoran | F4.11, F10.5 |
| P8 | Profil Nasabah (Admin juga) | Halaman | Saldo dan riwayat mutasi satu nasabah, tombol Catat Setoran untuk petugas | F6.5 |
| P9 | Daftarkan Nasabah (Admin juga) | Halaman | Mengisi nama, email, password awal | F2.2, F2.4 |
| P10 | Antrean Penarikan (Admin juga) | Halaman | Daftar pengajuan, bawaan MENUNGGU, dengan tab status; tampilan DISETUJUI dipakai untuk pencairan. **Kunci** | F8.1, F14.2 |
| P11 | Proses Pengajuan (Admin juga) | Dialog | Setujui atau Tolak; Tolak mewajibkan alasan | F8.2, F8.3 |
| P12 | Konfirmasi Dana Diserahkan (Admin juga) | Dialog | Menandai SELESAI dengan catatan opsional | F14.1, F14.4 |

### Screen Admin

| ID | Screen | Bentuk | Tujuan | Fitur |
| --- | --- | --- | --- | --- |
| A1 | Beranda Admin | Halaman | Total saldo seluruh nasabah, pengajuan MENUNGGU, setoran hari ini | F12.2 |
| A2 | Jenis Sampah | Halaman | Daftar jenis dan harga per kg, tombol ubah dan nonaktifkan. **Kunci** | F3.1, F11.1 |
| A3 | Form Jenis Sampah | Dialog | Menambah atau mengubah nama dan harga; menjelaskan bahwa perubahan hanya berlaku untuk setoran berikutnya | F3.1, F3.3, F3.4 |
| A4 | Pengguna | Halaman | Daftar semua akun, saring menurut peran dan status, nonaktifkan dan aktifkan kembali. **Kunci** | F2, F11.2, F11.3 |
| A5 | Buat Akun Petugas atau Admin | Halaman | Mengisi nama, email, password awal | F2.1, F2.9 |
| A6 | Reset Password | Dialog | Mengatur password sementara untuk pengguna lain | F2.7 |
| A7 | Laporan Setoran | Halaman | Rekap per jenis untuk satu periode. **Kunci** | F9 |
| A8 | Rekap Penarikan dan Saldo | Halaman | Jumlah dan total nominal per status, total saldo seluruh nasabah | F12 |
| A9 | Batalkan Setoran | Dialog | Alasan wajib, menyebut dampak pada saldo nasabah | F10.1, F10.3 |

### Screen sistem

| ID | Screen | Bentuk | Tujuan | Fitur |
| --- | --- | --- | --- | --- |
| X1 | Tidak Ada Akses | Halaman | Pengguna membuka alamat di luar wewenang atau akun dinonaktifkan | F1.5, F1.7 |
| X2 | Sesi Berakhir | Halaman | Token 8 jam habis; mengarahkan masuk ulang dan memberi tahu bahwa isian yang belum tersimpan tidak dijamin | F1.8 |
| X3 | Layanan Tidak Tersedia | Halaman | Server atau database tidak terjangkau | Bagian 8 PRD |

## 5. User flow

Sepuluh journey utama, mengikuti urutan demo end-to-end di PRD bagian 9. Kode dalam kurung adalah ID screen dari bagian 4. Cabang yang diawali "Jika" adalah jalur gagal atau alternatif yang wajib punya desain, bukan opsional.

### J1. Masuk pertama kali dan mengganti password (Petugas dan Nasabah)

1. Pengguna membuka alamat BinBank. Belum ada token: tampil Masuk (U1).
2. Mengisi email dan password dari admin atau petugas, menekan **Masuk**.
3. Jika email atau password salah: pesan yang sama untuk keduanya, "Email atau password tidak cocok". Isian email tetap terisi, isian password dikosongkan dan difokuskan.
4. Jika berhasil dan akun masih ber-password sementara: langsung ke Ganti Password Wajib (U2). Menu lain tidak tampil.
5. Mengisi password lama, password baru, ulangi password baru, menekan **Simpan password baru**.
6. Jika password baru terlalu pendek atau kedua isian berbeda: galat di bawah isian yang bersangkutan, tanpa menghapus isian lain.
7. Berhasil: diarahkan ke Beranda sesuai peran (N1 atau P1), dengan toast "Password diganti".

### J2. Petugas mencatat setoran (journey terpenting)

| Langkah | Screen | Pengguna | Sistem |
| --- | --- | --- | --- |
| 1 | P1 | Menekan **Catat Setoran** | Membuka Cari Nasabah |
| 2 | P2 | Mengetik nama atau email, memilih satu baris hasil | Hasil muncul mulai dua huruf; setiap baris menampilkan nama dan email |
| 3 | P3 | Menambah baris: memilih jenis sampah, mengisi berat | Subtotal tiap baris dan total tampil sebagai perkiraan berlabel; nama nasabah tetap di kepala halaman |
| 4 | P3 | Menekan **Periksa setoran** | Memeriksa isian; galat ditandai per baris |
| 5 | P4 | Membaca ringkasan: nasabah, baris, berat, harga, subtotal, total bergaris ganda | Menampilkan semuanya sebagai teks, bukan isian |
| 6 | P4 | Menekan **Simpan setoran Rp 25.000** | Tombol langsung nonaktif dan berubah menjadi "Menyimpan..."; server menyimpan setoran, entri buku besar, dan saldo dalam satu transaksi |
| 7 | P5 | Membaca bukti dan saldo baru, menekan **Catat setoran berikutnya** | Menampilkan nilai resmi dari server |

Cabang:

- **Langkah 2, tidak ada hasil:** pesan "Tidak ada nasabah dengan nama atau email itu", dengan tautan **Daftarkan nasabah baru** menuju J6. Bila ada beberapa nama sama, petugas membedakan lewat email di tiap baris.
- **Langkah 4, berat 0, kosong, atau bukan angka:** baris ditandai dengan teks galat di bawah isian ("Berat harus lebih dari 0"), fokus pindah ke baris pertama yang salah.
- **Langkah 5, ada yang salah:** tombol **Kembali dan ubah** membawa petugas ke P3 dengan semua isian utuh. Menutup layar tanpa menyimpan tidak menyimpan apa pun.
- **Langkah 6, harga atau jenis berubah di server (F4.6):** kembali ke P3 dengan pesan "Harga diperbarui admin. Periksa baris yang ditandai"; semua isian dipertahankan, harga baru ditampilkan, baris yang berubah ditandai. Petugas mengulang dari langkah 4.
- **Langkah 6, jaringan putus atau waktu habis:** P4 tetap terbuka dengan pesan "Setoran belum dipastikan tersimpan. Periksa Daftar Setoran sebelum mencoba lagi", tombol **Periksa Daftar Setoran** (membuka P6 yang sudah disaring untuk nasabah ini) dan tombol **Coba simpan lagi**. Ini menjaga agar tidak terbentuk setoran ganda.
- **Langkah 6, sesi berakhir:** X2; isian tidak dijamin.

### J3. Nasabah memeriksa saldo dan menelusuri satu setoran

1. Masuk (U1), tiba di Beranda Nasabah (N1). Saldo dan saldo tersedia terlihat tanpa menggulir.
2. Jika saldo tersedia lebih kecil dari saldo karena ada pengajuan MENUNGGU: baris penjelasan "Rp 20.000 sedang menunggu keputusan" tampil di bawah saldo tersedia.
3. Menekan baris mutasi terbaru atau **Lihat semua riwayat** untuk ke Riwayat Mutasi (N2).
4. Pada mutasi bertipe setoran, menekan baris untuk membuka Rincian Setoran (N3): jenis, berat, harga per kg, subtotal, total.
5. Mutasi pembalik (pembatalan setoran) tampil sebagai baris tersendiri bertuliskan "Pembatalan setoran" dengan tautan ke setoran asalnya, sehingga koreksi terlihat (F6.4).

### J4. Nasabah mengajukan penarikan

1. Dari N1 atau bilah menu: **Tarik Saldo** (N4). Saldo tersedia tampil di bagian atas dan tetap terlihat saat mengisi.
2. Jika saldo tersedia 0: isian tidak tampil; pesan "Saldo tersedia Rp 0. Belum ada yang bisa ditarik".
3. Mengisi nominal rupiah. Jika melebihi saldo tersedia: galat "Melebihi saldo tersedia Rp 128.500", menyebut angkanya.
4. Memilih metode **Tunai** atau **E-wallet**. Jika E-wallet: muncul isian nama e-wallet dan nomor e-wallet, keduanya wajib.
5. Menekan **Ajukan penarikan Rp 50.000**. Tombol nonaktif selama proses.
6. Berhasil: ke Pengajuan Saya (N5) dengan pengajuan baru berstatus MENUNGGU di paling atas dan toast "Pengajuan terkirim". Teks jelas: saldo belum berkurang, pengajuan tidak bisa dibatalkan sendiri (F7.7).
7. Jika saldo tersedia berubah saat mengisi (pengajuan lain): pesan galat dari server memuat saldo tersedia terbaru.

### J5. Petugas atau Admin memproses penarikan

1. Dari P1 atau menu **Penarikan**, membuka Antrean Penarikan (P10) pada tab MENUNGGU.
2. Memilih satu pengajuan dan menekan **Setujui** atau **Tolak**, membuka dialog Proses Pengajuan (P11).
3. **Setujui:** dialog menyebut nama nasabah, nominal, metode, dan sisa saldo setelah disetujui. Tombol **Setujui Rp 50.000**. Berhasil: pengajuan pindah ke tab DISETUJUI.
4. **Tolak:** alasan wajib diisi; tombol **Tolak pengajuan** berbentuk lain dan tidak aktif sampai alasan terisi. Berhasil: pengajuan pindah ke tab DITOLAK dan alasan terlihat oleh nasabah.
5. Jika saldo nasabah sudah lebih kecil dari nominal (F8.5): dialog tetap terbuka dengan pesan "Saldo nasabah kini Rp 30.000, kurang dari Rp 50.000. Pengajuan tetap MENUNGGU"; tombol Setujui nonaktif, tombol Tolak tetap bisa dipakai.
6. Jika pemroses lain sudah memutuskan lebih dulu: pesan "Pengajuan ini sudah diproses oleh \[nama\]" dan daftar dimuat ulang.
7. Setelah dana diserahkan (tunai) atau ditransfer (e-wallet), di tab DISETUJUI menekan **Tandai selesai**, membuka dialog Konfirmasi Dana Diserahkan (P12). Isian catatan opsional (misalnya referensi transfer). Tombol **Konfirmasi dana sudah diserahkan**. Berhasil: status SELESAI.

### J6. Petugas mendaftarkan nasabah

1. Dari P2 (tautan saat hasil kosong) atau menu **Nasabah**, ke Daftarkan Nasabah (P9).
2. Mengisi nama, email, password awal; menekan **Daftarkan nasabah**.
3. Jika email sudah dipakai: galat di isian email, "Email ini sudah terdaftar atas nama \[nama\]".
4. Berhasil: layar sukses memuat nama, email, dan password awal yang tampil sekali, dengan peringatan bahwa password awal tidak bisa dilihat lagi dan nasabah wajib menggantinya saat masuk. Tombol **Catat setoran untuk nasabah ini** dan **Daftarkan nasabah lain**.

### J7. Admin mengubah harga atau menambah jenis sampah

1. Menu **Kelola**, lalu Jenis Sampah (A2).
2. Menekan **Ubah** pada satu baris, atau **Tambah jenis sampah**; dialog Form Jenis Sampah (A3) terbuka.
3. Mengisi nama dan harga per kg. Teks tetap di dialog: "Harga baru hanya berlaku untuk setoran berikutnya. Setoran yang sudah tercatat tidak berubah."
4. Jika nama sudah ada atau harga 0 atau kurang: galat di isian.
5. Berhasil: baris diperbarui dan disorot `olive-100` sampai halaman dimuat ulang.
6. Menonaktifkan: tombol **Nonaktifkan** membuka konfirmasi yang menjelaskan bahwa jenis ini tidak muncul di setoran baru tetapi tetap ada di setoran lama.

### J8. Admin membatalkan setoran

1. Dari Daftar Setoran (P6) menyaring nasabah atau tanggal, membuka Rincian Setoran (P7).
2. Menekan **Batalkan setoran** (hanya admin, hanya untuk status TERCATAT); dialog Batalkan Setoran (A9) terbuka.
3. Dialog menyebut: nasabah, total setoran, saldo sekarang, dan saldo setelah pembatalan. Alasan wajib diisi.
4. Tombol **Batalkan setoran Rp 25.000** berlatar `bata-700`; tombol batal berbeda bentuk dan berjarak minimal 16 px.
5. Jika saldo nasabah lebih kecil dari nilai setoran (F10.6): dialog menampilkan galat "Saldo nasabah Rp 10.000 tidak cukup untuk membatalkan setoran Rp 25.000 karena sebagian sudah ditarik"; tombol batalkan tidak aktif.
6. Berhasil: status berubah ke DIBATALKAN; alasan, pelaku, dan waktu tampil di rincian; di riwayat nasabah muncul entri pembalik.

### J9. Admin membaca laporan

1. Menu **Laporan** (A7). Periode bawaan: bulan berjalan (WIB).
2. Mengubah tanggal mulai dan akhir. Jika mulai setelah akhir: galat "Tanggal mulai tidak boleh setelah tanggal akhir" dan hasil lama dipertahankan.
3. Membaca tabel per jenis (kg dan Rp) dan total bergaris ganda. Periode tanpa setoran menampilkan baris nol, bukan error (F9.6).
4. Beralih ke Rekap Penarikan dan Saldo (A8) lewat tab di halaman yang sama; membaca jumlah dan total per status serta total saldo seluruh nasabah.

### J10. Admin mereset password dan menonaktifkan akun

1. Menu **Kelola**, lalu Pengguna (A4). Mencari akun menurut nama atau email.
2. **Reset password:** tombol pada baris membuka dialog Reset Password (A6). Admin mengisi password sementara atau memilih **Buat otomatis**. Berhasil: password sementara tampil sekali dengan tombol salin, disertai peringatan bahwa pengguna wajib menggantinya.
3. **Nonaktifkan:** konfirmasi menjelaskan akibatnya (tidak bisa masuk, sesi berjalan langsung berhenti, data lama tetap). Perilaku untuk nasabah yang masih punya saldo atau pengajuan berjalan belum diputuskan (OQ-24); desain menampilkan peringatan saldo tetapi tidak memblokir.
4. **Aktifkan kembali:** satu ketukan dengan konfirmasi singkat.

## 6. Layout per screen

Layout ditulis dari lebar ponsel 360 px (mobile first), urut dari atas ke bawah. Perilaku di tablet dan desktop ada di bagian 9. Nama komponen merujuk ke bagian 7. Aturan umum untuk semua screen:

- Setiap halaman diawali **Kepala Halaman**: judul h1 dan, bila perlu, satu baris keterangan. Tidak ada label kecil di atas judul.
- Satu tombol utama (`olive-700`) per screen atau dialog. Pada daftar yang tiap barisnya punya aksi (mis. antrean penarikan), aksi baris memakai tombol Sekunder; tombol utama hanya ada di dialog yang dibuka.
- Di ponsel, tombol utama halaman formulir berada di **Bilah Aksi Lekat** di atas bilah menu, selalu terlihat tanpa menggulir.
- Jarak antarbagian `space-6`, antarkelompok isian `space-4`, label ke isian `space-2`.

### U1. Masuk

1. Nama "BinBank" sebagai teks `text-h2`, bukan logo bergambar. Di bawahnya judul h1 "Masuk".
2. Isian Teks Email, lalu Isian Kata Sandi dengan tombol teks **Tampilkan** di sisinya.
3. Pesan Inline galat bila gagal, ditempatkan di atas isian.
4. **Aksi utama:** Masuk (lebar penuh).
5. Teks bantuan di bawah tombol: "Lupa password? Minta admin atau petugas RW mengatur ulang." Tanpa tautan, karena tidak ada fitur kirim email.

Tidak ada ilustrasi, tidak ada hero, tidak ada kartu. Di desktop, satu kolom selebar 400 px di tengah layar secara horizontal dan vertikal, di atas latar `putih`.

### N1. Beranda Nasabah

1. Kepala Halaman: "Beranda" dan nama nasabah.
2. **Lembar Saldo:** label "Saldo", angka `text-display` "Rp 128.500"; di bawahnya "Saldo tersedia" dan angkanya `text-amount`; bila ada pengajuan MENUNGGU, satu baris "Rp 20.000 sedang menunggu keputusan".
3. **Aksi utama:** Tarik saldo, di dalam Lembar Saldo.
4. Pengajuan terakhir (hanya bila ada): satu baris berisi tanggal, nominal, Cap Status, tautan **Semua pengajuan**.
5. Mutasi terbaru: judul h2, Tabel Buku lima baris (Tanggal, Keterangan, Masuk, Keluar, Saldo), tautan **Lihat semua riwayat**.

Hierarki: saldo adalah satu-satunya hal yang membesar. Semua lain berukuran isi.

### N4. Ajukan Penarikan

1. Kepala Halaman: "Tarik saldo".
2. Pita "Saldo tersedia Rp 108.500" yang melekat di bawah kepala saat menggulir.
3. Isian Uang "Nominal" dengan awalan Rp, papan angka numerik.
4. Pilihan Metode: dua opsi besar, "Tunai" dan "E-wallet", masing-masing minimal 56 px tinggi.
5. Bila E-wallet: Isian Teks "Nama e-wallet" dan Isian Teks "Nomor e-wallet".
6. Ringkasan satu baris: "Saldo tersedia setelah pengajuan: Rp 58.500" dan teks "Saldo belum berkurang sampai pengajuan disetujui. Pengajuan tidak bisa dibatalkan sendiri."
7. **Aksi utama** di Bilah Aksi Lekat: "Ajukan penarikan Rp 50.000". Label ikut berubah mengikuti nominal; bila nominal kosong, "Ajukan penarikan".

### N5. Pengajuan Saya

1. Kepala Halaman: "Pengajuan saya".
2. Daftar Kartu Pengajuan, terbaru dulu: nominal (`text-amount`), tanggal, metode, Cap Status. Bila DITOLAK, alasan tampil penuh di bawah, dalam `ink-900` (bukan teks pendukung) karena nasabah perlu memahaminya. Bila E-wallet, nama dan nomor tampil.
3. Paginasi di akhir daftar. Tidak ada aksi pada kartu.

### P2. Cari Nasabah

1. Kepala Halaman: "Cari nasabah" atau, bila datang dari Catat Setoran, "Setoran untuk siapa?".
2. Kotak Cari, otomatis fokus, label terlihat "Nama atau email".
3. Daftar hasil: tiap baris selebar penuh, tinggi minimal 64 px, nama dengan `text-body-strong` di atas, email dengan `text-small` di bawah. Mengetuk baris adalah satu-satunya aksi.
4. Tautan sekunder di bawah: **Daftarkan nasabah baru**.

Tidak ada tombol utama; pemilihan baris adalah aksinya. Saldo tidak tampil di hasil agar daftar ringan dan pemilihan tidak bergantung pada angka.

### P3. Form Setoran

1. Kepala Halaman: "Setoran baru".
2. **Kepala Konteks Nasabah** yang melekat: nama, email, tautan **Ganti**.
3. Daftar Baris Rincian Setoran. Tiap baris: Pilihan Jenis Sampah (dengan pictogram dan harga per kg di tiap opsi), Isian Berat bertinggi 64 px dengan huruf `text-amount` 24 px dan satuan kg, harga per kg dan subtotal sebagai teks hanya-baca, tombol teks **Hapus baris** (hilang bila hanya satu baris).
4. Tombol Sekunder **Tambah jenis lain**.
5. Total: Total berat, lalu Total nilai di bawah garis ganda, berlabel "Perkiraan. Nilai resmi dihitung saat disimpan."
6. **Aksi utama** di Bilah Aksi Lekat: "Periksa setoran".

### P4. Konfirmasi Setoran

1. Kepala Halaman: "Periksa setoran" dan satu baris peringatan di Pesan Inline: "Setoran yang sudah disimpan tidak bisa diubah. Hanya admin yang bisa membatalkan."
2. **Lembar Konfirmasi:** nasabah (nama dan email), keterangan "Tanggal dicatat otomatis saat disimpan", lalu rincian per baris (jenis, berat, harga, subtotal), garis ganda, Total berat, Total nilai dengan `text-display`.
3. **Aksi utama:** "Simpan setoran Rp 25.000" (lebar penuh). Di bawahnya, berjarak `space-5`, tombol Sekunder "Kembali dan ubah".

Semua isi hanya-baca. Tidak ada isian di layar ini, supaya mata hanya bertugas membaca.

### P5. Setoran Tersimpan

1. Kepala Halaman: "Setoran tersimpan" dengan Cap Status TERCATAT di sampingnya.
2. Lembar bukti: nasabah, tanggal dan jam WIB, rincian, Total berat, Total nilai (nilai resmi dari server).
3. Baris "Saldo baru \[nama\]" dengan angka `text-amount`.
4. **Aksi utama:** "Catat setoran berikutnya". Sekunder: "Lihat riwayat nasabah".

### P6. Daftar Setoran

1. Kepala Halaman: "Setoran".
2. Filter: Pemilih Rentang Periode (tanggal mulai, tanggal akhir) dan Kotak Cari nasabah; tombol Sekunder **Terapkan filter** dan tautan **Hapus filter** bila filter aktif.
3. Tabel Buku: Tanggal, Nasabah, Berat (kg), Nilai (Rp), Status (Cap Status). Di ponsel, tiap setoran menjadi satu baris bertumpuk. Setoran DIBATALKAN tetap tampil dengan Cap dan angkanya dicoret garis (`text-decoration: line-through`), tetap terbaca.
4. Paginasi.

Tidak ada tombol utama di halaman ini; aksi menulis ada di menu **Catat Setoran**.

### P10. Antrean Penarikan

1. Kepala Halaman: "Penarikan".
2. Tab Status: MENUNGGU, DISETUJUI, DITOLAK, SELESAI, masing-masing dengan jumlah. Bawaan MENUNGGU.
3. Daftar Kartu Pengajuan: nama nasabah, tanggal, nominal (`text-amount`), metode; untuk E-wallet, nama dan nomor e-wallet ditampilkan dalam angka tabular dengan tombol **Salin nomor**.
4. Aksi baris bergantung tab: MENUNGGU punya **Setujui** dan **Tolak** (keduanya Sekunder); DISETUJUI punya **Tandai selesai** (Sekunder); DITOLAK menampilkan alasan; SELESAI menampilkan pelaku, waktu, dan catatan.
5. Paginasi.

### A2. Jenis Sampah

1. Kepala Halaman: "Jenis sampah" dengan **aksi utama** "Tambah jenis sampah" di sisi kanan (desktop) atau Bilah Aksi Lekat (ponsel).
2. Tabel Buku: Pictogram dan nama, Harga per kg (rata kanan, angka tabular), Status (Aktif atau Nonaktif sebagai Cap Status), aksi **Ubah** dan **Nonaktifkan** atau **Aktifkan**.
3. Jenis nonaktif tampil di bagian bawah, dengan teks `ink-700`.

### A7. Laporan Setoran

1. Kepala Halaman: "Laporan" dengan Tab Status dua tab: "Setoran" dan "Penarikan dan saldo".
2. Pemilih Rentang Periode (bawaan bulan berjalan) dan **aksi utama** "Tampilkan laporan".
3. Tabel Buku: Jenis sampah, Berat (kg), Nilai (Rp). Baris total berat dan total nilai di bawah garis ganda.
4. Catatan di bawah tabel: "Setoran yang dibatalkan tidak dihitung. Nilai memakai harga saat setoran dicatat."

### Screen lain

| ID | Urutan dari atas ke bawah | Aksi utama | Komponen utama |
| --- | --- | --- | --- |
| U2 | Kepala Halaman, Pesan Inline "Password awal harus diganti sebelum melanjutkan", tiga Isian Kata Sandi | Simpan password baru | Isian Kata Sandi, Pesan Inline, Tombol |
| U3 | Kepala Halaman, tiga Isian Kata Sandi | Simpan password baru | Isian Kata Sandi, Tombol |
| U4 | Kepala Halaman, tabel jenis dan harga per kg | Tidak ada | Tabel Buku, Pictogram Jenis |
| N2 | Kepala Halaman, Lembar Saldo ringkas, Tabel Buku mutasi, Paginasi | Tidak ada | Lembar Saldo, Tabel Buku, Paginasi |
| N3 | Kepala Halaman dengan Cap Status, nasabah dan tanggal, rincian, total di bawah garis ganda | Tidak ada | Lembar Konfirmasi (varian hanya-baca), Cap Status |
| P1 | Kepala Halaman, tombol Catat Setoran, kartu "Perlu diproses" dengan jumlah MENUNGGU dan DISETUJUI, lima setoran terakhir | Catat Setoran | Tombol, Tabel Buku |
| P7 | Kepala Halaman dengan Cap Status, nasabah, rincian, total; bila DIBATALKAN: alasan, pelaku, waktu | Batalkan setoran (hanya admin, bergaya Merusak) | Lembar Konfirmasi, Cap Status, Tombol |
| P8 | Kepala Halaman dengan nama dan email nasabah, Lembar Saldo, tombol Catat Setoran (petugas), Tabel Buku mutasi, Paginasi | Catat setoran untuk nasabah ini (petugas) | Lembar Saldo, Tabel Buku, Paginasi |
| P9 | Kepala Halaman, Isian Teks nama, Isian Teks email, Isian Kata Sandi awal | Daftarkan nasabah | Isian, Tombol, Kotak Rahasia Sekali Tampil |
| P11 | Dialog: ringkasan pengajuan, pilihan Setujui atau Tolak; Tolak menampilkan isian alasan | Setujui Rp 50.000 | Dialog, Pesan Inline, Isian Teks |
| P12 | Dialog: ringkasan, isian catatan opsional | Konfirmasi dana sudah diserahkan | Dialog, Isian Teks |
| A1 | Kepala Halaman, tiga baris angka (total saldo nasabah, pengajuan MENUNGGU, setoran hari ini) berbentuk daftar berlabel, bukan tiga kotak | Tidak ada | Tabel Buku, Tautan |
| A3 | Dialog: Isian Teks nama, Isian Uang harga per kg, pilihan pictogram opsional (Asumsi D1), catatan tetap tentang berlaku untuk setoran berikutnya | Simpan jenis sampah | Dialog, Isian |
| A4 | Kepala Halaman, Kotak Cari, filter peran dan status, Tabel Buku (nama, email, peran, status, aksi), Paginasi | Buat akun baru | Tabel Buku, Cap Status, Tombol |
| A5 | Kepala Halaman, pilihan peran (Petugas atau Admin), Isian nama, email, password awal | Buat akun | Pilihan Metode (varian pilihan peran), Isian, Kotak Rahasia Sekali Tampil |
| A6 | Dialog: nama pengguna, Isian Kata Sandi sementara dengan tombol Buat otomatis | Atur password sementara | Dialog, Kotak Rahasia Sekali Tampil |
| A8 | Tab Status "Penarikan dan saldo": periode, tabel per status (jumlah, total nominal), baris Total saldo seluruh nasabah | Tampilkan laporan | Tabel Buku, Pemilih Rentang Periode |
| A9 | Dialog: nasabah, total setoran, saldo sekarang dan sesudah, isian alasan | Batalkan setoran Rp 25.000 (Merusak) | Dialog, Pesan Inline, Isian Teks |
| X1, X2, X3 | Kepala Halaman, satu kalimat penyebab, satu tombol | Kembali ke Beranda (X1), Masuk lagi (X2), Coba lagi (X3) | Pesan Inline, Tombol |

## 7. Component library

Tiga puluh komponen. Perilaku (fokus, keyboard, ARIA) ditanam di primitif headless Radix; seluruh tampilan ditulis dari token bagian 3, sehingga tidak ada komponen yang terlihat seperti bawaan pustaka mana pun. Setiap komponen interaktif wajib punya state: **default, hover, fokus, ditekan, nonaktif**; state tambahan tertulis per komponen. Hover pada semua tombol dan baris berubah langsung (0 ms).

### Daftar ikon (tertutup)

Ikon memakai Phosphor Regular, 24 px (16 px di dalam Cap Status), ketebalan garis 1,5 px, warna mengikuti teks di sebelahnya. Hanya ikon di tabel ini yang boleh dipakai; ikon baru butuh keputusan desain. Ikon selalu berdampingan dengan kata.

| Fungsi | Ikon |
| --- | --- |
| Menu | House (Beranda), ClockCounterClockwise (Riwayat), Wallet (Tarik Saldo), Tag (Harga), Plus (Catat Setoran), Receipt (Setoran), Money (Penarikan), Users (Nasabah), ChartBar (Laporan), Gear (Kelola) |
| Aksi | MagnifyingGlass (Cari), PencilSimple (Ubah), Copy (Salin), Eye dan EyeSlash (Tampilkan dan Sembunyikan), X (Tutup), CaretRight dan CaretLeft (Lanjut dan Kembali), ArrowCounterClockwise (Coba lagi), SignOut (Keluar), User (Profil) |
| Status dan pesan | Hourglass, Check, Checks, X, Prohibit, Notebook (Cap Status); Info, Warning, WarningOctagon, CheckCircle, WifiSlash (Pesan Inline) |

### Pictogram jenis sampah

Delapan pictogram buatan sendiri, 24 px, garis 2 px `ink-900`, satu gaya: botol plastik, botol kaca, kardus, kertas, kaleng, logam, plastik lembaran, lainnya. Tujuannya mempercepat petugas memilih jenis dari bentuk. Bila jenis sampah belum diberi pictogram, tampil monogram: kotak 24 px berisi huruf pertama nama dengan huruf mono tebal. Pemberian pictogram memerlukan field opsional baru pada Jenis Sampah (lihat Asumsi D1); desain tetap utuh tanpa field itu.

### Tombol

Tinggi 48 px (ukuran Besar 56 px untuk Bilah Aksi Lekat), lebar minimal 96 px, padding horizontal `space-4`, `radius-2`, teks `text-body-strong`. Label menyebut hasil aksi (prinsip 2).

| Varian | Tampilan | Hover | Dipakai untuk |
| --- | --- | --- | --- |
| Utama | Latar `olive-700`, teks putih | Latar `olive-800` | Satu aksi terpenting per screen atau dialog |
| Sekunder | Latar `putih`, teks `ink-900`, garis `rule-ui` | Latar `olive-50` | Aksi pendamping, aksi baris di daftar |
| Merusak | Latar `bata-700`, teks putih, ikon Prohibit atau X di depan label | Label bergaris bawah 2 px | Tolak pengajuan, Batalkan setoran, Nonaktifkan |
| Teks | Tanpa latar, teks `olive-700` bergaris bawah | Garis bawah menebal jadi 2 px | Tindakan ringan: Hapus baris, Tampilkan, Hapus filter |

State tambahan: **Memproses** (label berganti, mis. "Menyimpan...", tombol tidak bisa ditekan, `aria-busy`, tanpa animasi putar) dan **Nonaktif** (latar `olive-50`, teks `ink-500`, tanpa garis; selalu disertai teks yang menjelaskan alasannya di dekatnya, karena tombol nonaktif tidak bisa menjelaskan dirinya).

### Isian

Label selalu tampak di atas isian; placeholder tidak pernah menggantikan label. Tinggi 48 px, garis `rule-ui`, `radius-2`, latar `putih`. Teks bantuan `text-small` di bawah isian.

| Komponen | Spesifikasi | State khusus |
| --- | --- | --- |
| Isian Teks | Nama, email, alasan (area teks 3 baris untuk alasan) | Galat: garis 2 px `bata-700`, ikon Warning dan teks galat di bawahnya; Hanya-baca: latar `olive-50`, tanpa garis |
| Isian Uang | Awalan "Rp" tetap di dalam isian, bilangan bulat saja, pemisah ribuan titik muncul saat mengetik, papan angka numerik | Galat jika melebihi saldo, menyebut angka batasnya |
| Isian Berat | Tinggi 64 px, teks `text-amount` 24 px angka tabular, akhiran "kg" tetap, papan angka desimal; menerima koma atau titik, dinormalkan ke dua desimal saat meninggalkan isian | Galat "Berat harus lebih dari 0" |
| Isian Kata Sandi | Teks tersembunyi, tombol ikon di dalam isian sisi kanan: Eye saat tersembunyi (menampilkan), EyeSlash saat terlihat (menyembunyikan), 24 px `ink-700`, tombol tanpa latar dan tanpa garis di semua state dengan hover berupa perubahan warna ikon ke `olive-700` secara instan, area sentuh 48 x 48 px, nama aksesibel "Tampilkan password" atau "Sembunyikan password" dengan `aria-pressed`; isian diberi padding kanan agar teks tidak menimpa ikon; atribut `autocomplete` sesuai (`current-password`, `new-password`) | Galat; kekuatan password tidak diberi meter warna, cukup aturan tertulis |
| Kotak Cari | Pola combobox; mulai mencari pada dua karakter; hasil menampilkan nama dan email | Mencari (teks "Mencari..."), Ada hasil, Tidak ada hasil, Galat jaringan |
| Pilihan Jenis Sampah | Daftar pilihan khusus (bukan elemen select bawaan) agar bisa menampilkan pictogram dan harga per kg; di ponsel terbuka sebagai sheet dengan opsi 56 px, di desktop sebagai popover | Terpilih ditandai ikon Check dan latar `olive-100`; jenis nonaktif tidak muncul |
| Pilihan Metode | Grup radio berbentuk baris besar 56 px: lingkaran radio, label, penjelasan satu baris. Dipakai juga untuk pilihan peran | Terpilih: titik radio terisi, latar `olive-100`, garis 2 px `ink-900` (bentuk, bukan hanya warna) |
| Pemilih Rentang Periode | Dua isian tanggal bawaan peramban (`type=date`) berlabel "Dari tanggal" dan "Sampai tanggal", format dd/mm/yyyy | Galat jika mulai setelah akhir |

### Cap Status

Cap tidak interaktif. Bentuk: persegi panjang `radius-1`, garis 1 px dan teks dalam warna -700, latar -100, ikon 16 px di depan kata kapital `text-cap`, tinggi minimal 28 px. Setiap status punya kata dan ikon sendiri, sehingga tetap berbeda dalam skala abu-abu.

| Status | Warna | Ikon | Dipakai pada |
| --- | --- | --- | --- |
| MENUNGGU | `kardus` | Hourglass | Pengajuan baru |
| DISETUJUI | `pet` | Check | Pengajuan disetujui, dana belum diserahkan |
| SELESAI | `daun` | Checks | Dana sudah diserahkan |
| DITOLAK | `bata` | X | Pengajuan ditolak |
| TERCATAT | `daun` | Notebook | Setoran sah |
| DIBATALKAN | `bata` | Prohibit | Setoran dibatalkan |
| AKTIF | `daun` | Check | Jenis sampah atau akun aktif |
| NONAKTIF | netral (`putih`, `ink-700`, garis `line-500`; tanpa isian warna agar berbeda dari Cap hijau AKTIF dan SELESAI) | Prohibit | Jenis sampah atau akun nonaktif |

### Angka

Komponen tampilan untuk nilai uang dan berat: angka tabular, rata kanan di tabel, satuan selalu menyertai ("Rp 25.000", "2,50 kg"), spasi tak terputus agar satuan tidak terpisah baris. Varian: Display (saldo), Amount (daftar), Kecil (sel padat). Tidak ada singkatan "rb" atau "jt", dan tidak ada angka yang dipotong dengan elipsis.

### Tabel Buku dan Daftar Baris

Tabel Buku adalah komponen data utama. Kepala kolom `text-small` bobot 700 `ink-700`; baris minimal 48 px; garis `rule-1` antarbaris; kolom angka rata kanan; baris total di bawah `rule-total`. Baris selang-seling `olive-50` hanya dipakai pada tabel lebih dari lima baris di layar lebar. Tidak ada pengurutan kolom di MVP.

Di bawah 600 px, tabel berubah menjadi **Daftar Baris**: tiap data menjadi blok bertumpuk, baris atas berisi keterangan dan tanggal, baris bawah berisi angka berlabel ("Masuk", "Keluar", "Saldo") rata kanan. Tidak pernah ada scroll horizontal.

State: **Memuat** (lima baris skeleton), **Kosong** (Keadaan Kosong), **Galat** (Pesan Inline dengan tombol Coba lagi), **Baris baru** (latar `olive-100` hingga dimuat ulang), **Baris dibatalkan** (angka dicoret dan Cap DIBATALKAN).

### Komponen setoran dan saldo

| Komponen | Isi dan perilaku | Varian | State |
| --- | --- | --- | --- |
| Baris Rincian Setoran | Pilihan Jenis Sampah, Isian Berat, harga per kg dan subtotal hanya-baca, tombol Teks Hapus baris | Satu baris (tanpa Hapus baris) dan banyak baris | Kosong, Terisi, Galat per baris, Harga berubah (baris ditandai Pesan Inline kardus "Harga baru Rp 2.500 per kg") |
| Lembar Saldo | Saldo besar, saldo tersedia, penjelasan pengajuan menunggu | Nasabah (dengan tombol Tarik saldo), Ringkas (tanpa tombol), Pantauan petugas dan admin | Memuat, Terisi, Saldo nol ("Saldo Rp 0", teks arahan ke petugas), Galat |
| Lembar Konfirmasi | Rincian setoran sebagai bacaan: nasabah, baris, garis ganda, total | Konfirmasi (di P4), Bukti (di P5), Hanya-baca (di N3 dan P7) | Terisi, Dibatalkan (dicoret dan disertai alasan) |
| Kartu Pengajuan | Nama atau tanggal, nominal, metode, Cap Status, detail e-wallet, aksi baris | Per status: MENUNGGU, DISETUJUI, DITOLAK, SELESAI; Nasabah dan Staf | Default, Memproses, Sudah diproses pihak lain (pesan dan aksi dinonaktifkan) |
| Kepala Konteks Nasabah | Bilah lekat berisi nama dan email nasabah yang sedang dikerjakan serta tautan Ganti | Tunggal | Default |

### Struktur dan navigasi

| Komponen | Spesifikasi |
| --- | --- |
| Kepala Halaman | h1, keterangan opsional `text-small`, slot untuk satu aksi di kanan (desktop) atau di Bilah Aksi Lekat (ponsel); di kanan atas ada nama pengguna yang membuka menu Profil dan Keluar |
| Bilah Menu | Ponsel: bilah bawah setinggi 64 px, 4 sampai 5 item, ikon di atas kata `text-small`. Desktop: bilah samping 240 px, item 48 px, ikon di kiri kata. Item aktif: kata tebal, latar `olive-100`, penanda 3 px `olive-700` (atas di ponsel, kiri di desktop). Hitungan ditulis di kata: "Penarikan (3)" |
| Tab Status | `role=tablist`; item aktif bertanda garis bawah 3 px `ink-900`, latar `putih`, kata tebal. Di ponsel empat tab ditata 2 kolom × 2 baris agar tidak ada scroll horizontal |
| Bilah Aksi Lekat | Wadah melekat di atas Bilah Menu, latar `putih`, `rule-1` di atas, padding `space-4`, menghormati area aman perangkat; berisi tombol Utama (dan Sekunder bila ada) |
| Paginasi | Tombol Sekunder **Sebelumnya** dan **Berikutnya**, teks "Halaman 2 dari 7" di tengah; tanpa deret nomor halaman |
| Tautan | `olive-700`, selalu bergaris bawah 1,5 px |

### Umpan balik

| Komponen | Varian | Spesifikasi |
| --- | --- | --- |
| Pesan Inline | Info (`pet`), Peringatan (`kardus`), Galat (`bata`), Berhasil (`daun`) | Latar -100 tanpa garis tepi, ikon berwarna -700, judul tebal, teks isi `ink-900`. Galat memakai `role=alert`, sisanya `role=status` |
| Toast | Satu varian | Latar `ink-900`, teks putih, di atas Bilah Menu, tampil 8 detik dengan tombol Tutup; satu pada satu waktu. Hanya untuk konfirmasi ringan ("Password diganti"); tidak untuk galat dan tidak untuk apa pun yang butuh tindakan |
| Dialog | Biasa dan Merusak | Modal dengan penjebak fokus. Di bawah 600 px muncul sebagai sheet dari bawah dengan tombol bertumpuk selebar penuh; di atasnya muncul di tengah selebar 480 px. Judul h2, tombol Tutup berlabel kata di kanan atas. Klik pada scrim tidak menutup dialog yang berisi isian; Esc menutup kecuali saat proses berjalan |
| Keadaan Kosong | Per screen | Judul `text-h3`, satu kalimat penjelas, satu tindakan bila ada. Tanpa ilustrasi |
| Skeleton | Baris dan blok | Blok `olive-50` statis tanpa kilau; wadah diberi `aria-busy=true` |
| Kotak Rahasia Sekali Tampil | Password awal dan password sementara | Teks angka tabular 24 px di latar `olive-50`, tanpa karakter I, l, 1, O, 0 pada password yang dibuat sistem, tombol Salin, peringatan "Tidak bisa dilihat lagi setelah layar ini ditutup" |

## 8. State

PRD menyatakan BinBank dipakai saat ada koneksi dan tidak punya mode offline (U5), dan tidak ada antrean offline: data dianggap belum tersimpan sampai server mengonfirmasi (PRD bagian 8). Maka "offline" di sini berarti **cara layar berperilaku saat koneksi hilang**, bukan fitur kerja tanpa jaringan. Aturan global dulu, lalu isi tiap screen kunci.

### Aturan global

**Memuat.** Tidak ada indikator sebelum 300 ms, supaya tidak berkedip. Setelah itu tampil Skeleton statis pada bentuk konten yang akan datang. Setelah 10 detik, Pesan Inline Info "Memuat lebih lama dari biasanya" dengan tombol **Coba lagi**.

**Angka tidak dikenal tidak pernah tampil sebagai nol.** Bila saldo atau total gagal dimuat, tempatnya berisi teks "Belum termuat", bukan "Rp 0". Nol yang salah di layar uang lebih berbahaya daripada kosong yang jujur.

**Galat baca (server tidak menjawab).** Pesan Inline Galat di tempat konten, "Data belum bisa dimuat", tombol **Coba lagi**. Data yang sebelumnya sudah termuat tidak dihapus dari layar.

**Galat tulis (simpan, ajukan, setujui, batalkan).** Tidak pernah mengulang otomatis. Pesan harus menyatakan apakah hasilnya pasti atau tidak pasti. Bila tidak pasti (waktu habis, koneksi putus): "Belum dipastikan tersimpan. Periksa \[daftar terkait\] sebelum mencoba lagi", dengan tautan ke daftar yang relevan.

**Offline (koneksi hilang).** Pesan Inline Peringatan dengan ikon WifiSlash melekat di bawah Kepala Halaman: "Tidak ada koneksi. Angka di layar bisa sudah berubah. Menyimpan dimatikan sampai koneksi kembali." Aturan turunannya:

- Data yang sudah termuat tetap tampil dengan stempel "Dimuat pukul 14.32 WIB". Data keuangan tidak disimpan lintas sesi dan tidak ada service worker yang menyimpan saldo, supaya saldo lama tidak pernah tampil sebagai saldo terkini setelah layar dibuka ulang.
- Semua tombol yang menulis ke server menjadi Nonaktif, dengan teks alasan di dekatnya. Tombol yang hanya pindah layar (mis. Periksa setoran) tetap aktif.
- Isian yang sudah diketik tetap utuh selama halaman tidak ditutup.
- Saat koneksi kembali: banner berubah menjadi Berhasil "Koneksi kembali", data baca dimuat ulang otomatis, isian tidak dihapus, lalu banner hilang setelah 5 detik.

**Sesi (401).** Token habis atau akun dinonaktifkan: ke X2 atau X1. Isian yang belum tersimpan tidak dijamin (PRD bagian 8).

**Berhasil.** Aksi yang mengubah uang atau saldo berakhir di layar hasil yang menampilkan angka (P5 untuk setoran, N5 untuk pengajuan, baris pengajuan yang pindah tab untuk persetujuan), bukan hanya toast. Aksi ringan (ganti password, simpan jenis sampah) berakhir dengan toast.

**Waktu.** Semua tanggal dan jam ditulis dalam WIB, dengan akhiran "WIB" bila ada jam (PRD U4).

### State per screen kunci

| Screen | Kosong | Galat | Berhasil | Offline |
| --- | --- | --- | --- | --- |
| U1 Masuk | Tidak berlaku | "Email atau password tidak cocok, atau akun tidak aktif." (satu pesan untuk semua penyebab, F1.4). Server tidak terjangkau: "BinBank sedang tidak bisa dihubungi. Coba lagi sebentar lagi." | Pindah ke Beranda; atau U2 bila password sementara | Tombol Masuk nonaktif; teks "Masuk membutuhkan koneksi" |
| U2 Ganti Password Wajib | Tidak berlaku | Password lama salah; password baru kurang dari batas minimum (Asumsi D2); isian ulang tidak sama; tiap galat di bawah isian terkait | Toast "Password diganti", lalu Beranda | Tombol nonaktif dengan alasan |
| N1 Beranda Nasabah | Saldo "Rp 0"; mutasi: "Belum ada setoran. Setoran akan muncul di sini setelah petugas mencatatnya." | Saldo "Belum termuat" dengan Coba lagi; mutasi bisa gagal sendiri tanpa menyembunyikan saldo | Tidak berlaku | Data terakhir dengan stempel waktu; tombol Tarik saldo tetap aktif karena hanya pindah layar |
| N2 Riwayat Mutasi | "Belum ada mutasi" | Galat baca; galat saat Berikutnya tidak menghapus halaman yang sudah ada | Tidak berlaku | Halaman termuat tetap tampil; Paginasi nonaktif |
| N4 Ajukan Penarikan | Saldo tersedia Rp 0: isian disembunyikan, tampil "Saldo tersedia Rp 0. Belum ada yang bisa ditarik." Bila ada pengajuan menunggu yang menghabiskan saldo: "Seluruh saldo sedang menunggu keputusan pengajuan sebelumnya" | Melebihi saldo tersedia (menyebut angkanya); e-wallet tanpa nama atau nomor; gagal kirim tidak pasti: "Pengajuan belum dipastikan terkirim. Periksa halaman Pengajuan Saya sebelum mengajukan lagi" dengan tautan | Pindah ke N5, pengajuan baru MENUNGGU disorot, toast "Pengajuan terkirim" | Tombol Ajukan nonaktif dengan alasan; isian tetap |
| N5 Pengajuan Saya | "Belum ada pengajuan penarikan" dengan tautan **Tarik saldo** | Galat baca | Pengajuan baru disorot `olive-100` | Data terakhir dengan stempel waktu |
| P2 Cari Nasabah | Belum mengetik: "Ketik minimal dua huruf nama atau email". Tidak ada hasil: "Tidak ada nasabah dengan nama atau email itu" dan tautan **Daftarkan nasabah baru** | "Pencarian gagal. Coba lagi" | Daftar hasil | Kotak Cari nonaktif dengan alasan |
| P3 Form Setoran | Satu Baris Rincian kosong; bila tidak ada jenis aktif: "Belum ada jenis sampah aktif. Minta admin menambahkannya" dan tombol Periksa nonaktif | Berat tidak valid per baris; jenis belum dipilih; daftar jenis gagal dimuat | Lanjut ke P4 | Tetap bisa mengisi dan menekan Periksa setoran (tanpa server); harga yang tampil bisa ketinggalan, diberi stempel waktu |
| P4 Konfirmasi Setoran | Tidak berlaku | Harga atau jenis berubah: kembali ke P3 dengan baris ditandai. Berat ditolak server: kembali ke P3 dengan pesan per baris. Nasabah nonaktif: "Akun nasabah ini tidak aktif" (menunggu OQ-24). Gagal tidak pasti: seperti J2 | P5 | Tombol Simpan nonaktif: "Tidak ada koneksi. Setoran belum disimpan. Rincian tetap di layar selama halaman tidak ditutup." |
| P5 Setoran Tersimpan | Tidak berlaku | Bila saldo baru gagal dibaca, bukti tetap tampil dan saldo diberi "Belum termuat" | Layar ini adalah keberhasilannya; Cap TERCATAT | Bukti tetap tampil karena berasal dari respons simpan |
| P6 Daftar Setoran | Tanpa filter: "Belum ada setoran". Dengan filter: "Tidak ada setoran yang cocok dengan filter" dan tautan **Hapus filter** | Tanggal mulai setelah akhir: galat di Pemilih Rentang, hasil lama dipertahankan; galat baca | Daftar hasil | Data terakhir; filter dan paginasi nonaktif |
| P10 Antrean Penarikan | Per tab: MENUNGGU "Tidak ada pengajuan yang menunggu"; DISETUJUI "Tidak ada dana yang perlu diserahkan"; DITOLAK dan SELESAI "Belum ada" | Sudah diproses pihak lain: "Pengajuan ini sudah diproses oleh \[nama\]", daftar dimuat ulang. Saldo kurang saat setuju (F8.5). Gagal tidak pasti: periksa tab sebelum mengulang | Kartu pindah tab dan toast "Pengajuan disetujui" atau "Pengajuan ditolak" atau "Ditandai selesai" | Semua aksi baris nonaktif; daftar tetap terbaca dengan stempel waktu |
| A2 Jenis Sampah | "Belum ada jenis sampah. Tambahkan jenis pertama agar petugas bisa mencatat setoran." dengan tombol Tambah | Nama sudah dipakai; harga 0 atau kurang | Baris disorot, toast "Jenis sampah disimpan" | Tombol Tambah, Ubah, Nonaktifkan nonaktif |
| A4 Pengguna | Dengan filter tanpa hasil: "Tidak ada akun yang cocok" | Email sudah dipakai (di A5); gagal tidak pasti | Toast pada reset, nonaktifkan, aktifkan | Aksi tulis nonaktif |
| A7 Laporan Setoran | Periode tanpa setoran: tabel menampilkan "Tidak ada setoran pada periode ini" dan baris total "0,00 kg" dan "Rp 0" (bukan galat, F9.6) | Mulai setelah akhir: ditolak dengan pesan; galat baca | Tabel dengan total | Data terakhir; tombol Tampilkan laporan nonaktif |

## 9. Responsive behaviour

Desain dimulai dari ponsel 360 px karena mayoritas nasabah memakai smartphone (PRD bagian 2) dan petugas bekerja berdiri di lokasi penimbangan. Desktop adalah peningkatan, bukan sumber desain: admin yang membuka laporan di komputer mendapat tabel penuh, tetapi tidak ada fungsi yang hanya ada di desktop.

### Breakpoint dan grid

| Kelas | Lebar | Kolom | Gutter dan margin | Lebar konten maksimum |
| --- | --- | --- | --- | --- |
| Mobile | 360 sampai 599 px | 4 | 16 px (`space-4`) | Penuh |
| Tablet | 600 sampai 1023 px | 8 | 24 px (`space-5`) | 640 px untuk formulir dan bacaan, penuh untuk tabel |
| Desktop | 1024 px ke atas | 12 | 32 px (`space-6`) | 1120 px, di tengah, margin atas `space-8` |

Layar tidak boleh rusak sampai 320 px (kebutuhan zoom 400% dan ponsel kecil): satu kolom, tanpa scroll horizontal, teks tidak terpotong. Ukuran huruf tidak pernah mengecil di bawah token; yang berubah hanya tata letak.

### Perilaku per kelas

| Aspek | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Navigasi | Bilah bawah 64 px, 4 sampai 5 item | Sama dengan mobile | Bilah samping 240 px, melekat |
| Kolom | Satu kolom | Satu kolom; Beranda boleh dua kolom (saldo dan mutasi) | Dua kolom pada screen berisi isian dan ringkasan |
| Tabel Buku | Berubah menjadi Daftar Baris (di bawah 600 px) | Tabel penuh | Tabel penuh, baris selang-seling |
| Tombol utama formulir | Di Bilah Aksi Lekat, lebar penuh | Di Bilah Aksi Lekat, lebar 400 px di tengah | Di akhir formulir atau di panel ringkasan, lebar sesuai isi |
| Dialog | Sheet dari bawah, tombol bertumpuk lebar penuh | Dialog di tengah 480 px | Dialog di tengah 480 px |
| Tab Status | 2 × 2 | Satu baris | Satu baris |
| Angka saldo | `text-display` 40 px | 40 px | 48 px |
| Target sentuh | 48 × 48 px | 48 × 48 px | 48 × 48 px (sama; tidak ada target kecil khusus desktop) |

### Screen kunci

| Screen | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| N1 Beranda | Lembar Saldo di atas, lalu mutasi | Sama | Lembar Saldo di kiri (5 kolom), mutasi terbaru di kanan (7 kolom) |
| P3 Form Setoran | Baris Rincian bertumpuk; total di bawah daftar; Periksa setoran di Bilah Aksi Lekat | Sama | Baris Rincian di kolom kiri (8 kolom); panel Total melekat di kanan (4 kolom) berisi total dan tombol Periksa setoran, sehingga total selalu terlihat tanpa menggulir |
| P4 Konfirmasi | Satu kolom, tabel rincian sebagai Daftar Baris | Satu kolom 640 px, tabel penuh | Satu kolom 640 px di tengah; sengaja tidak melebar agar mata tidak berpindah jauh antara berat dan nilai |
| P6 Daftar Setoran | Filter dilipat dalam satu tombol **Filter** yang membuka sheet; daftar bertumpuk | Filter terbuka dalam satu baris; tabel penuh | Filter terbuka di atas tabel; tabel penuh |
| P10 Antrean | Kartu Pengajuan bertumpuk; aksi baris di bawah kartu | Sama | Tabel Buku dengan kolom aksi di kanan; detail e-wallet di kolom sendiri |
| A2, A4 | Daftar Baris dengan aksi di bawah tiap baris | Tabel penuh | Tabel penuh; tombol utama di kanan Kepala Halaman |
| A7 Laporan | Pemilih Rentang bertumpuk; tabel tiga kolom tetap muat (Jenis, Berat, Nilai) | Pemilih Rentang sejajar | Pemilih Rentang sejajar dengan tombol di satu baris |

### Hal khusus ponsel

- **Papan ketik terbuka.** Bilah Aksi Lekat mengikuti tepi atas papan ketik (via viewport visual) dan Bilah Menu disembunyikan selama isian berfokus, untuk memberi ruang. Isian yang berfokus digulir ke tengah layar.
- **Landscape ponsel (tinggi di bawah 500 px).** Bilah Aksi Lekat tidak melekat dan menjadi bagian akhir formulir; Bilah Menu menyusut ke 48 px dengan ikon dan kata berdampingan.
- **Area aman.** Bilah bawah dan Bilah Aksi Lekat menambahkan inset area aman perangkat.
- **Penggunaan satu tangan.** Aksi pokok (Catat Setoran, Periksa setoran, Simpan setoran) berada di sepertiga bawah layar.
- **Orientasi dan zoom.** Tidak ada penguncian orientasi; zoom peramban tidak dinonaktifkan.
- **Cetak.** Gaya cetak menyembunyikan menu, memakai latar putih dan teks hitam. Tidak ada tombol Cetak di MVP.

### Performa sebagai bagian dari desain

Target ponsel murah di jaringan seluler: halaman Masuk dan Beranda tidak memuat lebih dari 250 KB total termasuk huruf (huruf maksimal 120 KB, bagian 3), tanpa pustaka animasi, tanpa gambar bitmap. Pictogram dan ikon berupa SVG sebaris.

## 10. Accessibility

**Standar:** WCAG 2.2 level AA untuk semua kriteria, dengan tiga pengetatan internal: kontras teks isi 7:1 (setara AAA 1.4.6), target sentuh 48 × 48 px (lebih ketat dari 24 px pada 2.5.8), dan status tidak pernah hanya berupa warna. Alasan pengetatan: pengguna mencakup lansia dan petugas yang bekerja di luar ruangan (prinsip 3), bukan pengguna rata-rata.

### Rasio kontras

Tabel lengkap pasangan teks ada di bagian 3 dan semuanya sudah dihitung. Tambahan untuk pasangan yang muncul di komponen:

| Pasangan | Rasio | Dipakai untuk | Syarat |
| --- | --- | --- | --- |
| `ink-900` pada `kardus-100` | 13,43:1 | Teks isi Pesan Inline Peringatan | 7:1 |
| `ink-900` pada `pet-100` | 13,24:1 | Teks isi Pesan Inline Info | 7:1 |
| `ink-900` pada `bata-100` | 13,17:1 | Teks isi Pesan Inline Galat | 7:1 |
| `ink-900` pada `daun-100` | 13,38:1 | Teks isi Pesan Inline Berhasil | 7:1 |
| `ink-900` pada `olive-100` | 11,33:1 | Item terpilih, baris baru | 7:1 |
| `ink-700` pada `olive-100` | 7,41:1 | Keterangan pada item terpilih (`ink-500` tidak dipakai di `olive-100`: 4,49:1) | 7:1 |
| `ink-700` pada `putih` | 10,36:1 | Label kolom di kartu | 7:1 |
| `bata-700` pada `putih` | 8,87:1 | Teks galat di bawah isian di halaman dan kartu | 7:1 |
| `olive-700` pada `olive-50` | 6,36:1 | Focus ring di area sekunder | 3:1 |
| `line-500` pada `olive-100` | 3,10:1 | Batas radio dan kotak pada item terpilih | 3:1 |

Focus ring `olive-700` berkontras 7,27:1 pada `putih` dan 6,36:1 pada `olive-50`, jauh di atas 3:1. Ring digambar dengan `outline` (bukan `box-shadow`) agar tetap tampil pada mode kontras tinggi Windows.

Aturan pendamping kontras:

- Informasi tidak pernah disampaikan hanya lewat warna: status = kata + ikon + warna; item terpilih = tanda Check atau titik radio + latar + garis tebal; item menu aktif = kata tebal + penanda + latar; mutasi = kolom Masuk dan Keluar.
- Teks pendukung `ink-500` hanya untuk keterangan sekunder (waktu, bantuan isian), bukan untuk informasi yang diperlukan untuk memutuskan, misalnya alasan penolakan (memakai `ink-900`).
- Tidak ada teks di atas gambar atau gradien. Tidak ada teks yang dibatasi hanya oleh `line-300`.

### Struktur dan urutan fokus

Semua halaman memakai `<html lang="id">`, judul dokumen unik berpola "Setoran baru - BinBank", satu h1 per halaman, dan tingkat heading yang tidak melompat. Urutan DOM: tautan **Lewati ke isi halaman** (selalu elemen fokus pertama, tampil saat fokus), header, menu, isi. Menu ditempatkan sebelum isi agar urutan DOM sama dengan urutan visual di desktop; di ponsel, tautan lewati menjaga pengguna papan ketik dan pembaca layar tidak melewati menu pada tiap halaman.

**Manajemen fokus.**

- Pindah halaman: fokus ke h1 halaman baru (`tabindex=-1`), judul dokumen diperbarui.
- Dialog terbuka: fokus ke judul dialog; pada dialog Merusak yang butuh alasan (Tolak, Batalkan setoran), fokus langsung ke isian alasan. Dialog tertutup: fokus kembali ke pemicu; bila pemicu sudah hilang (kartu pindah tab), fokus ke daftar yang terdampak.
- Baris Rincian ditambah: fokus ke Pilihan Jenis Sampah pada baris baru. Baris dihapus: fokus ke Pilihan Jenis baris sebelumnya, atau ke **Tambah jenis lain** bila tinggal satu baris.
- Pengiriman gagal validasi: fokus ke isian pertama yang salah. Bila lebih dari satu galat, Pesan Inline Galat di atas formulir mendaftar galat sebagai tautan ke tiap isian.

| Screen | Urutan fokus |
| --- | --- |
| U1 Masuk | Lewati, Email, Password, Tampilkan, Masuk |
| P2 Cari Nasabah | Lewati, Menu, Kotak Cari, hasil (panah atas bawah), Daftarkan nasabah baru |
| P3 Form Setoran | Lewati, Menu, Ganti nasabah, \[Jenis, Berat, Hapus baris\] per baris, Tambah jenis lain, Periksa setoran |
| P4 Konfirmasi | h1, Simpan setoran, Kembali dan ubah (tombol utama sebelum tombol batal, tetapi dipisah 16 px atau lebih) |
| N4 Ajukan Penarikan | Lewati, Menu, Nominal, Metode (grup radio), \[Nama e-wallet, Nomor e-wallet\], Ajukan penarikan |
| P10 Antrean | Lewati, Menu, Tab Status, \[Setujui, Tolak, Salin nomor\] per kartu, Paginasi |
| Dialog Proses | Judul, \[Setujui, Tolak\] atau isian alasan, tombol Utama, Tutup |

### Navigasi dengan papan ketik

Semua fungsi bisa dioperasikan tanpa mouse dan tanpa gestur geser. Tidak ada pintasan satu tombol (menghindari kriteria 2.1.4).

| Komponen | Tombol |
| --- | --- |
| Semua | Tab dan Shift+Tab bergerak; tidak ada jebakan fokus kecuali dialog (yang memang menjebak, dan Esc membukanya) |
| Tombol | Enter dan Spasi |
| Tautan | Enter |
| Kotak Cari | Panah bawah membuka dan bergerak ke hasil berikutnya, panah atas mundur, Enter memilih, Esc menutup daftar lalu mengosongkan isian pada Esc kedua, Home dan End ke hasil pertama dan terakhir |
| Pilihan Jenis Sampah | Enter atau Spasi membuka, panah bergerak, huruf awal melompat (type-ahead), Enter memilih, Esc menutup tanpa mengubah |
| Pilihan Metode (radio) | Panah berpindah dan memilih, Tab keluar dari grup |
| Tab Status | Panah kiri kanan menggeser fokus, Home dan End ke ujung, Enter atau Spasi mengaktifkan (aktivasi manual, karena tiap tab memuat data dari server) |
| Dialog | Tab berputar di dalam dialog, Esc menutup kecuali saat proses berjalan |
| Formulir setoran | Enter pada isian tidak menyimpan setoran; penyimpanan hanya lewat tombol **Simpan setoran** di P4 |

### Kebutuhan ARIA dan semantik

Elemen HTML bawaan didahulukan; ARIA hanya menambal yang tidak tercakup.

| Komponen | Semantik |
| --- | --- |
| Landmark | `header` (banner), `nav` dengan `aria-label="Menu utama"`, `main`; item aktif memakai `aria-current="page"` |
| Isian | `<label for>` yang terlihat; `aria-describedby` menunjuk bantuan dan galat; `aria-invalid="true"` saat salah; wajib ditandai kata "wajib" bila perlu, isian opsional ditandai "(opsional)"; atribut `autocomplete` sesuai (`email`, `current-password`, `new-password`) |
| Isian Uang dan Isian Berat | `<input type="text" inputmode="numeric">` atau `"decimal"`, bukan `type=number` (menghindari tombol naik turun, perubahan nilai lewat roda gulir, dan koersi diam-diam); satuan bagian dari label ("Nominal, rupiah", "Berat, kilogram") |
| Kotak Cari | Pola combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`; daftar `role="listbox"` berisi `role="option"`; wilayah `aria-live="polite"` mengumumkan "5 hasil" atau "Tidak ada hasil" |
| Pilihan Jenis Sampah | Listbox; nama opsi "Botol plastik, Rp 2.500 per kg"; pictogram `aria-hidden="true"` |
| Pilihan Metode | `role="radiogroup"` dengan `aria-labelledby`; radio asli |
| Cap Status | Teks nyata; ikon `aria-hidden`; kapital dibuat dengan CSS `text-transform`, bukan diketik kapital, agar pembaca layar membaca kata biasa ("Menunggu", bukan mengeja) |
| Tabel Buku | `<table>` asli dengan `<caption>` (boleh tersembunyi secara visual), `<th scope>`; baris total di `<tfoot>`. Daftar Baris di ponsel tetap tabel yang sama dengan tampilan CSS berbeda dan `role` eksplisit agar semantik tidak hilang. Sel kosong pada Masuk atau Keluar berisi teks tersembunyi "kosong" |
| Angka dicoret (DIBATALKAN) | Dibungkus `<del>`; ditambah teks tersembunyi "dibatalkan", karena coretan tidak dibacakan |
| Tab Status | `tablist`, `tab` (dengan `aria-selected`, `aria-controls`), `tabpanel`; hitungan menjadi bagian nama tab ("Menunggu, 3") |
| Tombol memproses | `aria-busy="true"`, label berganti, wilayah live sopan mengumumkan "Menyimpan setoran" lalu hasilnya |
| Dialog | `role="dialog"` (`alertdialog` untuk Merusak), `aria-modal="true"`, `aria-labelledby` ke judul, `aria-describedby` ke ringkasan; latar belakang `inert` |
| Pesan Inline | Galat `role="alert"`; lainnya `role="status"`; wadah live sudah ada di DOM sebelum teksnya diisi agar pengumuman terbaca |
| Toast | `role="status"`, `aria-live="polite"`; fokus tidak dipindah; berhenti menghitung mundur saat disorot atau berfokus; 8 detik |
| Skeleton dan Memuat | Wadah `aria-busy="true"`; satu teks tersembunyi "Memuat" dalam `role="status"` |
| Offline | Banner `role="status"`; saat koneksi kembali, perubahan teks diumumkan |
| Kotak Rahasia | Teks dapat dipilih dan dibaca; tombol Salin mengumumkan "Tersalin" lewat wilayah live |
| Paginasi | `nav` dengan `aria-label="Halaman daftar"`; "Halaman 2 dari 7" sebagai teks |
| Gambar dan ikon | Pictogram, monogram, dan ikon dekoratif `aria-hidden="true"`; karena ikon selalu bersama kata, tidak ada ikon yang butuh nama sendiri |

### Kognitif dan bahasa

- Bahasa Indonesia sehari-hari, kalimat pendek, satu gagasan per kalimat. Galat menyebut penyebab dan langkah berikutnya ("Melebihi saldo tersedia Rp 128.500"), bukan kode.
- Autentikasi aksesibel (3.3.8): isian password menerima tempel dan pengelola password; tidak ada tes kognitif, CAPTCHA, atau pengetikan ulang kode.
- Tanpa entri ulang (3.3.7): saat harga berubah atau jaringan gagal, isian setoran dipertahankan.
- Bantuan konsisten (3.2.6): teks arahan "Lupa password?" selalu di tempat yang sama di U1.
- Batas waktu (2.2.1): token berlaku 8 jam dan tidak dapat diperpanjang. Lima menit sebelum habis, Pesan Inline Peringatan memberi tahu: "Sesi berakhir dalam 5 menit. Selesaikan pekerjaan lalu masuk lagi" (Asumsi D4).
- Gerak: tidak ada gerak dekoratif; `prefers-reduced-motion` menurunkan semua gerak ke 0 ms.

### Zoom, reflow, dan mode kontras

- Teks membesar sampai 200% tanpa kehilangan fungsi. Reflow pada 320 px tanpa scroll horizontal (kecuali isi yang memang dua dimensi; tidak ada pada BinBank).
- Ukuran huruf memakai `rem`; tinggi komponen memakai `min-height`, bukan tinggi tetap, agar tidak terpotong saat teks membesar.
- Penimpaan jarak teks (kriteria 1.4.12) tidak memotong konten.
- Mode kontras tinggi (`forced-colors`): batas komponen memakai `border` asli, ring fokus memakai `outline`, Cap Status mempertahankan garis dan ikon.

### Rencana pengujian aksesibilitas

1. **Otomatis:** axe-core di CI pada tiap screen dan state kunci; gagal build bila ada pelanggaran serius.
2. **Papan ketik saja:** journey J1 sampai J5 diselesaikan tanpa mouse.
3. **Pembaca layar:** TalkBack di Android (perangkat utama pengguna), VoiceOver di iOS, NVDA di desktop; minimal J1, J2, J4.
4. **Skala abu-abu:** tangkapan layar semua screen kunci diubah ke abu-abu; seluruh status harus tetap dapat dibedakan.
5. **Zoom dan reflow:** 200% pada 1280 px dan 320 px lebar.
6. **Pengguna nyata:** dalam uji coba satu RW (OQ-19), sertakan setidaknya tiga nasabah lansia dan satu petugas yang menguji di lokasi penimbangan sebenarnya.

## 11. Asumsi dan pertanyaan terbuka desain

Brief ini mengikuti PRD dan tidak mengubah ruang lingkupnya. Di tempat PRD diam, desain mengambil posisi sementara yang tertulis di sini supaya bisa dikoreksi sebelum ada kode. Kode D mengacu ke bagian lain brief ini.

### Asumsi desain yang perlu dikonfirmasi

| ID | Asumsi | Dampak bila salah | Untuk |
| --- | --- | --- | --- |
| D1 | Jenis Sampah mendapat satu field opsional baru `ikon` (pilihan dari 8 pictogram) yang diisi admin di A3. Ini perubahan kecil pada PRD F3 dan data model. Tanpa field itu, semua jenis tampil dengan monogram huruf pertama | Pictogram batal; desain tetap utuh dengan monogram | Tim: setuju atau tidak |
| D2 | Password minimal 8 karakter, tanpa aturan campuran huruf dan angka. PRD tidak menyebut aturan password | Teks galat di U2, U3, P9, A5, A6 berubah | Tim |
| D3 | Password awal (P9, A5) dan password sementara (A6) ditampilkan sekali di layar agar petugas atau admin dapat menyampaikannya ke pengguna. Admin boleh mengetik sendiri atau memakai tombol **Buat otomatis** (acak). PRD F2.7 hanya menyebut "password sementara" | Kotak Rahasia Sekali Tampil dan tombol Buat otomatis dihapus; sumber password harus diputuskan | Tim |
| D4 | Lima menit sebelum token 8 jam habis, klien memperingatkan pengguna (dari klaim waktu kedaluwarsa pada token). Tidak ada perpanjangan sesi | Tanpa peringatan, pengguna kehilangan isian tanpa aba-aba | Tim |
| D5 | Total di P3 dan P4 adalah pratinjau yang dihitung klien dengan aturan pembulatan yang sama (PRD U3); nilai resmi dari server. Bila nilai server berbeda dari pratinjau, P5 menampilkan Pesan Inline Peringatan "Nilai resmi berbeda dari pratinjau". Perbedaan ini seharusnya tidak pernah terjadi (metrik M3) | Bila hitungan klien tidak dipakai, P3 dan P4 menampilkan total tanpa angka sampai server menjawab | Tim |
| D6 | Pesan galat login sama untuk email salah, password salah, dan akun nonaktif ("Email atau password tidak cocok, atau akun tidak aktif"), agar akun tidak bisa ditebak. PRD F1.4 hanya mengatur dua penyebab pertama | Pesan akun nonaktif yang lebih spesifik membantu nasabah tetapi membocorkan keberadaan akun | Tim |
| D7 | Petugas dan Admin memakai screen yang sama (P1 sampai P12) dengan menu berbeda; Admin hanya menambah tombol di P7 | Bila peran perlu tampilan terpisah, inventaris screen bertambah | Tim |
| D8 | Lokasi penimbangan dianggap terbuka dan terang (dasar prinsip 3). Belum dikonfirmasi | Bila di dalam ruangan, kontras 7:1 tetap dipertahankan karena murah, tetapi alasannya berubah | Pengelola RW |
| D9 | Perangkat pengguna adalah ponsel Android kelas menengah ke bawah dengan peramban modern dan layar minimal 360 px. Belum ada data (terkait OQ-20) | Bila ada perangkat lebih kecil atau peramban lama, anggaran performa dan dukungan CSS ditinjau ulang | Pengelola RW |
| D10 | Tidak ada logo. "BinBank" ditulis sebagai teks biasa di U1 dan Kepala Halaman | Logo, bila ada, menggantikan teks tanpa mengubah tata letak | Tim |
| D11 | Hanya tema terang di MVP. Tema gelap baru dibuat bila bisa memenuhi kontras yang sama | Tidak ada | Keputusan, bukan pertanyaan |
| D12 | Tidak ada notifikasi di luar aplikasi (PRD F2.7 menyatakan sistem tidak mengirim email). Nasabah mengetahui status pengajuan dengan membuka N1 atau N5 | Bila nanti ada notifikasi, N1 dan N5 tetap sumber kebenaran | Keputusan, bukan pertanyaan |
| D13 | Tidak ada tombol cetak atau tanda terima untuk nasabah di MVP. P5 hanya bukti di layar | Bila RW ingin tanda terima kertas pada awal uji coba, perlu layar cetak P5 | Pengelola RW |
| D14 | Font Outfit dan palet olive mengikuti desain awal tim (bagian 3). Zaitun asli #849347 digelapkan menjadi #4F5C23 agar mencapai 7:1; Outfit tidak membedakan I dan l sejelas Atkinson, jadi password yang dibuat sistem tidak memuat I, l, 1, O, 0 | Bila tim ingin kembali ke Atkinson atau zaitun asli, token bagian 3 diganti dan semua rasio kontras dihitung ulang | Tim |

### Pertanyaan terbuka PRD yang memengaruhi desain

| ID PRD | Pertanyaan | Layar yang terdampak | Rancangan sementara |
| --- | --- | --- | --- |
| OQ-17 | Daftar awal jenis sampah dan harga | A2, U4, P3 | Delapan pictogram bersifat umum; set akhir ditentukan setelah daftar resmi ada |
| OQ-19 | Rincian uji coba satu RW (durasi, peserta, penilai) | Bagian 10, rencana pengujian | Pengujian pengguna nyata dijadwalkan di dalam uji coba itu |
| OQ-22 | Nasabah tanpa email | P9, A5 | Email tetap wajib di P9; bila diputuskan lain, isian email dan teks galat berubah |
| OQ-23 | Admin menonaktifkan admin lain atau dirinya sendiri | A4 | Aksi Nonaktifkan tampil untuk semua akun; aturan diterapkan setelah diputuskan |
| OQ-24 | Perlakuan akun nasabah nonaktif yang masih punya saldo atau pengajuan | A4, P4, P10 | A4 menampilkan peringatan saldo tetapi tidak memblokir; pesan di P4 sementara |

### Urutan kerja yang disarankan sebelum dan saat coding

1. Konfirmasi D1 sampai D3 dan D5 dengan tim (empat keputusan yang mengubah data atau API).
2. Tulis token bagian 3 sebagai satu berkas CSS custom property; semua komponen hanya membaca token.
3. Bangun komponen bagian 7 secara terisolasi dengan semua state, termasuk Cap Status dan Tabel Buku, sebelum merakit screen.
4. Rakit dan uji journey J2 (catat setoran) lebih dulu dengan petugas sungguhan: ini jalur paling sering dan paling mahal bila salah.
5. Jalankan pemeriksaan tabel 19 larangan (bagian 2) dan rencana aksesibilitas (bagian 10) pada setiap screen sebelum dianggap selesai.
