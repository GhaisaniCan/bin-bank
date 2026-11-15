"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CaretRight, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"
import { formatRupiah, formatTanggal } from "@/lib/format"
import { useDaring } from "@/lib/koneksi"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

function hariIniWib() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())
}

function formatBerat(kg) {
  return `${(Number(kg) || 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
}

// Baris angka
function BarisAngka({ href, label, angka, keterangan }) {
  return (
    <li className="border-b border-line-300">
      <Link href={href} className="flex min-h-8 items-center justify-between gap-3 px-1 py-3 hover:bg-olive-50">
        <span className="min-w-0">
          <span className="block text-body">{label}</span>
          {keterangan && <span className="block text-small text-ink-700">{keterangan}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-amount font-bold tabular-nums">{angka}</span>
          <CaretRight size={20} weight="regular" aria-hidden="true" className="text-ink-700" />
        </span>
      </Link>
    </li>
  )
}

export default function Halaman() {
  const daring = useDaring()
  const nama = ambilUser()?.nama ?? ""
  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [lambat, setLambat] = useState(false)
  const [galat, setGalat] = useState(null)

  const ambil = useCallback(() => {
    const t = setTimeout(() => setLambat(true), 300)
    const hari = hariIniWib()
    return Promise.all([
      api("/laporan", { galatInline: true }),
      api(`/laporan?dari=${hari}&sampai=${hari}`, { galatInline: true }),
    ])
      .then(([semua, hariIni]) => {
        const menunggu = semua.data.penarikanPerStatus.find((p) => p.status === "diajukan")
        setData({
          hari,
          saldo: semua.data.saldo,
          menunggu: menunggu ?? { totalTransaksi: 0, totalNominal: 0 },
          setoranHariIni: hariIni.data.setoran,
        })
        setGalat(null)
      })
      .catch(() => setGalat("Data belum bisa dimuat"))
      .finally(() => {
        clearTimeout(t)
        setMemuat(false)
        setLambat(false)
      })
  }, [])

  const muat = useCallback(() => {
    setMemuat(true)
    setGalat(null)
    ambil()
  }, [ambil])

  useEffect(() => {
    ambil()
  }, [ambil])

  useEffect(() => {
    window.addEventListener("online", muat)
    return () => window.removeEventListener("online", muat)
  }, [muat])

  return (
    <main className="max-w-[720px] pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Beranda</h1>
      {nama && <p className="mt-2 text-small text-olive-700">{nama}</p>}

      {!daring && (
        <PesanInline
          varian="peringatan"
          ikon={WifiSlash}
          isi="Tidak ada koneksi. Angka di layar adalah data terakhir yang dimuat."
          className="mt-4"
        />
      )}

      {galat && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi={galat} className="mt-4">
          <Tombol varian="sekunder" disabled={!daring} onClick={muat}>
            Coba lagi
          </Tombol>
        </PesanInline>
      )}

      {data === null && memuat && lambat && (
        <div aria-busy="true" className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 rounded-1 bg-olive-50" />
          ))}
        </div>
      )}

      {data && (
        <section aria-labelledby="judul-ringkasan" aria-busy={memuat || undefined} className="mt-6">
          <h2 id="judul-ringkasan" className="text-h2 font-bold">
            Ringkasan
          </h2>
          <ul className="mt-2 border-t border-line-300">
            <BarisAngka
              href="/admin/laporan?tab=penarikan"
              label="Total saldo seluruh nasabah"
              keterangan={`${data.saldo.totalNasabah.toLocaleString("id-ID")} nasabah`}
              angka={formatRupiah(data.saldo.totalUangMengendap)}
            />
            <BarisAngka
              href="/petugas/penarikan"
              label="Pengajuan menunggu"
              keterangan={
                data.menunggu.totalTransaksi > 0 ? `Total ${formatRupiah(data.menunggu.totalNominal)}` : "Tidak ada yang menunggu"
              }
              angka={data.menunggu.totalTransaksi.toLocaleString("id-ID")}
            />
            <BarisAngka
              href="/petugas/setoran"
              label="Setoran hari ini"
              keterangan={`${formatTanggal(`${data.hari}T00:00:00+07:00`)}, ${formatBerat(
                data.setoranHariIni.totalBerat
              )}, ${formatRupiah(data.setoranHariIni.totalNilai)}`}
              angka={data.setoranHariIni.totalTransaksi.toLocaleString("id-ID")}
            />
          </ul>
          <p className="mt-3 text-small text-ink-700">Setoran yang dibatalkan tidak dihitung.</p>
        </section>
      )}
    </main>
  )
}
