const express = require("express");
const laporanController = require("../controllers/laporanController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Route: GET /laporan
router.get("/", authenticate, authorize("admin"), laporanController.dapatkanLaporan);

module.exports = router;