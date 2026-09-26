const express = require("express");
const jenisSampahController = require("../controllers/jenisSampahController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Hanya admin yang bisa tambah, ubah harga, dan ubah status aktif
router.post("/", authenticate, authorize("admin"), jenisSampahController.tambahJenisSampah);
router.put("/:id", authenticate, authorize("admin"), jenisSampahController.ubahJenisSampah);
router.patch("/:id/status", authenticate, authorize("admin"), jenisSampahController.ubahStatus);

// Semua pengguna yang login (admin, petugas, nasabah) bisa melihat daftar
router.get("/", authenticate, jenisSampahController.dapatkanJenisSampah);

module.exports = router;