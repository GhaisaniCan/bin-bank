const kelasVarian = {
  utama: "min-w-[96px] px-4 bg-olive-700 text-putih enabled:hover:bg-olive-800 enabled:active:bg-olive-800",
  sekunder: "min-w-[96px] px-4 border border-line-500 bg-putih text-ink-900 enabled:hover:bg-olive-50 enabled:active:bg-olive-50",
  merusak: "min-w-[96px] px-4 bg-bata-700 text-putih enabled:hover:underline enabled:hover:decoration-2",
  teks: "px-2 text-olive-700 underline decoration-1 enabled:hover:decoration-2",
}

const kelasNonaktif = {
  utama: "min-w-[96px] px-4 bg-olive-50 text-ink-500",
  sekunder: "min-w-[96px] px-4 bg-olive-50 text-ink-500",
  merusak: "min-w-[96px] px-4 bg-olive-50 text-ink-500",
  teks: "px-2 text-ink-500",
}

export default function Tombol({
  varian = "utama",
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

  return (
    <button
      type={type}
      disabled={disabled || memproses}
      aria-busy={memproses || undefined}
      className={`inline-flex h-7 shrink-0 items-center justify-center rounded-2 text-body font-bold ${kelas} ${className}`}
      {...rest}
    >
      {memproses ? teksMemproses : children}
    </button>
  )
}
