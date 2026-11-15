const mongoose = require('mongoose');

const KATEGORI_JENIS_SAMPAH = ["plastik", "kertas", "besi", "lainnya"];

const jenisSampahSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, "Nama jenis sampah wajib diisi"],
    unique: true,
    trim: true
  },
  hargaPerKg: {
    type: Number,
    required: [true, "Harga per kg wajib diisi"],
    validate: {
      validator: (nilai) => Number.isInteger(nilai) && nilai > 0,
      message: "Harga per kg harus bilangan bulat lebih dari 0"
    }
  },
  aktif: {
    type: Boolean,
    default: true
  },
  kategori: {
    type: String,
    enum: {
      values: KATEGORI_JENIS_SAMPAH,
      message: `Kategori harus salah satu dari: ${KATEGORI_JENIS_SAMPAH.join(", ")}`
    }
  },
  gambar: {
    type: {
      data: Buffer,
      tipe: String
    },
    select: false
  },
  adaGambar: {
    type: Boolean,
    default: false
  },
  gambarDiubah: {
    type: Date
  }
}, { timestamps: true });

const JenisSampah = mongoose.model('JenisSampah', jenisSampahSchema);
JenisSampah.KATEGORI = KATEGORI_JENIS_SAMPAH;

module.exports = JenisSampah;