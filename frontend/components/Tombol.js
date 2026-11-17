const kelasVarian = {
  utama: "bg-olive-700 text-putih enabled:hover:bg-olive-800 enabled:active:bg-olive-800",
  sekunder: "border border-line-500 bg-putih text-ink-900 enabled:hover:bg-olive-50 enabled:active:bg-olive-50",
  merusak: "bg-bata-700 text-putih enabled:hover:underline enabled:hover:decoration-2",
  teks: "text-olive-700 underline decoration-1 enabled:hover:decoration-2",
  sukses: "bg-olive-50 text-olive-700 enabled:hover:bg-olive-100 enabled:hover:text-olive-800 enabled:active:bg-olive-100 disabled:opacity-50",
  bahaya: "bg-bata-100 text-bata-700 [--warna-tombol:var(--color-bata-700)] enabled:hover:bg-bata-200 enabled:active:bg-bata-200 disabled:opacity-50",
}

const kelasNonaktif = {
  utama: "bg-olive-50 text-ink-500",
  sekunder: "bg-olive-50 text-ink-500",
  merusak: "bg-olive-50 text-ink-500",
  teks: "text-ink-500",
  sukses: "bg-olive-50 text-olive-700 opacity-50",
  bahaya: "bg-bata-100 text-bata-700 opacity-50",
}

const kelasUkuran = {
  biasa: "h-7",
  ringkas: "relative h-[40px] after:absolute after:inset-x-0 after:-inset-y-[2px]",
  pil: "relative h-[40px] w-fit py-2 after:absolute after:inset-x-0 after:-inset-y-[2px]",
}

const kelasBentuk = {
  biasa: "rounded-2",
  bulat: "rounded-full",
}

export function kelasTombol({ varian = "utama", ukuran = "biasa", bentuk = "biasa", tebal, nonaktif = false } = {}) {
  const kelas = nonaktif ? kelasNonaktif[varian] : kelasVarian[varian]
  const lebarMin = ukuran === "biasa" && varian !== "teks" ? "min-w-[96px]" : ""
  const sudut = kelasBentuk[ukuran === "biasa" ? bentuk : "bulat"]
  const padding = varian === "teks" ? "px-2" : ukuran === "pil" ? "px-5" : "px-4"
  const bobot = tebal ?? (varian === "sukses" || varian === "bahaya" ? "font-medium" : "font-bold")
  return `inline-flex shrink-0 items-center justify-center text-body ${bobot} ${kelasUkuran[ukuran]} ${sudut} ${lebarMin} ${padding} ${kelas} ${varian === "teks" ? "" : "hover-tombol"}`
}

export default function Tombol({
  varian = "utama",
  ukuran = "biasa",
  bentuk = "biasa",
  type = "button",
  memproses = false,
  teksMemproses = "Memproses...",
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const nonaktif = disabled && !memproses

  return (
    <button
      type={type}
      disabled={disabled || memproses}
      aria-busy={memproses || undefined}
      className={`${kelasTombol({ varian, ukuran, bentuk, nonaktif })} ${className}`}
      {...rest}
    >
      {memproses ? teksMemproses : children}
    </button>
  )
}
