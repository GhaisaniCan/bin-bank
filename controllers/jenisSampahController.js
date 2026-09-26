const JenisSampah = require("../models/JenisSampah");

async function tambahJenisSampah(req, res) {
  try {
    const { nama, hargaPerKg } = req.body;
    const jenisBaru = await JenisSampah.create({ nama, hargaPerKg });
    
    return res.status(201).json({
      sukses: true,
      pesan: "Jenis sampah berhasil ditambahkan",
      data: jenisBaru
    });
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

async function dapatkanJenisSampah(req, res) {
  try {
    // Menampilkan semua jenis sampah, baik yang aktif maupun tidak (opsional: bisa difilter di query)
    const daftarSampah = await JenisSampah.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      sukses: true,
      pesan: "Daftar jenis sampah berhasil diambil",
      data: daftarSampah
    });
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

async function ubahJenisSampah(req, res) {
  try {
    const { id } = req.params;
    const { nama, hargaPerKg } = req.body;

    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      id,
      { nama, hargaPerKg },
      { new: true, runValidators: true }
    );

    if (!sampahDiperbarui) {
      return res.status(404).json({ sukses: false, pesan: "Jenis sampah tidak ditemukan" });
    }

    return res.status(200).json({
      sukses: true,
      pesan: "Data jenis sampah berhasil diperbarui",
      data: sampahDiperbarui
    });
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

async function ubahStatus(req, res) {
  try {
    const { id } = req.params;
    const { aktif } = req.body; 

    if (typeof aktif !== "boolean") {
      return res.status(400).json({ sukses: false, pesan: "Status aktif harus boolean (true/false)" });
    }

    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      id,
      { aktif },
      { new: true }
    );

    if (!sampahDiperbarui) {
      return res.status(404).json({ sukses: false, pesan: "Jenis sampah tidak ditemukan" });
    }

    const pesanStatus = aktif ? "diaktifkan" : "dinonaktifkan";
    return res.status(200).json({
      sukses: true,
      pesan: `Jenis sampah berhasil ${pesanStatus}`,
      data: sampahDiperbarui
    });
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

module.exports = {
  tambahJenisSampah,
  dapatkanJenisSampah,
  ubahJenisSampah,
  ubahStatus
};