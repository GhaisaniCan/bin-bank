"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"
import { ambilUser } from "@/lib/auth"
import { formatRupiah } from "@/lib/format"

const KUNCI_DRAF = "binbank_draf_setoran"
const KUNCI_HASIL = "binbank_hasil_setoran"

function petakan(hasil) {
  const data = hasil?.setoran
  if (!data?._id || !Array.isArray(data.rincian) || !Number.isFinite(hasil.saldoTerkini)) return null
  return {
    nasabahId: String(data.nasabah?._id ?? data.nasabah ?? ""),
    saldoTerkini: hasil.saldoTerkini,
    setoran: {
      nasabah: { nama: data.nasabah?.nama ?? "", email: hasil.emailNasabah ?? "" },
      petugas: { nama: data.petugas?.nama ?? ambilUser()?.nama ?? "" },
      tanggal: data.tanggal,
      rincian: data.rincian.map((r) => ({
        nama: r.namaSampah,
        harga: r.hargaPerKg,
        berat: r.berat,
        subtotal: r.subtotal,
      })),
      totalBerat: data.totalBerat,
      totalNilai: data.totalNilai,
      status: data.status,
    },
  }
}

const kelasUtama =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol min-[600px]:w-auto"

const kelasSekunder =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 border border-line-500 bg-putih px-4 text-body font-bold text-ink-900 hover:bg-olive-50 active:bg-olive-50 hover-tombol min-[600px]:w-auto"

function tanpaLangganan() {
  return () => {}
}

function hasilSesi() {
  try {
    return sessionStorage.getItem(KUNCI_HASIL)
  } catch {
    return null
  }
}

function hasilServer() {
  return undefined
}

export default function Halaman() {
  const router = useRouter()
  const mentah = useSyncExternalStore(tanpaLangganan, hasilSesi, hasilServer)
  const hasil = useMemo(() => {
    if (mentah === undefined) return undefined
    try {
      return petakan(JSON.parse(mentah))
    } catch {
      return null
    }
  }, [mentah])

  // Bersihkan draf
  useEffect(() => {
    if (hasil === undefined) return
    try {
      sessionStorage.removeItem(KUNCI_DRAF)
    } catch {}
    if (!hasil) router.replace("/petugas/setoran/baru")
  }, [hasil, router])

  if (!hasil) return null

  const { setoran } = hasil

  return (
    <main className="pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-bold text-forest-900">Setoran tersimpan</h1>
        <CapStatus status={setoran.status ?? "TERCATAT"} />
      </div>

      <div className="mt-6">
        <LembarSetoran setoran={setoran} />
      </div>

      <section
        aria-label="Saldo baru nasabah"
        className="mt-4 rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
      >
        <p className="text-body text-ink-700">Saldo baru {setoran.nasabah.nama}</p>
        <p className="mt-1 text-display font-bold tabular-nums">{formatRupiah(hasil.saldoTerkini)}</p>
      </section>

      <div className="mt-5 flex flex-col gap-4 min-[600px]:flex-row">
        <Link
          href="/petugas/setoran/baru"
          onClick={() => sessionStorage.removeItem(KUNCI_HASIL)}
          className={kelasUtama}
        >
          Catat setoran berikutnya
        </Link>
        <Link href={`/petugas/nasabah/${encodeURIComponent(hasil.nasabahId)}`} className={kelasSekunder}>
          Lihat riwayat nasabah
        </Link>
      </div>
    </main>
  )
}
