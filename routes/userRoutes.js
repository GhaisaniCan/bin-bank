const express = require("express")
const userService = require("../services/userService")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")

const router = express.Router()

function kirimError(res, err) {
  res.status(err.statusCode || 500).json({ message: err.message })
}

// Daftar akun
router.get("/", authenticate, authorize("admin", "petugas"), async (req, res) => {
  try {
    const data = await userService.daftarUser(req.user, req.query)
    res.status(200).json({ message: "Daftar pengguna berhasil diambil", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Buat akun
router.post("/", authenticate, authorize("admin", "petugas"), async (req, res) => {
  try {
    const data = await userService.buatUser(req.user, req.body)
    res.status(201).json({ message: "Akun berhasil dibuat", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Reset password
router.patch("/:id/password", authenticate, authorize("admin"), async (req, res) => {
  try {
    const data = await userService.resetPassword(req.params.id, req.body.passwordBaru)
    res.status(200).json({ message: "Password berhasil direset", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Ubah status akun
router.patch("/:id/status", authenticate, authorize("admin"), async (req, res) => {
  try {
    const data = await userService.ubahStatus(req.user, req.params.id, req.body.aktif)
    res.status(200).json({ message: data.aktif ? "Akun diaktifkan" : "Akun dinonaktifkan", data })
  } catch (err) {
    kirimError(res, err)
  }
})

module.exports = router