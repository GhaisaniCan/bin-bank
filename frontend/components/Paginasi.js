import { CaretLeft, CaretRight } from "@phosphor-icons/react"

const KELAS_TOMBOL =
  "flex size-[44px] shrink-0 items-center justify-center rounded-full border-0 bg-olive-50 text-olive-700 motion-safe:transition-colors motion-safe:duration-150 enabled:cursor-pointer enabled:hover:bg-olive-100 disabled:bg-olive-50/60 disabled:text-olive-700/40"

export default function Paginasi({ halaman, totalHalaman, onUbah, nonaktif = false }) {
  if (totalHalaman <= 1) return null

  const tanpaSebelumnya = nonaktif || halaman === 1
  const tanpaBerikutnya = nonaktif || halaman === totalHalaman

  return (
    <nav aria-label="Halaman daftar" className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        title="Halaman sebelumnya"
        disabled={tanpaSebelumnya}
        aria-disabled={tanpaSebelumnya}
        onClick={() => onUbah(halaman - 1)}
        className={KELAS_TOMBOL}
      >
        <CaretLeft size={20} weight="bold" aria-hidden="true" />
      </button>
      <span className="text-small text-ink-700">
        Halaman {halaman} dari {totalHalaman}
      </span>
      <button
        type="button"
        aria-label="Halaman berikutnya"
        title="Halaman berikutnya"
        disabled={tanpaBerikutnya}
        aria-disabled={tanpaBerikutnya}
        onClick={() => onUbah(halaman + 1)}
        className={KELAS_TOMBOL}
      >
        <CaretRight size={20} weight="bold" aria-hidden="true" />
      </button>
    </nav>
  )
}
