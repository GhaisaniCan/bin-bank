const mongoose = require("mongoose");
const Setoran = require("../models/Setoran");
const Penarikan = require("../models/Penarikan");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const STATUS_PENARIKAN = ["diajukan", "disetujui", "ditolak", "selesai"];

async function getRekapLaporan(query) {
  const { dari, sampai } = query;
  
  // Filter tanggal opsional
  const filterTanggal = {};
  if (dari || sampai) {
    filterTanggal.createdAt = {};
    let tanggalDari;
    let tanggalSampai;
    if (dari) {
      tanggalDari = new Date(dari);
      if (Number.isNaN(tanggalDari.getTime())) {
        throw new AppError("Format tanggal 'dari' tidak valid", 400);
      }
      filterTanggal.createdAt.$gte = tanggalDari;
    }
    if (sampai) {
      tanggalSampai = new Date(sampai);
      if (Number.isNaN(tanggalSampai.getTime())) {
        throw new AppError("Format tanggal 'sampai' tidak valid", 400);
      }
      tanggalSampai.setHours(23, 59, 59, 999);
      filterTanggal.createdAt.$lte = tanggalSampai;
    }
    if (tanggalDari && tanggalSampai && tanggalDari > tanggalSampai) {
      throw new AppError("Tanggal 'dari' tidak boleh setelah tanggal 'sampai'", 400);
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

  // 4. Rekap Setoran per jenis sampah (Hanya yang berstatus TERCATAT)
  const setoranPerJenis = await Setoran.aggregate([
    { $match: { status: "TERCATAT", ...filterTanggalSetoran } },
    { $unwind: "$rincian" },
    {
      $group: {
        _id: "$rincian.jenisSampah",
        namaSampah: { $first: "$rincian.namaSampah" },
        totalBerat: { $sum: "$rincian.berat" },
        totalNilai: { $sum: "$rincian.subtotal" },
        jumlahTransaksi: { $sum: 1 }
      }
    },
    { $sort: { totalBerat: -1 } },
    {
      $project: {
        _id: 0,
        jenisSampah: "$_id",
        namaSampah: 1,
        totalBerat: 1,
        totalNilai: 1,
        jumlahTransaksi: 1
      }
    }
  ]);

  // 5. Rekap Penarikan per status (semua status selalu tampil)
  const penarikanStatusMentah = await Penarikan.aggregate([
    { $match: { ...filterTanggal } },
    {
      $group: {
        _id: "$status",
        totalTransaksi: { $sum: 1 },
        totalNominal: { $sum: "$jumlah" }
      }
    }
  ]);

  const penarikanPerStatus = STATUS_PENARIKAN.map((status) => {
    const ditemukan = penarikanStatusMentah.find((item) => item._id === status);
    return {
      status,
      totalTransaksi: ditemukan ? ditemukan.totalTransaksi : 0,
      totalNominal: ditemukan ? ditemukan.totalNominal : 0
    };
  });

  return {
    setoran: rekapSetoran[0] || { totalTransaksi: 0, totalBerat: 0, totalNilai: 0 },
    penarikan: rekapPenarikan[0] || { totalTransaksi: 0, totalNominal: 0 },
    saldo: rekapSaldo[0] || { totalNasabah: 0, totalUangMengendap: 0 },
    setoranPerJenis,
    penarikanPerStatus
  };
}

module.exports = { getRekapLaporan };