"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import TabelSetoran from "@/components/TabelSetoran"
import { ambilUser } from "@/lib/auth"

const NAMA = ["Sari Wulandari", "Budi Santoso", "Sari Dewi", "Joko Prasetyo"]

const SETORAN_TERAKHIR = Array.from({ length: 5 }, (_, i) => ({
  _id: `s${i + 1}`,
  nasabah: { nama: NAMA[i % 4] },
  tanggal: new Date(2026, 10, 13 - i, 10).toISOString(),
  totalBerat: 2.5 + i * 0.75,
  totalNilai: 12500 + i * 4000,
  status: "TERCATAT",
}))

const PERLU_DIPROSES = { menunggu: 7, disetujui: 3 }

const kelasUtama =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 min-[600px]:w-auto"

const kelasTautan =
  "inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"

function BarisProses({ label, jumlah }) {
  return (
    <li className="border-b border-line-300">
      <Link
        href="/petugas/penarikan"
        className="flex min-h-7 items-center justify-between gap-3 px-1 py-3 hover:bg-olive-50"
      >
        <span className="text-body">{label}</span>
        <span className="text-amount font-bold tabular-nums">{jumlah}</span>
      </Link>
    </li>
  )
}

export default function Halaman() {
  const [nama, setNama] = useState("")

  useEffect(() => {
    setNama(ambilUser()?.nama ?? "")
  }, [])

  const kosong = PERLU_DIPROSES.menunggu === 0 && PERLU_DIPROSES.disetujui === 0

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Beranda</h1>
      {nama && <p className="mt-2 text-small text-olive-700">{nama}</p>}

      <div className="mt-6">
        <Link href="/petugas/cari-nasabah" className={kelasUtama}>
          Catat setoran
        </Link>
      </div>

      <section aria-labelledby="judul-proses" className="mt-6">
        <h2 id="judul-proses" className="text-h2 font-bold">
          Perlu diproses
        </h2>
        {kosong ? (
          <p className="mt-2 text-body text-ink-700">Tidak ada pengajuan yang perlu diproses</p>
        ) : (
          <ul className="mt-2 border-t border-line-300">
            <BarisProses label="Pengajuan menunggu keputusan" jumlah={PERLU_DIPROSES.menunggu} />
            <BarisProses label="Dana disetujui yang perlu diserahkan" jumlah={PERLU_DIPROSES.disetujui} />
          </ul>
        )}
      </section>

      <section aria-labelledby="judul-terakhir" className="mt-6">
        <h2 id="judul-terakhir" className="text-h2 font-bold">
          Setoran terakhir
        </h2>
        <div className="mt-4">
          <TabelSetoran baris={SETORAN_TERAKHIR} />
          <Link href="/petugas/setoran" className={`${kelasTautan} mt-2`}>
            Lihat semua setoran
          </Link>
        </div>
      </section>
    </main>
  )
}
