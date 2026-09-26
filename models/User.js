const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["petugas", "nasabah", "admin"], required: true },
  saldo: { type: Number, default: 0, min: [0, "saldo tidak boleh negatif"] },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)
