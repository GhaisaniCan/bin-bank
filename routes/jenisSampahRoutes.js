const express = require("express");
const jenisSampahController = require("../controllers/jenisSampahController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const { unggahGambar, validasiIdJenisSampah } = require("../middlewares/unggahGambar");

const router = express.Router();

// Gambar
router.get("/:id/gambar", validasiIdJenisSampah, jenisSampahController.ambilGambar);
router.put("/:id/gambar", authenticate, authorize("admin"), validasiIdJenisSampah, unggahGambar, jenisSampahController.unggahGambar);
router.delete("/:id/gambar", authenticate, authorize("admin"), validasiIdJenisSampah, jenisSampahController.hapusGambar);

// Hanya admin yang bisa tambah, ubah harga, dan ubah status aktif
router.post("/", authenticate, authorize("admin"), jenisSampahController.tambahJenisSampah);
router.put("/:id", authenticate, authorize("admin"), jenisSampahController.ubahJenisSampah);
router.patch("/:id/status", authenticate, authorize("admin"), jenisSampahController.ubahStatus);

// Semua pengguna yang login (admin, petugas, nasabah) bisa melihat daftar
router.get("/", authenticate, jenisSampahController.dapatkanJenisSampah);

module.exports = router;