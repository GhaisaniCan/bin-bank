"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, FileText, HandCoins } from "@phosphor-icons/react"
import KartuRingkasan from "@/components/KartuRingkasan"
import TabelSetoran from "@/components/TabelSetoran"
import { kelasTombol } from "@/components/Tombol"
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
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol min-[600px]:w-auto"

const kelasTombolSekunder = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} w-full gap-2 hover:bg-olive-50 active:bg-olive-50 min-[600px]:w-auto`

const KELAS_DERET = "flex flex-wrap items-stretch gap-3 pb-3"

const KELAS_ITEM = "flex min-w-0 max-w-[13rem] flex-1 basis-[9.5rem] items-stretch"

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
        <Link href="/petugas/setoran/baru" className={kelasUtama}>
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
          <ul className={`mt-4 ${KELAS_DERET}`}>
            <li className={KELAS_ITEM}>
              <KartuRingkasan
                href="/petugas/penarikan"
                ukuran="ringkas"
                ikon={FileText}
                label="Pengajuan menunggu keputusan"
                angka={PERLU_DIPROSES.menunggu}
              />
            </li>
            <li className={KELAS_ITEM}>
              <KartuRingkasan
                href="/petugas/penarikan"
                ukuran="ringkas"
                ikon={HandCoins}
                label="Dana disetujui yang perlu diserahkan"
                angka={PERLU_DIPROSES.disetujui}
              />
            </li>
          </ul>
        )}
      </section>

      <section aria-labelledby="judul-terakhir" className="mt-6">
        <h2 id="judul-terakhir" className="text-h2 font-bold">
          Setoran terakhir
        </h2>
        <div className="mt-4">
          <TabelSetoran baris={SETORAN_TERAKHIR} />
          <Link href="/petugas/setoran" className={`${kelasTombolSekunder} mt-4`}>
            Lihat semua setoran
            <ArrowRight size={20} weight="regular" aria-hidden="true" className="shrink-0" />
          </Link>
        </div>
      </section>
    </main>
  )
}
