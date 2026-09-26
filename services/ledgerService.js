const mongoose = require("mongoose");
const BukuBesar = require("../models/BukuBesar");
const AppError = require("../utils/AppError");
const { bulatkanRupiah } = require("../utils/angka");

// Satu-satunya pintu masuk perubahan saldo nasabah.
//
// Aturan yang dijaga di sini:
// 1. Saldo di dokumen User dan catatan di BukuBesar selalu berubah bersamaan,
//    di dalam satu transaksi database, sehingga tidak mungkin saldo bertambah
//    tanpa catatan, atau sebaliknya.
// 2. Saldo tidak pernah dihitung ulang dari nol. Perubahan memakai $inc supaya
//    dua transaksi yang berjalan bersamaan tidak saling menimpa.
// 3. Saldo tidak boleh minus. Pengurangan hanya berhasil bila saldo mencukupi.
//
// Modul lain memanggil credit()/debit(), bukan mengubah User.saldo sendiri.

// Model User dan JenisSampah dipegang anggota lain. Diambil lewat registry
// Mongoose supaya modul ini tidak terikat pada nama file mereka.
function ambilModel(namaModel) {
  try {
    return mongoose.model(namaModel);
  } catch (error) {
    throw new AppError(
      `Model ${namaModel} belum terdaftar. Pastikan file model ${namaModel} sudah di-require sebelum server berjalan.`,
      500
    );
  }
}

function pastikanSession(session) {
  if (!session) {
    throw new AppError(
      "ledgerService wajib dijalankan di dalam transaksi database (session tidak boleh kosong)",
      500
    );
  }
}

function pastikanJumlahValid(jumlah) {
  if (typeof jumlah !== "number" || !Number.isFinite(jumlah) || jumlah <= 0) {
    throw new AppError("Jumlah mutasi harus berupa angka lebih dari 0", 400);
  }
  return bulatkanRupiah(jumlah);
}

async function catatMutasi(
  { nasabahId, jumlah, tipe, sumber, referensiId, keterangan },
  session
) {
  pastikanSession(session);
  const nominal = pastikanJumlahValid(jumlah);
  const User = ambilModel("User");

  // Filter dipasang di query, bukan dicek di aplikasi, supaya pengecekan saldo
  // dan pengurangannya terjadi dalam satu operasi atomik.
  const filter = { _id: nasabahId, role: "nasabah" };
  if (tipe === "DEBIT") {
    filter.saldo = { $gte: nominal };
  }

  const perubahan = tipe === "KREDIT" ? nominal : -nominal;
  const nasabah = await User.findOneAndUpdate(
    filter,
    { $inc: { saldo: perubahan } },
    { returnDocument: "after", session }
  );

  if (!nasabah) {
    const adaNasabah = await User.exists({ _id: nasabahId, role: "nasabah" }).session(session);
    if (!adaNasabah) {
      throw new AppError("Nasabah tidak ditemukan", 404);
    }
    throw new AppError("Saldo nasabah tidak mencukupi untuk penarikan ini", 400);
  }

  const [catatan] = await BukuBesar.create(
    [
      {
        nasabah: nasabah._id,
        tipe,
        jumlah: nominal,
        saldoSetelah: nasabah.saldo,
        sumber,
        referensiId,
        keterangan,
      },
    ],
    { session }
  );

  return { catatan, saldoTerkini: nasabah.saldo };
}

// ---------------------------------------------------------------------------
// Lapisan kompatibilitas untuk Modul D (services/penarikanService.js).
//
// Kontrak di docs/KESEPAKATAN-SKEMA.md: credit/debit dipanggil dengan satu objek
// argumen + session, misalnya credit({ nasabahId, jumlah, sumber, referensiId,
// keterangan }, session). Modul D yang sudah lebih dulu masuk ke main memanggil
// dengan gaya posisional: debit(nasabahId, jumlah, keterangan, { tipe, id }).
//
// Supaya penggabungan ini tidak memaksa Anggota 4 menulis ulang modulnya,
// kedua gaya panggilan diterima. Gaya posisional membuka transaksinya sendiri.
// Setelah Modul D pindah ke gaya kontrak, seluruh blok kompatibilitas di bawah
// (termasuk getSaldo dan getRiwayat) boleh dihapus.
// ---------------------------------------------------------------------------

