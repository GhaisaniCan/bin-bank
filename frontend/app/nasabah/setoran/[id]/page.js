"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, Info, Prohibit, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"
import { useDaring } from "@/lib/koneksi"
import { formatJam, formatTanggal } from "@/lib/format"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import TautanArah from "@/components/TautanArah"

const STATUS_TIDAK_DITEMUKAN = [400, 403, 404]

function petakan(data, user) {
  return {
    nasabah: { nama: data.nasabah?.nama ?? user?.nama ?? "", email: user?.email ?? "" },
    petugas: { nama: data.petugas?.nama ?? "" },
    tanggal: data.tanggal,
    rincian: (data.rincian ?? []).map((r) => ({
      nama: r.namaSampah,
      berat: r.berat,
      harga: r.hargaPerKg,
      subtotal: r.subtotal,
    })),
    totalBerat: data.totalBerat,
    totalNilai: data.totalNilai,
    status: data.status,
    alasanBatal: data.alasanBatal ?? "",
    dibatalkanPada: data.dibatalkanPada ?? null,
  }
}

// Skeleton
function SkeletonLembar() {
  return (
    <div aria-hidden="true" className="rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5">
      <div className="grid gap-4 min-[600px]:grid-cols-3">
        <div className="h-7 rounded-1 bg-olive-50" />
        <div className="h-7 rounded-1 bg-olive-50" />
        <div className="h-7 rounded-1 bg-olive-50" />
      </div>
      <div className="mt-6 h-5 w-1/3 rounded-1 bg-olive-50" />
      <div className="mt-3 h-5 w-full rounded-1 bg-olive-50" />
      <div className="mt-2 h-5 w-full rounded-1 bg-olive-50" />
      <div className="mt-6 h-7 w-1/2 rounded-1 bg-olive-50 min-[600px]:ml-auto min-[600px]:w-1/3" />
    </div>
  )
}

// Halaman
export default function Halaman() {
  const { id } = useParams()
  const daring = useDaring()
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [tampilSkeleton, setTampilSkeleton] = useState(false)
  const [lama, setLama] = useState(false)
  const [galat, setGalat] = useState(false)
  const [tidakDitemukan, setTidakDitemukan] = useState(false)
  const [kembali, setKembali] = useState(false)
  const [dimuatPada, setDimuatPada] = useState(null)
  const [setoran, setSetoran] = useState(null)

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
  }, [])

  // Rincian
  useEffect(() => {
    setSetoran(null)
    setTidakDitemukan(false)
    setGalat(false)
  }, [id])

  useEffect(() => {
    let aktif = true
    const waktuSkeleton = setTimeout(() => setTampilSkeleton(true), 300)
    const waktuLama = setTimeout(() => setLama(true), 10000)

    api(`/setoran/${encodeURIComponent(id)}`, { galatInline: true, aksesInline: true })
      .then((hasil) => {
        if (!aktif) return
        if (!hasil?.data) {
          setTidakDitemukan(true)
          return
        }
        setSetoran(petakan(hasil.data, ambilUser()))
        setGalat(false)
        setTidakDitemukan(false)
        setDimuatPada(new Date())
      })
      .catch((err) => {
        if (!aktif) return
        if (STATUS_TIDAK_DITEMUKAN.includes(err.status) && !err.data?.wajibGantiPassword) setTidakDitemukan(true)
        else setGalat(true)
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
  }, [id, putaran])

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

  const tautanKembali = (
    <TautanArah href="/nasabah/riwayat" kembali>
      Kembali ke riwayat
    </TautanArah>
  )

  if (tidakDitemukan && !setoran) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Setoran tidak ditemukan</h1>
        <p className="mt-2 text-body text-ink-700">Setoran ini tidak ada atau bukan milik akun Anda.</p>
        <div className="mt-4">{tautanKembali}</div>
      </main>
    )
  }

  return (
    <main className="pb-6">
      {tautanKembali}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-bold text-forest-900">Rincian setoran</h1>
        {setoran && <CapStatus status={setoran.status} />}
      </div>

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

        {setoran?.status === "DIBATALKAN" && (
          <PesanInline varian="galat" ikon={Prohibit} isi="Setoran ini dibatalkan">
            {setoran.alasanBatal && <p className="text-body text-ink-900">Alasan: {setoran.alasanBatal}</p>}
            {setoran.dibatalkanPada && (
              <p className="text-small text-ink-700">
                Dibatalkan pada {formatTanggal(setoran.dibatalkanPada)}, {formatJam(setoran.dibatalkanPada)}
              </p>
            )}
          </PesanInline>
        )}

        {setoran ? <LembarSetoran setoran={setoran} /> : memuat && tampilSkeleton && <SkeletonLembar />}
      </div>
    </main>
  )
}
