const mongoose = require("mongoose")

const penarikanSchema = new mongoose.Schema({
  nasabah: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jumlah: { type: Number, required: true },
  metode: { type: String, enum: ["tunai", "e-wallet"], required: true },
  status: {
    type: String,
    enum: ["diajukan", "disetujui", "ditolak", "selesai"],
    default: "diajukan",
  },
  diprosesOleh: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  catatan: { type: String },
}, { timestamps: true })

module.exports = mongoose.model("Penarikan", penarikanSchema)
