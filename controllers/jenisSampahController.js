const JenisSampah = require("../models/JenisSampah");

const PESAN_KATEGORI = `Kategori harus salah satu dari: ${JenisSampah.KATEGORI.join(", ")}`;

// Bentuk respons
function bentukData(dokumen) {
  const data = dokumen.toObject();
  delete data.gambar;
  return {
    ...data,
    kategori: data.kategori ?? null,
    adaGambar: data.adaGambar ?? false,
    gambarDiubah: data.gambarDiubah ?? null
  };
}

function kategoriTidakValid(kategori) {
  return kategori !== undefined && kategori !== null && !JenisSampah.KATEGORI.includes(kategori);
}

function kirimGalatSimpan(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({ sukses: false, pesan: "Nama jenis sampah sudah dipakai" });
  }
  if (error.name === "ValidationError") {
    const pertama = Object.values(error.errors)[0];
    const pesan = pertama.name === "CastError" ? "Data jenis sampah tidak valid" : pertama.message;
    return res.status(400).json({ sukses: false, pesan });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ sukses: false, pesan: "Data jenis sampah tidak valid" });
  }
  return res.status(500).json({ sukses: false, pesan: error.message });
}

async function tambahJenisSampah(req, res) {
  try {
    const { nama, hargaPerKg, kategori } = req.body;
    if (kategoriTidakValid(kategori)) {
      return res.status(400).json({ sukses: false, pesan: PESAN_KATEGORI });
    }
    const jenisBaru = await JenisSampah.create({ nama, hargaPerKg, kategori: kategori ?? undefined });
    
    return res.status(201).json({
      sukses: true,
      pesan: "Jenis sampah berhasil ditambahkan",
      data: bentukData(jenisBaru)
    });
  } catch (error) {
    return kirimGalatSimpan(res, error);
  }
}

async function dapatkanJenisSampah(req, res) {
  try {
    // Menampilkan semua jenis sampah, baik yang aktif maupun tidak (opsional: bisa difilter di query)
    const daftarSampah = await JenisSampah.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      sukses: true,
      pesan: "Daftar jenis sampah berhasil diambil",
      data: daftarSampah.map(bentukData)
    });
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

async function ubahJenisSampah(req, res) {
  try {
    const { id } = req.params;
    const { nama, hargaPerKg, kategori } = req.body;

    if (kategoriTidakValid(kategori)) {
      return res.status(400).json({ sukses: false, pesan: PESAN_KATEGORI });
    }

    const perubahan = { $set: { nama, hargaPerKg } };
    if (kategori === null) {
      perubahan.$unset = { kategori: 1 };
    } else if (kategori !== undefined) {
      perubahan.$set.kategori = kategori;
    }

    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      id,
      perubahan,
      { new: true, runValidators: true }
    );

    if (!sampahDiperbarui) {
      return res.status(404).json({ sukses: false, pesan: "Jenis sampah tidak ditemukan" });
    }

    return res.status(200).json({
      sukses: true,
      pesan: "Data jenis sampah berhasil diperbarui",
      data: bentukData(sampahDiperbarui)
    });
  } catch (error) {
    return kirimGalatSimpan(res, error);
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
      data: bentukData(sampahDiperbarui)
    });
  } catch (error) {
    return kirimGalatSimpan(res, error);
  }
}

// Gambar
async function unggahGambar(req, res) {
  try {
    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      req.params.id,
      {
        gambar: { data: req.file.buffer, tipe: req.file.tipeTerdeteksi },
        adaGambar: true,
        gambarDiubah: new Date()
      },
      { new: true }
    );

    if (!sampahDiperbarui) {
      return res.status(404).json({ sukses: false, pesan: "Jenis sampah tidak ditemukan" });
    }

    return res.status(200).json({
      sukses: true,
      pesan: "Gambar jenis sampah berhasil diunggah",
      data: bentukData(sampahDiperbarui)
    });
  } catch (error) {
    return kirimGalatSimpan(res, error);
  }
}

async function hapusGambar(req, res) {
  try {
    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      req.params.id,
      { $unset: { gambar: 1 }, $set: { adaGambar: false, gambarDiubah: new Date() } },
      { new: true }
    );

    if (!sampahDiperbarui) {
      return res.status(404).json({ sukses: false, pesan: "Jenis sampah tidak ditemukan" });
    }

    return res.status(200).json({
      sukses: true,
      pesan: "Gambar jenis sampah berhasil dihapus",
      data: bentukData(sampahDiperbarui)
    });
  } catch (error) {
    return kirimGalatSimpan(res, error);
  }
}

async function ambilGambar(req, res) {
  try {
    const jenis = await JenisSampah.findById(req.params.id).select("+gambar adaGambar gambarDiubah");

    if (!jenis || !jenis.adaGambar || !jenis.gambar || !jenis.gambar.data) {
      return res.status(404).json({ sukses: false, pesan: "Gambar jenis sampah tidak ditemukan" });
    }

    const versi = jenis.gambarDiubah ? jenis.gambarDiubah.getTime() : 0;
    const etag = `"${jenis._id}-${versi}"`;
    res.set({
      "Cache-Control": "public, max-age=86400",
      ETag: etag
    });

    const etagKlien = (req.headers["if-none-match"] || "").split(",").map((nilai) => nilai.trim().replace(/^W\//, ""));
    if (etagKlien.includes(etag) || etagKlien.includes("*")) {
      return res.status(304).end();
    }

    res.set("Content-Type", jenis.gambar.tipe);
    return res.send(jenis.gambar.data);
  } catch (error) {
    return res.status(500).json({ sukses: false, pesan: error.message });
  }
}

module.exports = {
  tambahJenisSampah,
  dapatkanJenisSampah,
  ubahJenisSampah,
  ubahStatus,
  unggahGambar,
  hapusGambar,
  ambilGambar
};