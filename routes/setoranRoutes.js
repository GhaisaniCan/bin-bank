const express = require("express");
const setoranController = require("../controllers/setoranController");

// Middleware milik Modul A (Anggota 1).
// Di repo kelompok keduanya berada di file terpisah dan diekspor langsung
// (bukan sebagai objek { authenticate, authorize }), jadi require-nya dipisah.
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Fitur 4: petugas mencatat hasil timbangan. Saldo nasabah bertambah otomatis (Fitur 5).
router.post("/", authenticate, authorize("petugas"), setoranController.catatSetoran);

// Fitur 4: petugas dan admin melihat daftar setoran yang telah dicatat.
router.get("/", authenticate, authorize("petugas", "admin"), setoranController.daftarSetoran);

// Detail satu setoran. Nasabah hanya boleh membuka setoran miliknya sendiri,
// pengecekan kepemilikan dilakukan di service.
router.get("/:id", authenticate, setoranController.detailSetoran);

module.exports = router;
