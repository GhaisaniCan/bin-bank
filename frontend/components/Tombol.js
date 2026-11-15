const kelasVarian = {
  utama: "px-4 bg-olive-700 text-putih enabled:hover:bg-olive-800 enabled:active:bg-olive-800",
  sekunder: "px-4 border border-line-500 bg-putih text-ink-900 enabled:hover:bg-olive-50 enabled:active:bg-olive-50",
  merusak: "px-4 bg-bata-700 text-putih enabled:hover:underline enabled:hover:decoration-2",
  teks: "px-2 text-olive-700 underline decoration-1 enabled:hover:decoration-2",
}

const kelasNonaktif = {
  utama: "px-4 bg-olive-50 text-ink-500",
  sekunder: "px-4 bg-olive-50 text-ink-500",
  merusak: "px-4 bg-olive-50 text-ink-500",
  teks: "px-2 text-ink-500",
}

const kelasUkuran = {
  biasa: "h-7",
  ringkas: "relative h-[40px] after:absolute after:inset-x-0 after:-inset-y-[2px]",
}

const kelasBentuk = {
  biasa: "rounded-2",
  bulat: "rounded-full",
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
  const tampilNonaktif = disabled && !memproses
  const kelas = tampilNonaktif ? kelasNonaktif[varian] : kelasVarian[varian]
  const lebarMin = ukuran === "biasa" && varian !== "teks" ? "min-w-[96px]" : ""
  const sudut = kelasBentuk[ukuran === "ringkas" ? "bulat" : bentuk]

  return (
    <button
      type={type}
      disabled={disabled || memproses}
      aria-busy={memproses || undefined}
      className={`inline-flex shrink-0 items-center justify-center text-body font-bold ${kelasUkuran[ukuran]} ${sudut} ${lebarMin} ${kelas} ${className}`}
      {...rest}
    >
      {memproses ? teksMemproses : children}
    </button>
  )
}
