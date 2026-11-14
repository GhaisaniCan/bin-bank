import Link from "next/link"
import { CaretRight } from "@phosphor-icons/react/dist/ssr"

const DAFTAR_KELOLA = [
  {
    href: "/admin/kelola/jenis-sampah",
    judul: "Jenis sampah",
    keterangan: "Tambah jenis, ubah harga per kg, nonaktifkan",
  },
]

export default function Halaman() {
  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Kelola</h1>

      <ul className="mt-5 border-t border-line-300">
        {DAFTAR_KELOLA.map((item) => (
          <li key={item.href} className="border-b border-line-300">
            <Link href={item.href} className="flex min-h-8 items-center justify-between gap-3 px-1 py-3 hover:bg-olive-50">
              <span>
                <span className="block text-body font-bold">{item.judul}</span>
                <span className="block text-small text-ink-700">{item.keterangan}</span>
              </span>
              <CaretRight size={24} weight="regular" aria-hidden="true" className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