function gayaKontrak(argumenPertama) {
  return (
    argumenPertama !== null &&
    typeof argumenPertama === "object" &&
    argumenPertama.nasabahId !== undefined
  );
}

// Modul D memakai referensi berbentuk { tipe: "penarikan", id }, sedangkan
// BukuBesar menyimpannya sebagai sumber ("PENARIKAN") + referensiId.
function terjemahkanReferensi(referensi, sumberBawaan) {
  const tipe = referensi && referensi.tipe ? String(referensi.tipe).toUpperCase() : sumberBawaan;
  return { sumber: tipe, referensiId: referensi ? referensi.id : undefined };
}

// Pemanggil gaya lama tidak membawa session, jadi transaksinya dibuka di sini.
// Mutasi saldo tetap tidak pernah terjadi di luar transaksi.
async function jalankanDalamTransaksi(argumen) {
  const session = await mongoose.startSession();
  try {
    let hasil;
    await session.withTransaction(async () => {
      hasil = await catatMutasi(argumen, session);
    });
    return hasil.catatan;
  } finally {
    await session.endSession();
  }
}

// Menambah saldo nasabah. Dipakai saat setoran tercatat.
async function credit(...argumen) {
  const [pertama, kedua, ketiga, keempat] = argumen;

  if (gayaKontrak(pertama)) {
    const { nasabahId, jumlah, sumber = "SETORAN", referensiId, keterangan } = pertama;
    return catatMutasi(
      { nasabahId, jumlah, tipe: "KREDIT", sumber, referensiId, keterangan },
      kedua
    );
  }

  const { sumber, referensiId } = terjemahkanReferensi(keempat, "SETORAN");
  return jalankanDalamTransaksi({
    nasabahId: pertama,
    jumlah: kedua,
    tipe: "KREDIT",
    sumber,
    referensiId,
    keterangan: ketiga,
  });
}

// Mengurangi saldo nasabah. Dipakai saat pengajuan penarikan disetujui admin.
async function debit(...argumen) {
  const [pertama, kedua, ketiga, keempat] = argumen;

  if (gayaKontrak(pertama)) {
    const { nasabahId, jumlah, sumber = "PENARIKAN", referensiId, keterangan } = pertama;
    return catatMutasi(
      { nasabahId, jumlah, tipe: "DEBIT", sumber, referensiId, keterangan },
      kedua
    );
  }

  const { sumber, referensiId } = terjemahkanReferensi(keempat, "PENARIKAN");
  return jalankanDalamTransaksi({
    nasabahId: pertama,
    jumlah: kedua,
    tipe: "DEBIT",
    sumber,
    referensiId,
    keterangan: ketiga,
  });
}

// Saldo terkini nasabah, dibaca dari dokumen User.
async function ambilSaldo(nasabahId, session) {
  const User = ambilModel("User");
  const kueri = User.findOne({ _id: nasabahId, role: "nasabah" }).select("saldo");
  if (session) {
    kueri.session(session);
  }

  const nasabah = await kueri;
  if (!nasabah) {
    throw new AppError("Nasabah tidak ditemukan", 404);
  }

  return nasabah.saldo ?? 0;
}

// Nama lama yang dipakai Modul D. getSaldo membaca User.saldo (bukan lagi
// menjumlah ulang buku besar), getRiwayat mengembalikan mutasi terbaru dulu.
async function getSaldo(nasabahId) {
  return ambilSaldo(nasabahId);
}

async function getRiwayat(nasabahId) {
  return BukuBesar.find({ nasabah: nasabahId }).sort({ createdAt: -1 });
}

module.exports = { credit, debit, ambilSaldo, getSaldo, getRiwayat };
