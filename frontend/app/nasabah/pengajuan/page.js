"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, Info, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { useDaring } from "@/lib/koneksi"
import { formatJam } from "@/lib/format"
import KartuPengajuanSaya, { SkeletonPengajuanSaya } from "@/components/KartuPengajuanSaya"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import TabStatus from "@/components/TabStatus"
import Tombol from "@/components/Tombol"
import TautanArah from "@/components/TautanArah"

const TAB = [
  { id: "semua", label: "Semua" },
  { id: "diajukan", label: "Menunggu" },
  { id: "disetujui", label: "Disetujui" },
  { id: "ditolak", label: "Ditolak" },
  { id: "selesai", label: "Selesai" },
]

const KOSONG = {
  semua: "Belum ada pengajuan",
  diajukan: "Tidak ada pengajuan yang menunggu",
  disetujui: "Tidak ada pengajuan yang disetujui",
  ditolak: "Tidak ada pengajuan yang ditolak",
  selesai: "Belum ada pengajuan yang selesai",
}

const LIMIT = 10

function alamat(status, halaman, limit) {
  const q = new URLSearchParams({ halaman: String(halaman), limit: String(limit) })
  if (status !== "semua") q.set("status", status)
  return `/penarikan/saya?${q}`
}

// Halaman
export default function Halaman() {
  const daring = useDaring()
  const [aktif, setAktif] = useState("semua")
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
  const [jumlah, setJumlah] = useState({})

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
  }, [])

  // Jumlah per tab
  useEffect(() => {
    let aktifEfek = true
    Promise.allSettled(TAB.map((t) => api(alamat(t.id, 1, 1), { galatInline: true }))).then((hasil) => {
      if (!aktifEfek) return
      setJumlah((lalu) => {
        const baru = { ...lalu }
        hasil.forEach((h, i) => {
          if (h.status === "fulfilled") baru[TAB[i].id] = h.value.paginasi?.total ?? 0
        })
        return baru
      })
    })
    return () => {
      aktifEfek = false
    }
  }, [putaran])

  // Daftar
  useEffect(() => {
    let aktifEfek = true
    const waktuSkeleton = setTimeout(() => setTampilSkeleton(true), 300)
    const waktuLama = setTimeout(() => setLama(true), 10000)

    api(alamat(aktif, halaman, LIMIT), { galatInline: true })
      .then((hasil) => {
        if (!aktifEfek) return
        setDaftar(hasil.data ?? [])
        setPaginasi(hasil.paginasi ?? null)
        setJumlah((lalu) => ({ ...lalu, [aktif]: hasil.paginasi?.total ?? lalu[aktif] }))
        setGalat(false)
        setDimuatPada(new Date())
      })
      .catch(() => {
        if (aktifEfek) setGalat(true)
      })
      .finally(() => {
        if (!aktifEfek) return
        clearTimeout(waktuSkeleton)
        clearTimeout(waktuLama)
        setMemuat(false)
        setTampilSkeleton(false)
        setLama(false)
      })

    return () => {
      aktifEfek = false
      clearTimeout(waktuSkeleton)
      clearTimeout(waktuLama)
    }
  }, [aktif, halaman, putaran])

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

  function gantiTab(id) {
    if (id === aktif) return
    setAktif(id)
    setHalaman(1)
    setDaftar(null)
    setPaginasi(null)
    setGalat(false)
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
  }

  function gantiHalaman(ke) {
    setHalaman(ke)
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
  }

  const tab = TAB.map((t) => ({ ...t, jumlah: jumlah[t.id] ?? "-" }))

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Pengajuan saya</h1>

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

      <div className="mt-6">
        <TabStatus tab={tab} aktif={aktif} onUbah={gantiTab} />
      </div>

      <div
        id="panel-status"
        role="tabpanel"
        aria-labelledby={`tab-${aktif}`}
        aria-busy={memuat || undefined}
        className="mt-4 flex flex-col gap-4"
      >
        {galat && !memuat && (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        )}

        {daftar == null ? (
          memuat && tampilSkeleton && <SkeletonPengajuanSaya />
        ) : daftar.length === 0 ? (
          <div>
            <h2 className="text-h3 font-bold">{KOSONG[aktif]}</h2>
            {aktif === "semua" && (
              <>
                <p className="mt-2 text-body text-ink-700">Pengajuan penarikan akan muncul di sini setelah Anda mengajukannya.</p>
                <TautanArah href="/nasabah/tarik-saldo" className="mt-2">
                  Tarik saldo
                </TautanArah>
              </>
            )}
          </div>
        ) : (
          <div>
            <ul className="border-t border-line-500">
              {daftar.map((p) => (
                <KartuPengajuanSaya key={p._id} pengajuan={p} />
              ))}
            </ul>
            {paginasi && (
              <Paginasi halaman={paginasi.halaman} totalHalaman={paginasi.totalHalaman} onUbah={gantiHalaman} />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
