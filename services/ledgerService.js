const BukuBesar = require("../models/BukuBesar")

async function getSaldo(nasabahId) {
  const entriTerakhir = await BukuBesar.findOne({ nasabah: nasabahId }).sort({ createdAt: -1 })
  return entriTerakhir ? entriTerakhir.saldoSetelah : 0
}

async function getRiwayat(nasabahId) {
  return BukuBesar.find({ nasabah: nasabahId }).sort({ createdAt: -1 })
}

async function credit(nasabahId, jumlah, keterangan, referensi) {
  const saldoSebelum = await getSaldo(nasabahId)
  const entri = await BukuBesar.create({
    nasabah: nasabahId,
    tipe: "kredit",
    jumlah,
    saldoSetelah: saldoSebelum + jumlah,
    keterangan,
    referensi,
  })
  return entri
}

async function debit(nasabahId, jumlah, keterangan, referensi) {
  const saldoSebelum = await getSaldo(nasabahId)
  if (saldoSebelum < jumlah) {
    throw new Error("Saldo tidak mencukupi")
  }
  const entri = await BukuBesar.create({
    nasabah: nasabahId,
    tipe: "debit",
    jumlah,
    saldoSetelah: saldoSebelum - jumlah,
    keterangan,
    referensi,
  })
  return entri
}

module.exports = { getSaldo, getRiwayat, credit, debit }
