const multer = require("multer");
const mongoose = require("mongoose");

const BATAS_UKURAN = 500 * 1024;
const TIPE_DIIZINKAN = ["image/png", "image/jpeg", "image/webp"];

// Deteksi tipe
function deteksiTipe(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

// Validasi id
function validasiIdJenisSampah(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ sukses: false, pesan: "Id jenis sampah tidak valid" });
  }
  next();
}

// Multer
const unggah = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: BATAS_UKURAN, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!TIPE_DIIZINKAN.includes(file.mimetype)) {
      const galat = new Error("Tipe berkas harus PNG, JPEG, atau WebP");
      galat.code = "TIPE_TIDAK_DIIZINKAN";
      return cb(galat);
    }
    cb(null, true);
  }
}).single("gambar");

// Penangan galat
function pesanGalatMulter(error) {
  if (error.code === "LIMIT_FILE_SIZE") {
    return { status: 413, pesan: "Ukuran gambar maksimal 500 KB" };
  }
  if (error.code === "TIPE_TIDAK_DIIZINKAN") {
    return { status: 400, pesan: error.message };
  }
  if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT") {
    return { status: 400, pesan: "Kirim tepat satu berkas pada field \"gambar\"" };
  }
  if (error instanceof multer.MulterError) {
    return { status: 400, pesan: "Data unggahan tidak valid" };
  }
  return { status: 400, pesan: "Gagal membaca unggahan, pastikan memakai multipart/form-data" };
}

function unggahGambar(req, res, next) {
  unggah(req, res, (error) => {
    if (error) {
      const { status, pesan } = pesanGalatMulter(error);
      return res.status(status).json({ sukses: false, pesan });
    }
    if (!req.file) {
      return res.status(400).json({ sukses: false, pesan: "Berkas gambar wajib diunggah pada field \"gambar\"" });
    }
    const tipe = deteksiTipe(req.file.buffer);
    if (!tipe) {
      return res.status(400).json({ sukses: false, pesan: "Isi berkas bukan gambar PNG, JPEG, atau WebP yang valid" });
    }
    req.file.tipeTerdeteksi = tipe;
    next();
  });
}

module.exports = { unggahGambar, validasiIdJenisSampah };
