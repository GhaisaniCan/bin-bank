// Pembulatan nilai desimal. Dipakai supaya total berat/nilai tidak menyimpan
// sisa pecahan floating point seperti 3.0000000000000004.
function bulatkan(nilai, desimal = 2) {
  const pengali = 10 ** desimal;
  return Math.round((nilai + Number.EPSILON) * pengali) / pengali;
}

// Nilai uang disimpan dalam rupiah penuh, tanpa sen.
function bulatkanRupiah(nilai) {
  return Math.round(nilai);
}

module.exports = { bulatkan, bulatkanRupiah };
