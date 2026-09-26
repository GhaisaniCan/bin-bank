const mongoose = require('mongoose');

const jenisSampahSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    unique: true // Mencegah pencatatan jenis sampah yang sama dua kali
  },
  harga_per_kg: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('JenisSampah', jenisSampahSchema);