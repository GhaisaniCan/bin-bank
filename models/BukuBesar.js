const mongoose = require("mongoose")

const bukuBesarSchema = new mongoose.Schema({
  nasabah: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tipe: { type: String, enum: ["kredit", "debit"], required: true }, 
  jumlah: { type: Number, required: true },
  saldoSetelah: { type: Number, required: true },
  keterangan: { type: String },
  referensi: {
    tipe: { type: String, enum: ["setoran", "penarikan"] },
    id: { type: mongoose.Schema.Types.ObjectId },
  },
}, { timestamps: true })

module.exports = mongoose.model("BukuBesar", bukuBesarSchema)
