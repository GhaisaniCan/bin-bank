const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")

router.post("/register", async (req, res) => {
  try {
    const { nama, email, password, role } = req.body
    const user = await authService.register(nama, email, password, role)
    res.status(201).json({ message: "Registrasi berhasil", data: user })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.status(200).json({ message: "Login berhasil", data: result })
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
})

router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Ini profil kamu", user: req.user })
})

router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Selamat datang, admin!" })
})

module.exports = router