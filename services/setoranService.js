const mongoose = require("mongoose");
const Setoran = require("../models/Setoran");
const ledgerService = require("./ledgerService");
const AppError = require("../utils/AppError");
const { bulatkan, bulatkanRupiah } = require("../utils/angka");

const LIMIT_BAWAAN = 10;
const LIMIT_MAKSIMAL = 100;

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

function pastikanObjectId(nilai, namaField) {
  if (!mongoose.isValidObjectId(nilai)) {
    throw new AppError(`${namaField} tidak valid`, 400);
  }
  return nilai;
}

// Model JenisSampah memakai harga_per_kg, kontrak skema memakai hargaPerKg.
function ambilHargaPerKg(jenis) {
  const nilai = jenis.hargaPerKg !== undefined ? jenis.hargaPerKg : jenis.harga_per_kg;
  return Number(nilai);
}

function validasiRincianMasukan(rincian) {
  if (!Array.isArray(rincian) || rincian.length === 0) {
    throw new AppError("Rincian setoran minimal berisi satu jenis sampah", 400);
  }

  return rincian.map((baris, indeks) => {
    const posisi = `rincian ke-${indeks + 1}`;

    if (!baris || typeof baris !== "object") {
      throw new AppError(`Format ${posisi} tidak valid`, 400);
    }

    pastikanObjectId(baris.jenisSampah, `Jenis sampah pada ${posisi}`);

    const berat = Number(baris.berat);
    if (!Number.isFinite(berat) || berat <= 0) {
      throw new AppError(`Berat pada ${posisi} harus berupa angka lebih dari 0`, 400);
    }

    return { jenisSampah: String(baris.jenisSampah), berat };
  });
}

async function susunRincianBerharga(rincianMasukan) {
  const JenisSampah = ambilModel("JenisSampah");

  const daftarId = [...new Set(rincianMasukan.map((baris) => baris.jenisSampah))];
  const daftarJenis = await JenisSampah.find({ _id: { $in: daftarId } });
  const petaJenis = new Map(daftarJenis.map((jenis) => [String(jenis._id), jenis]));

  return rincianMasukan.map((baris, indeks) => {
    const jenis = petaJenis.get(baris.jenisSampah);
    if (!jenis) {
      throw new AppError(
        `Jenis sampah pada rincian ke-${indeks + 1} tidak ditemukan`,
        404
      );
    }

    if (jenis.aktif === false) {
      throw new AppError(`Jenis sampah "${jenis.nama}" sudah tidak aktif`, 400);
    }

    const hargaPerKg = ambilHargaPerKg(jenis);
    if (!Number.isFinite(hargaPerKg)) {
      throw new AppError(
        "Model JenisSampah tidak memiliki harga bertipe angka " +
          "(dicari pada field `hargaPerKg` maupun `harga_per_kg`).",
        500
      );
    }

    return {
      jenisSampah: jenis._id,
      namaSampah: jenis.nama,
      hargaPerKg,
      berat: bulatkan(baris.berat, 2),
      subtotal: bulatkanRupiah(baris.berat * hargaPerKg),
    };
  });
}

async function pastikanNasabahTerdaftar(nasabahId) {
  const User = ambilModel("User");
  const nasabah = await User.findOne({ _id: nasabahId, role: "nasabah" }).select("_id nama");
  if (!nasabah) {
    throw new AppError("Nasabah tidak ditemukan atau bukan pengguna berperan nasabah", 404);
  }
  return nasabah;
}

