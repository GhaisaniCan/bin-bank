const mongoose = require('mongoose');

const jenisSampahSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    unique: true
  },
  hargaPerKg: {
    type: Number,
    required: true,
    min: [0, "harga per kg tidak boleh negatif"]
  },
  aktif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('JenisSampah', jenisSampahSchema);