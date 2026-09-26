const mongoose = require("mongoose");
const Setoran = require("../models/Setoran");
const Penarikan = require("../models/Penarikan");
const User = require("../models/User");

async function getRekapLaporan(query) {
  const { dari, sampai } = query;
  
  // Filter tanggal opsional
  const filterTanggal = {};
  if (dari || sampai) {
    filterTanggal.createdAt = {};
    if (dari) filterTanggal.createdAt.$gte = new Date(dari);
    if (sampai) {
      const tanggalSampai = new Date(sampai);
      tanggalSampai.setHours(23, 59, 59, 999);
      filterTanggal.createdAt.$lte = tanggalSampai;
    }
  }

  // Khusus setoran, kita pakai field 'tanggal' sesuai skema
  const filterTanggalSetoran = dari || sampai ? { tanggal: filterTanggal.createdAt } : {};

  // 1. Rekap Setoran (Hanya yang berstatus TERCATAT)
  const rekapSetoran = await Setoran.aggregate([
    { $match: { status: "TERCATAT", ...filterTanggalSetoran } },
    { 
      $group: { 
        _id: null, 
        totalTransaksi: { $sum: 1 }, 
        totalBerat: { $sum: "$totalBerat" }, 
        totalNilai: { $sum: "$totalNilai" } 
      } 
    }
  ]);

  // 2. Rekap Penarikan Hanya yang berhasil ditarik
  const rekapPenarikan = await Penarikan.aggregate([
    { $match: { status: "selesai", ...filterTanggal } },
    { 
      $group: { 
        _id: null, 
        totalTransaksi: { $sum: 1 }, 
        totalNominal: { $sum: "$jumlah" } 
      } 
    }
  ]);

  // 3. Rekap Total saldo milik seluruh nasabah saat ini
  const rekapSaldo = await User.aggregate([
    { $match: { role: "nasabah" } },
    { 
      $group: { 
        _id: null, 
        totalNasabah: { $sum: 1 }, 
        totalUangMengendap: { $sum: "$saldo" } 
      } 
    }
  ]);

  return {
    setoran: rekapSetoran[0] || { totalTransaksi: 0, totalBerat: 0, totalNilai: 0 },
    penarikan: rekapPenarikan[0] || { totalTransaksi: 0, totalNominal: 0 },
    saldo: rekapSaldo[0] || { totalNasabah: 0, totalUangMengendap: 0 }
  };
}

module.exports = { getRekapLaporan };