async function catatSetoran({ nasabah, petugas, tanggal, rincian, catatan }) {
  pastikanObjectId(nasabah, "ID nasabah");
  pastikanObjectId(petugas, "ID petugas");

  let tanggalSetoran = new Date();
  if (tanggal !== undefined && tanggal !== null && tanggal !== "") {
    tanggalSetoran = new Date(tanggal);
    if (Number.isNaN(tanggalSetoran.getTime())) {
      throw new AppError("Format tanggal tidak valid", 400);
    }
  }

  const rincianMasukan = validasiRincianMasukan(rincian);
  await pastikanNasabahTerdaftar(nasabah);

  const rincianBerharga = await susunRincianBerharga(rincianMasukan);
  const totalBerat = bulatkan(
    rincianBerharga.reduce((jumlah, baris) => jumlah + baris.berat, 0),
    2
  );
  const totalNilai = rincianBerharga.reduce((jumlah, baris) => jumlah + baris.subtotal, 0);

  const session = await mongoose.startSession();
  try {
    let hasil;

    await session.withTransaction(async () => {
      const [setoran] = await Setoran.create(
        [
          {
            nasabah,
            petugas,
            tanggal: tanggalSetoran,
            rincian: rincianBerharga,
            totalBerat,
            totalNilai,
            catatan,
          },
        ],
        { session }
      );

      const mutasi = await ledgerService.credit(
        {
          nasabahId: nasabah,
          jumlah: totalNilai,
          sumber: "SETORAN",
          referensiId: setoran._id,
          keterangan: `Setoran ${totalBerat} kg`,
        },
        session
      );

      hasil = {
        setoran,
        catatanBukuBesar: mutasi.catatan,
        saldoTerkini: mutasi.saldoTerkini,
      };
    });

    const setoranLengkap = await Setoran.findById(hasil.setoran._id)
      .populate("nasabah", "nama")
      .populate("petugas", "nama");

    return { ...hasil, setoran: setoranLengkap };
  } finally {
    await session.endSession();
  }
}

async function daftarSetoran({ nasabah, dari, sampai, status, halaman, limit } = {}) {
  const filter = {};

  if (nasabah) {
    filter.nasabah = pastikanObjectId(nasabah, "ID nasabah");
  }

  if (status) {
    const statusBesar = String(status).toUpperCase();
    if (!["TERCATAT", "DIBATALKAN"].includes(statusBesar)) {
      throw new AppError("Status hanya boleh TERCATAT atau DIBATALKAN", 400);
    }
    filter.status = statusBesar;
  }

  if (dari || sampai) {
    filter.tanggal = {};
    if (dari) {
      const tanggalDari = new Date(dari);
      if (Number.isNaN(tanggalDari.getTime())) {
        throw new AppError("Format tanggal 'dari' tidak valid", 400);
      }
      filter.tanggal.$gte = tanggalDari;
    }
    if (sampai) {
      const tanggalSampai = new Date(sampai);
      if (Number.isNaN(tanggalSampai.getTime())) {
        throw new AppError("Format tanggal 'sampai' tidak valid", 400);
      }
      tanggalSampai.setHours(23, 59, 59, 999);
      filter.tanggal.$lte = tanggalSampai;
    }
  }

  const halamanAktif = Math.max(1, Number.parseInt(halaman, 10) || 1);
  const limitAktif = Math.min(
    LIMIT_MAKSIMAL,
    Math.max(1, Number.parseInt(limit, 10) || LIMIT_BAWAAN)
  );

  const [data, total] = await Promise.all([
    Setoran.find(filter)
      .sort({ tanggal: -1, createdAt: -1 })
      .skip((halamanAktif - 1) * limitAktif)
      .limit(limitAktif)
      .populate("nasabah", "nama")
      .populate("petugas", "nama"),
    Setoran.countDocuments(filter),
  ]);

  return {
    data,
    paginasi: {
      halaman: halamanAktif,
      limit: limitAktif,
      total,
      totalHalaman: Math.ceil(total / limitAktif) || 0,
    },
  };
}

async function detailSetoran(setoranId, pengguna) {
  pastikanObjectId(setoranId, "ID setoran");

  const setoran = await Setoran.findById(setoranId)
    .populate("nasabah", "nama")
    .populate("petugas", "nama");

  if (!setoran) {
    throw new AppError("Setoran tidak ditemukan", 404);
  }

  if (pengguna?.role === "nasabah" && String(setoran.nasabah?._id) !== String(pengguna.id)) {
    throw new AppError("Anda tidak berhak mengakses setoran ini", 403);
  }

  return setoran;
}

module.exports = { catatSetoran, daftarSetoran, detailSetoran };
