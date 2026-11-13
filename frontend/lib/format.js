const ZONA = "Asia/Jakarta"

const angkaRupiah = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })

const tanggalPendek = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
})

const jamMenit = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: ZONA,
})

function bagian(formatter, nilai) {
  return Object.fromEntries(formatter.formatToParts(nilai).map((p) => [p.type, p.value]))
}

// Uang
export function formatRupiah(angka) {
  return `Rp ${angkaRupiah.format(Math.round(Number(angka) || 0))}`
}

// Waktu
export function formatTanggal(isoString) {
  const tanggal = new Date(isoString)
  if (Number.isNaN(tanggal.getTime())) return ""
  const { day, month, year } = bagian(tanggalPendek, tanggal)
  return `${day} ${month.replace(".", "")} ${year}`
}

export function formatJam(date) {
  const waktu = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(waktu.getTime())) return ""
  const { hour, minute } = bagian(jamMenit, waktu)
  return `${hour}.${minute} WIB`
}
