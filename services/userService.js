const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const AppError = require("../utils/AppError")

const ROLE_VALID = ["admin", "petugas", "nasabah"]

// Pembantu
function ringkas(user) {
  return { id: user._id, nama: user.nama, email: user.email, role: user.role, aktif: user.aktif !== false }
}

function pastikanPasswordValid(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new AppError("Password minimal 8 karakter", 400)
  }
}

// Reset password
async function resetPassword(id, passwordBaru) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Id pengguna tidak valid", 400)
  }
  pastikanPasswordValid(passwordBaru)

  const hash = await bcrypt.hash(passwordBaru, 10)
  const user = await User.findByIdAndUpdate(id, { password: hash }, { returnDocument: "after" })
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404)

  return ringkas(user)
}

// Buat akun
async function buatUser(pembuat, { nama, email, password, role }) {
  if (!nama || !email) throw new AppError("Nama dan email wajib diisi", 400)
  if (!ROLE_VALID.includes(role)) {
    throw new AppError("Role harus admin, petugas, atau nasabah", 400)
  }
  if (pembuat.role === "petugas" && role !== "nasabah") {
    throw new AppError("Petugas hanya boleh membuat akun nasabah", 403)
  }
  pastikanPasswordValid(password)

  const hash = await bcrypt.hash(password, 10)
  try {
    const user = await User.create({ nama, email, password: hash, role })
    return ringkas(user)
  } catch (err) {
    if (err.code === 11000) throw new AppError("Email sudah terdaftar", 409)
    throw err
  }
}

// Daftar akun
async function daftarUser(pembuat, { role } = {}) {
  const filter = {}
  if (pembuat.role === "petugas") {
    filter.role = "nasabah"
  } else if (role) {
    if (!ROLE_VALID.includes(role)) {
      throw new AppError("Role harus admin, petugas, atau nasabah", 400)
    }
    filter.role = role
  }
  const data = await User.find(filter).select("-password").sort({ createdAt: -1 })
  return data
}

// Ubah status akun
async function ubahStatus(pembuat, id, aktif) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Id pengguna tidak valid", 400)
  }
  if (typeof aktif !== "boolean") {
    throw new AppError("Field aktif harus true atau false", 400)
  }
  if (!aktif && String(id) === String(pembuat.id)) {
    throw new AppError("Admin tidak bisa menonaktifkan akunnya sendiri", 400)
  }

  const user = await User.findByIdAndUpdate(id, { aktif }, { returnDocument: "after" })
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404)

  return ringkas(user)
}

module.exports = { resetPassword, buatUser, daftarUser, ubahStatus }