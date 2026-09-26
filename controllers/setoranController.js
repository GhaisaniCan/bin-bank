const setoranService = require("../services/setoranService");
const AppError = require("../utils/AppError");

function ambilPengguna(req) {
  const pengguna = req.user || {};
  return {
    id: pengguna.id || pengguna._id || pengguna.userId,
    role: pengguna.role,
  };
}

function kirimError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ sukses: false, pesan: error.message });
  }

  if (error.name === "ValidationError") {
    const daftarPesan = Object.values(error.errors).map((detail) => detail.message);
    return res.status(400).json({
      sukses: false,
      pesan: "Data setoran tidak valid",
      error: daftarPesan,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ sukses: false, pesan: `Nilai ${error.path} tidak valid` });
  }

  console.error("[setoranController]", error);
  return res.status(500).json({ sukses: false, pesan: "Terjadi kesalahan pada server" });
}

async function catatSetoran(req, res) {
  try {
    const petugas = ambilPengguna(req);
    if (!petugas.id) {
      throw new AppError("Data petugas tidak ditemukan pada token", 401);
    }

    const { nasabah, tanggal, rincian, catatan } = req.body;
    if (!nasabah) {
      throw new AppError("Nasabah wajib diisi", 400);
    }

    const hasil = await setoranService.catatSetoran({
      nasabah,
      petugas: petugas.id,
      tanggal,
      rincian,
      catatan,
    });

    return res.status(201).json({
      sukses: true,
      pesan: "Setoran berhasil dicatat dan saldo nasabah diperbarui",
      data: {
        setoran: hasil.setoran,
        saldoTerkini: hasil.saldoTerkini,
        catatanBukuBesar: hasil.catatanBukuBesar,
      },
    });
  } catch (error) {
    return kirimError(res, error);
  }
}

async function daftarSetoran(req, res) {
  try {
    const { nasabah, dari, sampai, status, halaman, limit } = req.query;
    const hasil = await setoranService.daftarSetoran({
      nasabah,
      dari,
      sampai,
      status,
      halaman,
      limit,
    });

    return res.status(200).json({
      sukses: true,
      pesan: "Daftar setoran berhasil diambil",
      data: hasil.data,
      paginasi: hasil.paginasi,
    });
  } catch (error) {
    return kirimError(res, error);
  }
}

async function detailSetoran(req, res) {
  try {
    const setoran = await setoranService.detailSetoran(req.params.id, ambilPengguna(req));

    return res.status(200).json({
      sukses: true,
      pesan: "Detail setoran berhasil diambil",
      data: setoran,
    });
  } catch (error) {
    return kirimError(res, error);
  }
}

module.exports = { catatSetoran, daftarSetoran, detailSetoran };
