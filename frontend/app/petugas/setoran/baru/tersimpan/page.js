"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"
import { ambilUser } from "@/lib/auth"
import { formatRupiah } from "@/lib/format"

const KUNCI_HASIL = "binbank_hasil_setoran"

const kelasTautan =
  "inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"

const kelasUtama =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol min-[600px]:w-auto"

const kelasSekunder =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 border border-line-500 bg-putih px-4 text-body font-bold text-ink-900 hover:bg-olive-50 active:bg-olive-50 hover-tombol min-[600px]:w-auto"

export default function Halaman() {
  const [hasil, setHasil] = useState(undefined)

  useEffect(() => {
    try {
      setHasil(JSON.parse(sessionStorage.getItem(KUNCI_HASIL)))
    } catch {
      setHasil(null)
    }
  }, [])

  if (hasil === undefined) return null

  if (!hasil) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Tidak ada setoran yang baru disimpan</h1>
        <div className="mt-4 flex flex-col items-start gap-1">
          <Link href="/petugas/cari-nasabah" className={kelasTautan}>
            Cari nasabah
          </Link>
          <Link href="/petugas/setoran" className={kelasTautan}>
            Lihat daftar setoran
          </Link>
        </div>
      </main>
    )
  }

  const setoran = {
    ...hasil,
    petugas: { nama: ambilUser()?.nama ?? "Petugas" },
    status: "TERCATAT",
  }

  return (
    <main className="pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-bold text-forest-900">Setoran tersimpan</h1>
        <CapStatus status="TERCATAT" />
      </div>

      <div className="mt-6">
        <LembarSetoran setoran={setoran} />
      </div>

      <section
        aria-label="Saldo baru nasabah"
        className="mt-4 rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
      >
        <p className="text-body text-ink-700">Saldo baru {hasil.nasabah.nama}</p>
        <p className="mt-1 text-display font-bold tabular-nums">{formatRupiah(hasil.saldoBaru)}</p>
      </section>

      <div className="mt-5 flex flex-col gap-4 min-[600px]:flex-row">
        <Link
          href="/petugas/cari-nasabah"
          onClick={() => sessionStorage.removeItem(KUNCI_HASIL)}
          className={kelasUtama}
        >
          Catat setoran berikutnya
        </Link>
        <Link href={`/petugas/nasabah/${hasil.nasabahId}`} className={kelasSekunder}>
          Lihat riwayat nasabah
        </Link>
      </div>
    </main>
  )
}
