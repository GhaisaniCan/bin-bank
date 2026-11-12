const express = require("express")
const nasabahService = require("../services/nasabahService")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")

const router = express.Router()

function kirimError(res, err) {
  res.status(err.statusCode || 500).json({ message: err.message })
}

// Saldo nasabah
router.get("/:id/saldo", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const data = await nasabahService.saldoNasabah(req.params.id)
    res.status(200).json({ message: "Saldo berhasil diambil", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Riwayat nasabah
router.get("/:id/riwayat", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const data = await nasabahService.riwayatNasabah(req.params.id)
    res.status(200).json({ message: "Riwayat berhasil diambil", data })
  } catch (err) {
    kirimError(res, err)
  }
})

module.exports = router