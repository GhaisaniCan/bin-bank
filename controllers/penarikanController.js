const express = require("express")
const router = express.Router()
const penarikanService = require("../services/penarikanService")
const authenticate = require("../middlewares/authenticate")
const authorize = require("../middlewares/authorize")
const AppError = require("../utils/AppError")

function kirimError(res, err) {
  if (err instanceof AppError && err.statusCode < 500) {
    return res.status(err.statusCode).json({ message: err.message })
  }
  console.error("[penarikanController]", err)
  res.status(500).json({ message: "Terjadi kesalahan pada server" })
}

// Petugas/admin melihat daftar penarikan
router.get("/", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const { status, nasabah, dari, sampai, halaman, limit } = req.query
    const hasil = await penarikanService.daftarPenarikan({ status, nasabah, dari, sampai, halaman, limit })
    res.status(200).json({ message: "Daftar penarikan berhasil diambil", ...hasil })
  } catch (err) {
    kirimError(res, err)
  }
})

// Nasabah melihat daftar pengajuan penarikan miliknya sendiri
router.get("/saya", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const { status, halaman, limit } = req.query
    const hasil = await penarikanService.daftarPenarikanSaya(req.user.id, { status, halaman, limit })
    res.status(200).json({ message: "Daftar pengajuan berhasil diambil", ...hasil })
  } catch (err) {
    kirimError(res, err)
  }
})

// Nasabah cek saldo sendiri
router.get("/saldo", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const data = await penarikanService.getSaldoNasabah(req.user.id)
    res.status(200).json({ message: "Saldo berhasil diambil", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Nasabah lihat riwayat transaksi (mutasi buku besar) miliknya sendiri
router.get("/riwayat", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const { halaman, limit } = req.query
    const hasil = await penarikanService.getRiwayatNasabah(req.user.id, { halaman, limit })
    res.status(200).json({ message: "Riwayat berhasil diambil", data: hasil.data, paginasi: hasil.paginasi })
  } catch (err) {
    kirimError(res, err)
  }
})

// Nasabah mengajukan penarikan saldo
router.post("/ajukan", authenticate, authorize("nasabah"), async (req, res) => {
  try {
    const { jumlah, metode, namaEwallet, nomorEwallet } = req.body
    const data = await penarikanService.ajukanPenarikan(req.user.id, jumlah, metode, namaEwallet, nomorEwallet)
    res.status(201).json({ message: "Pengajuan penarikan berhasil dibuat", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Petugas/admin menyetujui atau menolak pengajuan penarikan
router.patch("/:id/proses", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const { keputusan, catatan } = req.body
    const data = await penarikanService.prosesPenarikan(req.params.id, keputusan, req.user.id, catatan)
    res.status(200).json({ message: "Penarikan berhasil diproses", data })
  } catch (err) {
    kirimError(res, err)
  }
})

// Petugas/admin menandai penarikan disetujui sebagai selesai (dana sudah diserahkan)
router.patch("/:id/selesai", authenticate, authorize("petugas", "admin"), async (req, res) => {
  try {
    const { catatan } = req.body
    const data = await penarikanService.selesaikanPenarikan(req.params.id, req.user.id, catatan)
    res.status(200).json({ message: "Penarikan ditandai selesai", data })
  } catch (err) {
    kirimError(res, err)
  }
})

module.exports = router