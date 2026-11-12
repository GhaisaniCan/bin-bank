const express = require("express")
const router = express.Router()
const penarikanService = require("../services/penarikanService")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")

// Petugas/admin melihat daftar penarikan
router.get("/", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const { status, nasabah, dari, sampai, halaman, limit } = req.query
    const hasil = await penarikanService.daftarPenarikan({ status, nasabah, dari, sampai, halaman, limit })
    res.status(200).json({ message: "Daftar penarikan berhasil diambil", ...hasil })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Nasabah cek saldo sendiri
router.get("/saldo", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const data = await penarikanService.getSaldoNasabah(req.user.id)
    res.status(200).json({ message: "Saldo berhasil diambil", data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Nasabah lihat riwayat transaksi (mutasi buku besar) miliknya sendiri
router.get("/riwayat", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const data = await penarikanService.getRiwayatNasabah(req.user.id)
    res.status(200).json({ message: "Riwayat berhasil diambil", data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Nasabah mengajukan penarikan saldo
router.post("/ajukan", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const { jumlah, metode, namaEwallet, nomorEwallet } = req.body
    const data = await penarikanService.ajukanPenarikan(req.user.id, jumlah, metode, namaEwallet, nomorEwallet)
    res.status(201).json({ message: "Pengajuan penarikan berhasil dibuat", data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Petugas/admin menyetujui atau menolak pengajuan penarikan
router.patch("/:id/proses", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const { keputusan, catatan } = req.body
    const data = await penarikanService.prosesPenarikan(req.params.id, keputusan, req.user.id, catatan)
    res.status(200).json({ message: "Penarikan berhasil diproses", data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Petugas/admin menandai penarikan disetujui sebagai selesai (dana sudah diserahkan)
router.patch("/:id/selesai", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const data = await penarikanService.selesaikanPenarikan(req.params.id, req.user.id)
    res.status(200).json({ message: "Penarikan ditandai selesai", data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router