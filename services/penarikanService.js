const mongoose = require("mongoose")
const Penarikan = require("../models/Penarikan")
const User = require("../models/User")
const ledgerService = require("./ledgerService")

const STATUS_VALID = ["diajukan", "disetujui", "ditolak", "selesai"]
const METODE_VALID = ["tunai", "e-wallet"]
const LIMIT_BAWAAN = 20
const LIMIT_MAKSIMAL = 100

// Helper
async function dalamTransaksi(kerja) {
  const session = await mongoose.startSession()
  try {
    let hasil
    await session.withTransaction(async () => {
      hasil = await kerja(session)
    })
    return hasil
  } finally {
    await session.endSession()
  }
}

async function hitungTertahan(nasabahId, session) {
  const hasil = await Penarikan.aggregate([
    { $match: { nasabah: new mongoose.Types.ObjectId(String(nasabahId)), status: "diajukan" } },
    { $group: { _id: null, total: { $sum: "$jumlah" } } },
  ]).session(session || null)
  return hasil[0] ? hasil[0].total : 0
}

function ambilPaginasi(halaman, limit) {
  const halamanAktif = Math.max(1, Number.parseInt(halaman, 10) || 1)
  const limitAktif = Math.min(
    LIMIT_MAKSIMAL,
    Math.max(1, Number.parseInt(limit, 10) || LIMIT_BAWAAN)
  )
  return { halamanAktif, limitAktif }
}

function bangunFilterTanggal(dari, sampai) {
  if (!dari && !sampai) return null

  const rentang = {}
  let tanggalDari
  let tanggalSampai

  if (dari) {
    tanggalDari = new Date(dari)
    if (Number.isNaN(tanggalDari.getTime())) {
      throw new Error("Format tanggal 'dari' tidak valid")
    }
    rentang.$gte = tanggalDari
  }
  if (sampai) {
    tanggalSampai = new Date(sampai)
    if (Number.isNaN(tanggalSampai.getTime())) {
      throw new Error("Format tanggal 'sampai' tidak valid")
    }
    tanggalSampai.setHours(23, 59, 59, 999)
    rentang.$lte = tanggalSampai
  }
  if (tanggalDari && tanggalSampai && tanggalDari > tanggalSampai) {
    throw new Error("Tanggal 'dari' tidak boleh setelah tanggal 'sampai'")
  }
  return rentang
}

