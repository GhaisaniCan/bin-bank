"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Info, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"
import { useDaring } from "@/lib/koneksi"
import { formatJam, formatRupiah, formatTanggal } from "@/lib/format"
import LembarSaldo, { SkeletonLembarSaldo } from "@/components/LembarSaldo"
import TabelMutasi, { SkeletonMutasi } from "@/components/TabelMutasi"
import CapStatus from "@/components/CapStatus"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

const AWAL = { data: null, galat: false }
const kelasTautan = "inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"

function hasilBagian(hasil, ambil) {
  return (lalu) =>
    hasil.status === "fulfilled" ? { data: ambil(hasil.value), galat: false } : { data: lalu.data, galat: true }
}

// Galat bagian
function GalatMuat({ onCobaLagi }) {
  return (
    <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat">
      <Tombol varian="sekunder" onClick={onCobaLagi}>
        Coba lagi
      </Tombol>
    </PesanInline>
  )
}

// Pengajuan terakhir
function PengajuanTerakhir({ pengajuan }) {
  return (
    <section aria-labelledby="judul-pengajuan">
      <h2 id="judul-pengajuan" className="text-small font-bold text-ink-700">
        Pengajuan terakhir
      </h2>
      <div className="mt-2 flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2 border-y border-line-300 py-2">
        <span className="text-small text-ink-700">{formatTanggal(pengajuan.createdAt)}</span>
        <span className="text-amount font-bold tabular-nums">{formatRupiah(pengajuan.jumlah)}</span>
        <CapStatus status={pengajuan.status} />
        <Link href="/nasabah/pengajuan" className={`${kelasTautan} ml-auto`}>
          Semua pengajuan
        </Link>
      </div>
    </section>
  )
}

// Halaman
export default function Halaman() {
  const daring = useDaring()
  const [nama, setNama] = useState("")
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [tampilSkeleton, setTampilSkeleton] = useState(false)
  const [lama, setLama] = useState(false)
  const [kembali, setKembali] = useState(false)
  const [dimuatPada, setDimuatPada] = useState(null)
  const [saldo, setSaldo] = useState(AWAL)
  const [pengajuan, setPengajuan] = useState(AWAL)
  const [mutasi, setMutasi] = useState(AWAL)

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
  }, [])

  useEffect(() => {
    setNama(ambilUser()?.nama ?? "")
  }, [])

  useEffect(() => {
    let aktif = true
    const waktuSkeleton = setTimeout(() => setTampilSkeleton(true), 300)
    const waktuLama = setTimeout(() => setLama(true), 10000)

    Promise.allSettled([
      api("/penarikan/saldo", { galatInline: true }),
      api("/penarikan/saya?limit=1", { galatInline: true }),
      api("/penarikan/riwayat?halaman=1&limit=5", { galatInline: true }),
    ]).then(([hasilSaldo, hasilPengajuan, hasilMutasi]) => {
      if (!aktif) return
      clearTimeout(waktuSkeleton)
      clearTimeout(waktuLama)
      setSaldo(hasilBagian(hasilSaldo, (r) => r.data))
      setPengajuan(hasilBagian(hasilPengajuan, (r) => r.data?.[0] ?? null))
      setMutasi(hasilBagian(hasilMutasi, (r) => r.data ?? []))
      if ([hasilSaldo, hasilPengajuan, hasilMutasi].some((h) => h.status === "fulfilled")) setDimuatPada(new Date())
      setMemuat(false)
      setTampilSkeleton(false)
      setLama(false)
    })

    return () => {
      aktif = false
      clearTimeout(waktuSkeleton)
      clearTimeout(waktuLama)
    }
  }, [putaran])

  useEffect(() => {
    let waktu
    function saatDaring() {
      clearTimeout(waktu)
      setKembali(true)
      muatUlang()
      waktu = setTimeout(() => setKembali(false), 5000)
    }
    function saatLuring() {
      clearTimeout(waktu)
      setKembali(false)
    }
    window.addEventListener("online", saatDaring)
    window.addEventListener("offline", saatLuring)
    return () => {
      clearTimeout(waktu)
      window.removeEventListener("online", saatDaring)
      window.removeEventListener("offline", saatLuring)
    }
  }, [muatUlang])

  const skeleton = memuat && tampilSkeleton

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Beranda</h1>
      {nama && <p className="mt-2 text-small text-olive-700">{nama}</p>}

      <div className="mt-4 flex flex-col gap-4 empty:hidden">
        {!daring && (
          <PesanInline varian="peringatan" ikon={WifiSlash} isi="Tidak ada koneksi. Angka di layar bisa sudah berubah.">
            {dimuatPada && <p className="text-small text-ink-700">Dimuat pukul {formatJam(dimuatPada)}</p>}
          </PesanInline>
        )}
        {daring && kembali && <PesanInline varian="berhasil" ikon={CheckCircle} isi="Koneksi kembali" />}
        {memuat && lama && (
          <PesanInline varian="info" ikon={Info} isi="Memuat lebih lama dari biasanya">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        )}
      </div>

      <div aria-busy={memuat || undefined} className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          {saldo.data == null && memuat ? (
            skeleton && <SkeletonLembarSaldo />
          ) : (
            <LembarSaldo data={saldo.data} galat={saldo.galat && !memuat} onCobaLagi={muatUlang} />
          )}
          {!pengajuan.galat && pengajuan.data && <PengajuanTerakhir pengajuan={pengajuan.data} />}
        </div>

        <section aria-labelledby="judul-mutasi" className="lg:col-span-7">
          <h2 id="judul-mutasi" className="text-h2 font-bold">
            Mutasi terbaru
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {mutasi.galat && !memuat && <GalatMuat onCobaLagi={muatUlang} />}
            {mutasi.data == null ? (
              skeleton && <SkeletonMutasi />
            ) : mutasi.data.length === 0 ? (
              <div>
                <h3 className="text-h3 font-bold">Belum ada mutasi</h3>
                <p className="mt-2 text-body text-ink-700">Setoran akan muncul di sini setelah petugas mencatatnya.</p>
              </div>
            ) : (
              <div>
                <TabelMutasi baris={mutasi.data} labelId="judul-mutasi" />
                <Link href="/nasabah/riwayat" className={`${kelasTautan} mt-2`}>
                  Lihat semua riwayat
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
