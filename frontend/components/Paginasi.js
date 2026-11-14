import Tombol from "@/components/Tombol"

export default function Paginasi({ halaman, totalHalaman, onUbah }) {
  if (totalHalaman <= 1) return null

  return (
    <nav aria-label="Halaman daftar" className="mt-4 flex items-center justify-between gap-3">
      <Tombol varian="sekunder" disabled={halaman === 1} onClick={() => onUbah(halaman - 1)}>
        Sebelumnya
      </Tombol>
      <span className="text-small text-ink-700">
        Halaman {halaman} dari {totalHalaman}
      </span>
      <Tombol varian="sekunder" disabled={halaman === totalHalaman} onClick={() => onUbah(halaman + 1)}>
        Berikutnya
      </Tombol>
    </nav>
  )
}