async function ambilDaftar(filter, halaman, limit, populasi) {
  const { halamanAktif, limitAktif } = ambilPaginasi(halaman, limit)

  let kueri = Penarikan.find(filter)
    .sort({ createdAt: -1 })
    .skip((halamanAktif - 1) * limitAktif)
    .limit(limitAktif)
  populasi.forEach(([jalur, kolom]) => {
    kueri = kueri.populate(jalur, kolom)
  })

  const [data, total] = await Promise.all([kueri, Penarikan.countDocuments(filter)])

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

// Pengajuan
async function ajukanPenarikan(nasabahId, jumlah, metode, namaEwallet, nomorEwallet) {
  if (typeof jumlah !== "number" || !Number.isInteger(jumlah) || jumlah <= 0) {
    throw new Error("Jumlah penarikan harus berupa bilangan bulat lebih dari 0")
  }
  if (!METODE_VALID.includes(metode)) {
    throw new Error("Metode harus tunai atau e-wallet")
  }

  const data = { nasabah: nasabahId, jumlah, metode, status: "diajukan" }

  if (metode === "e-wallet") {
    const nama = typeof namaEwallet === "string" ? namaEwallet.trim() : ""
    const nomor = typeof nomorEwallet === "string" ? nomorEwallet.trim() : ""
    if (!nama) throw new Error("Nama e-wallet wajib diisi")
    if (!nomor) throw new Error("Nomor e-wallet wajib diisi")
    data.namaEwallet = nama
    data.nomorEwallet = nomor
  }

  return dalamTransaksi(async (session) => {
    await User.updateOne({ _id: nasabahId }, { $inc: { __v: 1 } }, { session })

    const saldo = await ledgerService.ambilSaldo(nasabahId, session)
    const tertahan = await hitungTertahan(nasabahId, session)
    if (jumlah > saldo - tertahan) {
      throw new Error("Saldo tersedia tidak mencukupi untuk penarikan ini")
    }

    const [penarikan] = await Penarikan.create([data], { session })
    return penarikan
  })
}

// Saldo dan riwayat
async function getSaldoNasabah(nasabahId) {
  const saldo = await ledgerService.getSaldo(nasabahId)
  const tertahan = await hitungTertahan(nasabahId)
  return { saldo, saldoTertahan: tertahan, saldoTersedia: saldo - tertahan }
}

async function getRiwayatNasabah(nasabahId) {
  return ledgerService.getRiwayat(nasabahId)
}

// Pemrosesan
async function prosesPenarikan(penarikanId, keputusan, petugasId, catatan) {
  if (!mongoose.isValidObjectId(penarikanId)) {
    throw new Error("ID penarikan tidak valid")
  }
  if (keputusan !== "setuju" && keputusan !== "tolak") {
    throw new Error("Keputusan tidak valid, gunakan 'setuju' atau 'tolak'")
  }

  const alasan = typeof catatan === "string" ? catatan.trim() : ""
  if (keputusan === "tolak" && !alasan) {
    throw new Error("Alasan penolakan wajib diisi")
  }

  return dalamTransaksi(async (session) => {
    const penarikan = await Penarikan.findOneAndUpdate(
      { _id: penarikanId, status: "diajukan" },
      {
        status: keputusan === "setuju" ? "disetujui" : "ditolak",
        diprosesOleh: petugasId,
        diprosesPada: new Date(),
        catatan: alasan || undefined,
      },
      { returnDocument: "after", session }
    )

    if (!penarikan) {
      const ada = await Penarikan.exists({ _id: penarikanId }).session(session)
      if (!ada) throw new Error("Data penarikan tidak ditemukan")
      throw new Error("Penarikan ini sudah pernah diproses")
    }

    if (keputusan === "setuju") {
      await ledgerService.debit(
        {
          nasabahId: penarikan.nasabah,
          jumlah: penarikan.jumlah,
          sumber: "PENARIKAN",
          referensiId: penarikan._id,
          keterangan: `Penarikan ${penarikan.metode}`,
        },
        session
      )
    }

    return penarikan
  })
}

// Konfirmasi dana diserahkan
async function selesaikanPenarikan(penarikanId, petugasId, catatan) {
  if (!mongoose.isValidObjectId(penarikanId)) {
    throw new Error("ID penarikan tidak valid")
  }

  const keterangan = typeof catatan === "string" ? catatan.trim() : ""

  const penarikan = await Penarikan.findOneAndUpdate(
    { _id: penarikanId, status: "disetujui" },
    {
      status: "selesai",
      dikonfirmasiOleh: petugasId,
      dikonfirmasiPada: new Date(),
      catatanKonfirmasi: keterangan || undefined,
    },
    { returnDocument: "after" }
  )

  if (!penarikan) {
    const ada = await Penarikan.exists({ _id: penarikanId })
    if (!ada) throw new Error("Data penarikan tidak ditemukan")
    throw new Error("Hanya penarikan berstatus disetujui yang dapat ditandai selesai")
  }

  return penarikan
}

// Daftar untuk petugas dan admin (bawaan: diajukan)
async function daftarPenarikan({ status, nasabah, dari, sampai, halaman, limit } = {}) {
  const filter = {}

  const statusAktif = status || "diajukan"
  if (statusAktif !== "semua") {
    if (!STATUS_VALID.includes(statusAktif)) {
      throw new Error("Status hanya boleh diajukan, disetujui, ditolak, selesai, atau semua")
    }
    filter.status = statusAktif
  }

  if (nasabah) {
    if (!mongoose.isValidObjectId(nasabah)) {
      throw new Error("ID nasabah tidak valid")
    }
    filter.nasabah = nasabah
  }

  const rentang = bangunFilterTanggal(dari, sampai)
  if (rentang) filter.createdAt = rentang

  return ambilDaftar(filter, halaman, limit, [
    ["nasabah", "nama email"],
    ["diprosesOleh", "nama"],
  ])
}

// Daftar untuk nasabah (miliknya sendiri)
async function daftarPenarikanSaya(nasabahId, { status, halaman, limit } = {}) {
  const filter = { nasabah: nasabahId }

  if (status && status !== "semua") {
    if (!STATUS_VALID.includes(status)) {
      throw new Error("Status hanya boleh diajukan, disetujui, ditolak, selesai, atau semua")
    }
    filter.status = status
  }

  return ambilDaftar(filter, halaman, limit, [])
}

module.exports = {
  ajukanPenarikan,
  getSaldoNasabah,
  getRiwayatNasabah,
  prosesPenarikan,
  selesaikanPenarikan,
  daftarPenarikan,
  daftarPenarikanSaya,
}