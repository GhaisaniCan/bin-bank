const express = require("express");
const setoranController = require("../controllers/setoranController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.post("/", authenticate, authorize("petugas"), setoranController.catatSetoran);
router.get("/", authenticate, authorize("petugas", "admin"), setoranController.daftarSetoran);
router.get("/:id", authenticate, setoranController.detailSetoran);

module.exports = router;
