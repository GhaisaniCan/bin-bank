const PETA_STATUS = {
  diajukan: { kata: "MENUNGGU", kelas: "bg-kardus-100 text-kardus-700" },
  disetujui: { kata: "DISETUJUI", kelas: "bg-pet-100 text-pet-700" },
  selesai: { kata: "SELESAI", kelas: "bg-daun-100 text-daun-700" },
  ditolak: { kata: "DITOLAK", kelas: "bg-bata-100 text-bata-700" },
  TERCATAT: { kata: "TERCATAT", kelas: "bg-daun-100 text-daun-700" },
  DIBATALKAN: { kata: "DIBATALKAN", kelas: "bg-bata-100 text-bata-700" },
  AKTIF: { kata: "AKTIF", kelas: "bg-daun-100 text-daun-700" },
  NONAKTIF: { kata: "NONAKTIF", kelas: "border border-line-500 bg-putih text-ink-700" },
}

export default function CapStatus({ status, className = "" }) {
  const cap = PETA_STATUS[status]
  if (!cap) return null
  const { kata, kelas } = cap

  return (
    <span
      className={`inline-flex min-h-[28px] shrink-0 items-center rounded-2 px-3 text-cap font-bold uppercase ${kelas} ${className}`}
    >
      {kata}
    </span>
  )
}
