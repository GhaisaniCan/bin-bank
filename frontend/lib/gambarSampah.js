const PEMETAAN = [
  ["minyak jelantah", "minyak-jelantah.webp"],
  ["jelantah", "minyak-jelantah.webp"],
  ["botol plastik", "botol-plastik.webp"],
  ["gelas plastik", "gelas-plastik.webp"],
  ["plastik keras", "plastik-keras.webp"],
  ["kresek", "plastik-kresek.webp"],
  ["botol kaca", "botol-kaca.webp"],
  ["kaca", "botol-kaca.webp"],
  ["kardus", "kardus.webp"],
  ["hvs", "kertas-hvs.webp"],
  ["koran", "koran.webp"],
  ["kertas campur", "kertas-campur.webp"],
  ["aluminium", "kaleng-aluminium.webp"],
  ["alumunium", "kaleng-aluminium.webp"],
  ["kaleng besi", "kaleng-besi.webp"],
  ["besi", "besi-tua.webp"],
]

function rapikan(teks) {
  return String(teks ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

// Gambar sampah
export function gambarSampah(nama) {
  const teks = ` ${rapikan(nama)} `
  const cocok = PEMETAAN.find(([kunci]) => teks.includes(` ${kunci} `))
  return cocok ? `/jenis-sampah/${cocok[1]}` : null
}

const KELOMPOK = [
  ["besi", ["besi", "kaleng", "aluminium"]],
  ["plastik", ["plastik", "kresek", "botol plastik", "gelas plastik"]],
  ["kertas", ["kardus", "kertas", "koran", "hvs"]],
]

// Kelompok sampah
export function kelompokSampah(nama) {
  const teks = ` ${rapikan(nama)} `
  const cocok = KELOMPOK.find(([, kunci]) => kunci.some((k) => teks.includes(` ${k} `)))
  return cocok ? cocok[0] : "lainnya"
}
