const mongoose = require("mongoose")
const ledgerService = require("./ledgerService")
const penarikanService = require("./penarikanService")
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
  const { saldo, saldoTertahan, saldoTersedia } = await penarikanService.getSaldoNasabah(id)
  return { nasabah: id, saldo, saldoTersedia, saldoTertahan }
}

// Riwayat nasabah
async function riwayatNasabah(id, opsi) {
  pastikanIdValid(id)
  await ledgerService.getSaldo(id)
  return ledgerService.getRiwayatHalaman(id, opsi)
}

module.exports = { saldoNasabah, riwayatNasabah }