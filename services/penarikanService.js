const Penarikan = require("../models/Penarikan")
const ledgerService = require("./ledgerService")

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

module.exports = { ajukanPenarikan, getSaldoNasabah, getRiwayatNasabah, prosesPenarikan }
