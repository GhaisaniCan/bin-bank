import { Check, Checks, Hourglass, Notebook, Prohibit, X } from "@phosphor-icons/react"

const PETA_STATUS = {
  diajukan: { kata: "MENUNGGU", Ikon: Hourglass, kelas: "bg-kardus-100 text-kardus-700" },
  disetujui: { kata: "DISETUJUI", Ikon: Check, kelas: "bg-pet-100 text-pet-700" },
  selesai: { kata: "SELESAI", Ikon: Checks, kelas: "bg-daun-100 text-daun-700" },
  ditolak: { kata: "DITOLAK", Ikon: X, kelas: "bg-bata-100 text-bata-700" },
  TERCATAT: { kata: "TERCATAT", Ikon: Notebook, kelas: "bg-daun-100 text-daun-700" },
  DIBATALKAN: { kata: "DIBATALKAN", Ikon: Prohibit, kelas: "bg-bata-100 text-bata-700" },
  AKTIF: { kata: "AKTIF", Ikon: Check, kelas: "bg-daun-100 text-daun-700" },
  NONAKTIF: { kata: "NONAKTIF", Ikon: Prohibit, kelas: "border border-line-500 bg-putih text-ink-700" },
}

export default function CapStatus({ status, className = "" }) {
  const cap = PETA_STATUS[status]
  if (!cap) return null
  const { kata, Ikon, kelas } = cap

  return (
    <span
      className={`inline-flex min-h-[28px] shrink-0 items-center gap-1 rounded-2 px-2 text-cap font-bold uppercase ${kelas} ${className}`}
    >
      <Ikon size={16} weight="regular" aria-hidden="true" className="shrink-0" />
      {kata}
    </span>
  )
}
