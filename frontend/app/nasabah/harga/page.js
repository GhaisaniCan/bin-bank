"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { CheckCircle, Info, Recycle, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { useDaring } from "@/lib/koneksi"
import { formatJam, formatRupiah } from "@/lib/format"
import { gambarSampah, kelompokSampah } from "@/lib/gambarSampah"
import FilterChip from "@/components/FilterChip"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

const KELOMPOK = [
  { id: "semua", label: "Semua" },
  { id: "plastik", label: "Plastik" },
  { id: "kertas", label: "Kertas" },
  { id: "besi", label: "Besi" },
  { id: "lainnya", label: "Lainnya" },
]

function siapkan(data) {
  return data
    .filter((j) => j.aktif !== false)
    .map((j) => ({
      id: j._id,
      nama: j.nama,
      harga: `${formatRupiah(j.hargaPerKg)}/kg`,
      gambar: gambarSampah(j.nama),
      kelompok: kelompokSampah(j.nama),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
}

const KELAS_GRID = "grid grid-cols-2 gap-x-4 gap-y-8 pt-7 sm:grid-cols-3 lg:grid-cols-4"
const KELAS_KARTU = "flex flex-col items-center rounded-2 bg-olive-50 p-4 text-center"
const KELAS_GAMBAR = "-mt-8 flex size-[96px] shrink-0 items-center justify-center"

// Skeleton
function SkeletonHarga() {
  return (
    <ul aria-hidden="true" className={KELAS_GRID}>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={KELAS_KARTU}>
          <div className={`${KELAS_GAMBAR} rounded-2 bg-line-300`} />
          <div className="mt-3 h-4 w-3/4 rounded-1 bg-line-300" />
          <div className="mt-3 h-4 w-1/2 rounded-1 bg-line-300" />
        </li>
      ))}
    </ul>
  )
}

// Kartu harga
function KartuHarga({ jenis }) {
  return (
    <li className={KELAS_KARTU}>
      <div className={KELAS_GAMBAR}>
        {jenis.gambar ? (
          <Image src={jenis.gambar} alt="" width={96} height={96} sizes="96px" className="size-full object-contain" />
        ) : (
          <Recycle size={96} weight="regular" aria-hidden="true" className="text-ink-700" />
        )}
      </div>
      <p className="mt-3 break-words text-body font-bold text-ink-900">{jenis.nama}</p>
      <span aria-hidden="true" className="mt-2 w-[40px] border-t-2 border-olive-700" />
      <p className="mt-2 break-words text-amount font-bold tabular-nums text-forest-900">{jenis.harga}</p>
    </li>
  )
}

// Halaman
export default function Halaman() {
  const daring = useDaring()
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [tampilSkeleton, setTampilSkeleton] = useState(false)
  const [lama, setLama] = useState(false)
  const [galat, setGalat] = useState(false)
  const [kembali, setKembali] = useState(false)
  const [dimuatPada, setDimuatPada] = useState(null)
  const [daftar, setDaftar] = useState(null)
  const [kelompok, setKelompok] = useState("semua")

  const adaData = daftar?.length > 0
  const tersaring = useMemo(
    () => (daftar ?? []).filter((j) => kelompok === "semua" || j.kelompok === kelompok),
    [daftar, kelompok]
  )

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

    api("/jenis-sampah", { galatInline: true })
      .then((hasil) => {
        if (!aktif) return
        setDaftar(siapkan(hasil.data ?? []))
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
  }, [putaran])

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

  return (
    <main className="pb-6">
      <h1 id="judul-harga" className="text-h1 font-bold text-forest-900">
        Harga
      </h1>
      <p className="mt-1 text-small text-ink-700">Harga per kg yang berlaku untuk setoran berikutnya</p>

      {adaData && (
        <div className="mt-2">
          <FilterChip pilihan={KELOMPOK} aktif={kelompok} onUbah={setKelompok} label="Kelompok sampah" />
        </div>
      )}

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
          memuat && tampilSkeleton && <SkeletonHarga />
        ) : daftar.length === 0 ? (
          <div>
            <h2 className="text-h3 font-bold">Belum ada harga</h2>
            <p className="mt-2 text-body text-ink-700">Harga akan muncul di sini setelah admin menambahkan jenis sampah.</p>
          </div>
        ) : tersaring.length === 0 ? (
          <h2 className="text-h3 font-bold">Belum ada harga untuk kelompok ini</h2>
        ) : (
          <ul aria-labelledby="judul-harga" className={KELAS_GRID}>
            {tersaring.map((j) => (
              <KartuHarga key={j.id} jenis={j} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
