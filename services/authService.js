const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

async function register(nama, email, password, role) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ nama, email, password: hashedPassword, role })
  return user
}

async function login(email, password) {
  const user = await User.findOne({ email })
  if (!user) throw new Error("Email tidak ditemukan")

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error("Password salah")

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )
  return { token, user }
}

module.exports = { register, login }