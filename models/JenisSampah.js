const mongoose = require('mongoose');

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
  }
}, { timestamps: true });

module.exports = mongoose.model('JenisSampah', jenisSampahSchema);