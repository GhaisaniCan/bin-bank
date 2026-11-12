const mongoose = require("mongoose")
const Penarikan = require("../models/Penarikan")
const ledgerService = require("./ledgerService")

const STATUS_VALID = ["diajukan", "disetujui", "ditolak", "selesai"]
const LIMIT_BAWAAN = 20
const LIMIT_MAKSIMAL = 100

async function ajukanPenarikan(nasabahId, jumlah, metode) {
  const saldo = await ledgerService.getSaldo(nasabahId)
  if (saldo < jumlah) {
    throw new Error("Saldo tidak mencukupi untuk penarikan ini")
  }

  const penarikan = await Penarikan.create({
    nasabah: nasabahId,
    jumlah,
    metode,
    status: "diajukan",
  })
  return penarikan
}

async function getSaldoNasabah(nasabahId) {
  const saldo = await ledgerService.getSaldo(nasabahId)
  return { saldo }
}

async function getRiwayatNasabah(nasabahId) {
  return ledgerService.getRiwayat(nasabahId)
}

async function prosesPenarikan(penarikanId, keputusan, petugasId, catatan) {
  const penarikan = await Penarikan.findById(penarikanId)
  if (!penarikan) throw new Error("Data penarikan tidak ditemukan")
  if (penarikan.status !== "diajukan") {
    throw new Error("Penarikan ini sudah pernah diproses")
  }

  if (keputusan === "setuju") {
    await ledgerService.debit(
      penarikan.nasabah,
      penarikan.jumlah,
      `Penarikan ${penarikan.metode}`,
      { tipe: "penarikan", id: penarikan._id }
    )
    penarikan.status = "selesai"
  } else if (keputusan === "tolak") {
    penarikan.status = "ditolak"
  } else {
    throw new Error("Keputusan tidak valid, gunakan 'setuju' atau 'tolak'")
  }

  penarikan.diprosesOleh = petugasId
  penarikan.catatan = catatan
  await penarikan.save()
  return penarikan
}

// Daftar penarikan
async function daftarPenarikan({ status, nasabah, dari, sampai, halaman, limit } = {}) {
  const filter = {}

  if (status) {
    if (!STATUS_VALID.includes(status)) {
      throw new Error("Status hanya boleh diajukan, disetujui, ditolak, atau selesai")
    }
    filter.status = status
  }

  if (nasabah) {
    if (!mongoose.isValidObjectId(nasabah)) {
      throw new Error("ID nasabah tidak valid")
    }
    filter.nasabah = nasabah
  }

  if (dari || sampai) {
    filter.createdAt = {}
    if (dari) {
      const tanggalDari = new Date(dari)
      if (Number.isNaN(tanggalDari.getTime())) {
        throw new Error("Format tanggal 'dari' tidak valid")
      }
      filter.createdAt.$gte = tanggalDari
    }
    if (sampai) {
      const tanggalSampai = new Date(sampai)
      if (Number.isNaN(tanggalSampai.getTime())) {
        throw new Error("Format tanggal 'sampai' tidak valid")
      }
      tanggalSampai.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = tanggalSampai
    }
  }

  const halamanAktif = Math.max(1, Number.parseInt(halaman, 10) || 1)
  const limitAktif = Math.min(
    LIMIT_MAKSIMAL,
    Math.max(1, Number.parseInt(limit, 10) || LIMIT_BAWAAN)
  )

  const [data, total] = await Promise.all([
    Penarikan.find(filter)
      .sort({ createdAt: -1 })
      .skip((halamanAktif - 1) * limitAktif)
      .limit(limitAktif)
      .populate("nasabah", "nama")
      .populate("diprosesOleh", "nama"),
    Penarikan.countDocuments(filter),
  ])

  return {
    data,
    paginasi: {
      halaman: halamanAktif,
      limit: limitAktif,
      total,
      totalHalaman: Math.ceil(total / limitAktif) || 0,
    },
  }
}

module.exports = { ajukanPenarikan, getSaldoNasabah, getRiwayatNasabah, prosesPenarikan, daftarPenarikan }