const mongoose = require("mongoose")
const ledgerService = require("./ledgerService")
const AppError = require("../utils/AppError")

// Pembantu
function pastikanIdValid(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("ID nasabah tidak valid", 400)
  }
}

// Saldo nasabah
async function saldoNasabah(id) {
  pastikanIdValid(id)
  const saldo = await ledgerService.getSaldo(id)
  return { nasabah: id, saldo }
}

// Riwayat nasabah
async function riwayatNasabah(id) {
  pastikanIdValid(id)
  await ledgerService.getSaldo(id)
  return ledgerService.getRiwayat(id)
}

module.exports = { saldoNasabah, riwayatNasabah }