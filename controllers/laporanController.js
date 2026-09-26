const laporanService = require("../services/laporanService");

async function dapatkanLaporan(req, res) {
  try {
    const data = await laporanService.getRekapLaporan(req.query);
    
    return res.status(200).json({
      sukses: true,
      pesan: "Rekapitulasi laporan berhasil diambil",
      data: data
    });
  } catch (error) {
    console.error("[laporanController]", error);
    return res.status(500).json({ 
      sukses: false, 
      pesan: "Terjadi kesalahan pada server saat mengambil laporan" 
    });
  }
}

module.exports = { dapatkanLaporan };