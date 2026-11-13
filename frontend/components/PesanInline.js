const kelasVarian = {
  galat: "bg-bata-100",
  info: "bg-pet-100",
  peringatan: "bg-kardus-100",
  berhasil: "bg-daun-100",
}

export default function PesanInline({ varian = "info", judul, isi, className = "" }) {
  return (
    <div
      role={varian === "galat" ? "alert" : "status"}
      className={`rounded-2 p-4 text-body text-ink-900 ${kelasVarian[varian]} ${className}`}
    >
      {judul && <p className="font-bold">{judul}</p>}
      {isi && <p>{isi}</p>}
    </div>
  )
}
