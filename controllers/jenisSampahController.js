const express = require('express');
const router = express.Router();
const JenisSampah = require('../models/JenisSampah');

// auth stuff
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');


// GET
router.get('/', authenticate, async (req, res) => {
  try {
    const data = await JenisSampah.find();
    res.status(200).json({ message: "Data berhasil diambil", data: data });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
});


// POST
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { nama, harga_per_kg } = req.body;
    const sampahBaru = new JenisSampah({ nama, harga_per_kg });
    await sampahBaru.save();
    res.status(201).json({ message: "Jenis sampah berhasil ditambahkan", data: sampahBaru });
  } catch (error) {
    res.status(400).json({ message: "Gagal menambahkan data", error: error.message });
  }
});


// PUT
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { nama, harga_per_kg } = req.body;
    const sampahDiperbarui = await JenisSampah.findByIdAndUpdate(
      req.params.id,
      { nama, harga_per_kg },
      { returnDocument: 'after' } 
    );
    if (!sampahDiperbarui) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json({ message: "Harga berhasil diperbarui", data: sampahDiperbarui });
  } catch (error) {
    res.status(400).json({ message: "Gagal memperbarui harga" });
  }
});

module.exports = router;