"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, Info, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { useDaring } from "@/lib/koneksi"
import { formatJam } from "@/lib/format"
import TabelMutasi, { SkeletonMutasi } from "@/components/TabelMutasi"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

const LIMIT = 20

// Halaman
export default function Halaman() {
  const daring = useDaring()
  const [halaman, setHalaman] = useState(1)
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [tampilSkeleton, setTampilSkeleton] = useState(false)
  const [lama, setLama] = useState(false)
  const [galat, setGalat] = useState(false)
  const [kembali, setKembali] = useState(false)
  const [dimuatPada, setDimuatPada] = useState(null)
  const [daftar, setDaftar] = useState(null)
  const [paginasi, setPaginasi] = useState(null)

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
  }, [])

  // Daftar
  useEffect(() => {
    let aktif = true
    const waktuSkeleton = setTimeout(() => setTampilSkeleton(true), 300)
    const waktuLama = setTimeout(() => setLama(true), 10000)

    api(`/penarikan/riwayat?halaman=${halaman}&limit=${LIMIT}`, { galatInline: true })
      .then((hasil) => {
        if (!aktif) return
        setDaftar(hasil.data ?? [])
        setPaginasi(hasil.paginasi ?? null)
        setGalat(false)
        setDimuatPada(new Date())
      })
      .catch(() => {
        if (aktif) setGalat(true)
      })
      .finally(() => {
        if (!aktif) return
        clearTimeout(waktuSkeleton)
        clearTimeout(waktuLama)
        setMemuat(false)
        setTampilSkeleton(false)
        setLama(false)
      })

    return () => {
      aktif = false
      clearTimeout(waktuSkeleton)
      clearTimeout(waktuLama)
    }
  }, [halaman, putaran])

  // Koneksi
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

  function gantiHalaman(ke) {
    setHalaman(ke)
    setGalat(false)
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <main className="pb-6">
      <h1 id="judul-riwayat" className="text-h1 font-bold text-forest-900">
        Riwayat
      </h1>

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

      <div aria-busy={memuat || undefined} className="mt-6 flex flex-col gap-4">
        {galat && !memuat && (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        )}

        {daftar == null ? (
          memuat && tampilSkeleton && <SkeletonMutasi />
        ) : daftar.length === 0 ? (
          <div>
            <h2 className="text-h3 font-bold">Belum ada mutasi</h2>
            <p className="mt-2 text-body text-ink-700">Setoran akan muncul di sini setelah petugas mencatatnya.</p>
          </div>
        ) : (
          <div>
            <TabelMutasi baris={daftar} labelId="judul-riwayat" tautanTebal />
            {paginasi && (
              <Paginasi
                halaman={paginasi.halaman}
                totalHalaman={paginasi.totalHalaman}
                onUbah={gantiHalaman}
                nonaktif={memuat || !daring}
              />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
