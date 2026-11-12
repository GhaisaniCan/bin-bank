const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const AppError = require("../utils/AppError")

// Pembantu
function buatToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, wajibGantiPassword: user.wajibGantiPassword === true },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  )
}

function tanpaPassword(user) {
  const data = user.toObject()
  delete data.password
  return data
}

// Registrasi admin pertama
async function register(nama, email, password, role) {
  if ((await User.estimatedDocumentCount()) > 0) {
    throw new AppError("Registrasi publik ditutup, minta admin membuat akun", 403)
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ nama, email, password: hashedPassword, role })
  return user
}

// Login
async function login(email, password) {
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw new Error("Email dan password wajib diisi")
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() })
  const cocok = user ? await bcrypt.compare(password, user.password) : false
  if (!cocok) throw new Error("Email atau password salah")

  if (user.aktif === false) throw new Error("Akun dinonaktifkan, hubungi admin")

  return { token: buatToken(user), user: tanpaPassword(user) }
}

// Ganti password sendiri
async function gantiPassword(userId, passwordLama, passwordBaru) {
  if (typeof passwordLama !== "string" || !passwordLama) {
    throw new AppError("Password lama wajib diisi", 400)
  }
  if (typeof passwordBaru !== "string" || passwordBaru.length < 8) {
    throw new AppError("Password baru minimal 8 karakter", 400)
  }
  if (passwordBaru === passwordLama) {
    throw new AppError("Password baru tidak boleh sama dengan password lama", 400)
  }

  const user = await User.findById(userId)
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404)

  const cocok = await bcrypt.compare(passwordLama, user.password)
  if (!cocok) throw new AppError("Password lama salah", 400)

  user.password = await bcrypt.hash(passwordBaru, 10)
  user.wajibGantiPassword = false
  await user.save()

  return { token: buatToken(user), user: tanpaPassword(user) }
}

module.exports = { register, login, gantiPassword }