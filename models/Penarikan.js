const mongoose = require("mongoose")

const penarikanSchema = new mongoose.Schema({
  nasabah: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jumlah: {
  type: Number,
  required: true,
  validate: {
    validator: (nilai) => nilai > 0,
    message: "jumlah penarikan harus lebih dari 0",
  },
},
  metode: { type: String, enum: ["tunai", "e-wallet"], required: true },
  namaEwallet: { type: String, trim: true },
  nomorEwallet: { type: String, trim: true },
  status: {
    type: String,
    enum: ["diajukan", "disetujui", "ditolak", "selesai"],
    default: "diajukan",
  },
  diprosesOleh: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  diprosesPada: { type: Date },
  dikonfirmasiOleh: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dikonfirmasiPada: { type: Date },
  catatanKonfirmasi: { type: String, trim: true },
  catatan: { type: String },
}, { timestamps: true })

module.exports = mongoose.model("Penarikan", penarikanSchema)