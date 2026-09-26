const mongoose = require("mongoose");
const BukuBesar = require("../models/BukuBesar");
const AppError = require("../utils/AppError");
const { bulatkanRupiah } = require("../utils/angka");

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

function gayaKontrak(argumenPertama) {
  return (
    argumenPertama !== null &&
    typeof argumenPertama === "object" &&
    argumenPertama.nasabahId !== undefined
  );
}

function terjemahkanReferensi(referensi, sumberBawaan) {
  const tipe = referensi && referensi.tipe ? String(referensi.tipe).toUpperCase() : sumberBawaan;
  return { sumber: tipe, referensiId: referensi ? referensi.id : undefined };
}

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

// Dua gaya panggilan diterima: ({ nasabahId, jumlah, ... }, session) sesuai
// kontrak skema, atau (nasabahId, jumlah, keterangan, referensi) seperti yang
// dipakai penarikanService. Gaya kedua membuka transaksinya sendiri.
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

async function getSaldo(nasabahId) {
  return ambilSaldo(nasabahId);
}

async function getRiwayat(nasabahId) {
  return BukuBesar.find({ nasabah: nasabahId }).sort({ createdAt: -1 });
}

module.exports = { credit, debit, ambilSaldo, getSaldo, getRiwayat };
