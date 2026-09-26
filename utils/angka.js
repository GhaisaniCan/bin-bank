function bulatkan(nilai, desimal = 2) {
  const pengali = 10 ** desimal;
  return Math.round((nilai + Number.EPSILON) * pengali) / pengali;
}

function bulatkanRupiah(nilai) {
  return Math.round(nilai);
}

module.exports = { bulatkan, bulatkanRupiah };
