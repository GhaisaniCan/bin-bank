const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const AppError = require("../utils/AppError")

const ROLE_VALID = ["admin", "petugas", "nasabah"]
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LIMIT_BAWAAN = 20
const LIMIT_MAKSIMAL = 100

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
  const user = await User.findByIdAndUpdate(
    id,
    { password: hash, wajibGantiPassword: true },
    { returnDocument: "after" }
  )
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
  if (typeof email !== "string" || !FORMAT_EMAIL.test(email.trim())) {
    throw new AppError("Format email tidak valid", 400)
  }
  pastikanPasswordValid(password)

  const hash = await bcrypt.hash(password, 10)
  try {
    const user = await User.create({ nama, email, password: hash, role, wajibGantiPassword: true })
    return ringkas(user)
  } catch (err) {
    if (err.code === 11000) throw new AppError("Email sudah terdaftar", 409)
    throw err
  }
}

function escapeRegex(teks) {
  return teks.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function ambilPaginasi(halaman, limit) {
  const halamanAktif = Math.max(1, Number.parseInt(halaman, 10) || 1)
  const limitAktif = Math.min(LIMIT_MAKSIMAL, Math.max(1, Number.parseInt(limit, 10) || LIMIT_BAWAAN))
  return { halamanAktif, limitAktif }
}

// Daftar akun
async function daftarUser(pembuat, { role, cari, status, halaman, limit } = {}) {
  const filter = {}
  if (pembuat.role === "petugas") {
    filter.role = "nasabah"
  } else if (role) {
    if (!ROLE_VALID.includes(role)) {
      throw new AppError("Role harus admin, petugas, atau nasabah", 400)
    }
    filter.role = role
  }
  if (typeof cari === "string" && cari.trim()) {
    const pola = new RegExp(escapeRegex(cari.trim()), "i")
    filter.$or = [{ nama: pola }, { email: pola }]
  }
  if (status === "aktif") {
    filter.aktif = { $ne: false }
  } else if (status === "nonaktif") {
    filter.aktif = false
  } else if (status !== undefined && status !== "") {
    throw new AppError("Status harus aktif atau nonaktif", 400)
  }

  const kueri = User.find(filter).select("-password").sort({ createdAt: -1 })
  if (halaman === undefined && limit === undefined) {
    return { data: await kueri }
  }

  const { halamanAktif, limitAktif } = ambilPaginasi(halaman, limit)
  const [data, total] = await Promise.all([
    kueri.skip((halamanAktif - 1) * limitAktif).limit(limitAktif),
    User.countDocuments(filter),
  ])
  return {
    data,
    paginasi: {
      halaman: halamanAktif,
      limit: limitAktif,
      total,
      totalHalaman: Math.ceil(total / limitAktif) || 0,
    },
  }
}

// Detail akun
async function detailUser(pembuat, id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Id pengguna tidak valid", 400)
  }

  const user = await User.findById(id).select("nama email role aktif")
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404)
  if (pembuat.role === "petugas" && user.role !== "nasabah") {
    throw new AppError("Petugas hanya boleh melihat akun nasabah", 403)
  }

  return { _id: user._id, nama: user.nama, email: user.email, status: user.aktif === false ? "nonaktif" : "aktif" }
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

module.exports = { resetPassword, buatUser, daftarUser, detailUser, ubahStatus }