const mongoose = require("mongoose")
const Penarikan = require("../models/Penarikan")
const ledgerService = require("./ledgerService")

const STATUS_VALID = ["diajukan", "disetujui", "ditolak", "selesai"]
const LIMIT_BAWAAN = 20
const LIMIT_MAKSIMAL = 100

async function ajukanPenarikan(nasabahId, jumlah, metode, namaEwallet, nomorEwallet) {
  const data = { nasabah: nasabahId, jumlah, metode, status: "diajukan" }

  if (metode === "e-wallet") {
    const nama = typeof namaEwallet === "string" ? namaEwallet.trim() : ""
    const nomor = typeof nomorEwallet === "string" ? nomorEwallet.replace(/[\s-]/g, "") : ""

    if (!nama) throw new Error("Nama e-wallet wajib diisi")
    if (!nomor) throw new Error("Nomor e-wallet wajib diisi")
    if (!/^\d{8,15}$/.test(nomor)) {
      throw new Error("Nomor e-wallet harus berupa 8 sampai 15 digit angka")
    }

    data.namaEwallet = nama
    data.nomorEwallet = nomor
  }

  const saldo = await ledgerService.getSaldo(nasabahId)
  if (saldo < jumlah) {
    throw new Error("Saldo tidak mencukupi untuk penarikan ini")
  }

  const penarikan = await Penarikan.create(data)
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
    penarikan.status = "disetujui"
  } else if (keputusan === "tolak") {
    penarikan.status = "ditolak"
  } else {
    throw new Error("Keputusan tidak valid, gunakan 'setuju' atau 'tolak'")
  }

  penarikan.diprosesOleh = petugasId
  penarikan.diprosesPada = new Date()
  penarikan.catatan = catatan
  await penarikan.save()
  return penarikan
}

// Konfirmasi dana diserahkan
async function selesaikanPenarikan(penarikanId, petugasId) {
  if (!mongoose.isValidObjectId(penarikanId)) {
    throw new Error("ID penarikan tidak valid")
  }

  const penarikan = await Penarikan.findOneAndUpdate(
    { _id: penarikanId, status: "disetujui" },
    { status: "selesai", dikonfirmasiOleh: petugasId, dikonfirmasiPada: new Date() },
    { returnDocument: "after" }
  )

  if (!penarikan) {
    const ada = await Penarikan.exists({ _id: penarikanId })
    if (!ada) throw new Error("Data penarikan tidak ditemukan")
    throw new Error("Hanya penarikan berstatus disetujui yang dapat ditandai selesai")
  }

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

module.exports = {
  ajukanPenarikan,
  getSaldoNasabah,
  getRiwayatNasabah,
  prosesPenarikan,
  selesaikanPenarikan,
  daftarPenarikan,
}