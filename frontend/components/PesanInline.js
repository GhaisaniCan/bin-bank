const kelasVarian = {
  galat: "bg-bata-100",
  info: "bg-pet-100",
  peringatan: "bg-kardus-100",
  berhasil: "bg-daun-100",
}

const kelasIkon = {
  galat: "text-bata-700",
  info: "text-pet-700",
  peringatan: "text-kardus-700",
  berhasil: "text-daun-700",
}

export default function PesanInline({ varian = "info", judul, isi, ikon: Ikon, className = "", children }) {
  return (
    <div
      role={varian === "galat" ? "alert" : "status"}
      className={`rounded-2 p-4 text-body text-ink-900 ${kelasVarian[varian]} ${Ikon ? "flex gap-2" : ""} ${className}`}
    >
      {Ikon && <Ikon size={24} weight="regular" aria-hidden="true" className={`shrink-0 ${kelasIkon[varian]}`} />}
      <div className="min-w-0 flex-1">
        {judul && <p className="font-bold">{judul}</p>}
        {isi && <p>{isi}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}
