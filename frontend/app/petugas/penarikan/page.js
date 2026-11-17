"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Info, WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"
import { tampilkanToast } from "@/lib/toast"
import DialogProses from "@/components/DialogProses"
import DialogSelesai from "@/components/DialogSelesai"
import KartuPengajuan, { SkeletonPengajuan } from "@/components/KartuPengajuan"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import GrupPil from "@/components/GrupPil"
import Tombol from "@/components/Tombol"

const TAB = [
  { id: "diajukan", label: "Menunggu" },
  { id: "disetujui", label: "Disetujui" },
  { id: "ditolak", label: "Ditolak" },
  { id: "selesai", label: "Selesai" },
]

const KOSONG = {
  diajukan: "Tidak ada pengajuan yang menunggu",
  disetujui: "Tidak ada dana yang perlu diserahkan",
  ditolak: "Belum ada pengajuan yang ditolak",
  selesai: "Belum ada pengajuan yang selesai",
}

const KABAR = {
  setujui: "Pengajuan disetujui",
  tolak: "Pengajuan ditolak",
  selesai: "Ditandai selesai",
}

const PESAN_TERPUTUS = "Belum dipastikan tersimpan. Muat ulang daftar untuk memeriksa status pengajuan."
const PESAN_TIDAK_ADA = "Pengajuan tidak ditemukan"
const PESAN_ALASAN = "Alasan penolakan wajib diisi"

const LIMIT = 5

function alamat(status, halaman, limit) {
  const q = new URLSearchParams({ status, halaman: String(halaman), limit: String(limit) })
  return `/penarikan?${q}`
}

// Halaman
export default function Halaman() {
  const [aktif, setAktif] = useState("diajukan")
  const [halaman, setHalaman] = useState(1)
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [tampilSkeleton, setTampilSkeleton] = useState(false)
  const [lama, setLama] = useState(false)
  const [galat, setGalat] = useState(false)
  const [daftar, setDaftar] = useState(null)
  const [paginasi, setPaginasi] = useState(null)
  const [jumlah, setJumlah] = useState({})
  const [aksi, setAksi] = useState(null)
  const [mengirim, setMengirim] = useState(false)
  const [terkirim, setTerkirim] = useState(false)
  const [pesanDialog, setPesanDialog] = useState("")
  const [galatAkses, setGalatAkses] = useState("")
  const kunci = useRef(false)

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setTampilSkeleton(false)
    setLama(false)
    setPutaran((n) => n + 1)
  }, [])

  // Jumlah per tab
  useEffect(() => {
    const pembatal = new AbortController()
    Promise.allSettled(
      TAB.map((t) => api(alamat(t.id, 1, 1), { galatInline: true, signal: pembatal.signal }))
    ).then((hasil) => {
      if (pembatal.signal.aborted) return
      setJumlah((lalu) => {
        const baru = { ...lalu }
        hasil.forEach((h, i) => {
          if (h.status === "fulfilled") baru[TAB[i].id] = h.value?.paginasi?.total ?? 0
        })
        return baru
      })
    })
    return () => pembatal.abort()
  }, [putaran])

  // Daftar
  useEffect(() => {
    const pembatal = new AbortController()
    const waktuSkeleton = setTimeout(() => setTampilSkeleton(true), 300)
    const waktuLama = setTimeout(() => setLama(true), 10000)

    api(alamat(aktif, halaman, LIMIT), { galatInline: true, signal: pembatal.signal })
      .then((hasil) => {
        const total = hasil?.paginasi?.totalHalaman ?? 0
        if (halaman > 1 && halaman > total) {
          setHalaman(Math.max(1, total))
          return
        }
        setDaftar(hasil?.data ?? [])
        setPaginasi(hasil?.paginasi ?? null)
        setJumlah((lalu) => ({ ...lalu, [aktif]: hasil?.paginasi?.total ?? lalu[aktif] }))
        setGalat(false)
      })
      .catch(() => {
        if (!pembatal.signal.aborted) setGalat(true)
      })
      .finally(() => {
        if (pembatal.signal.aborted) return
        clearTimeout(waktuSkeleton)
        clearTimeout(waktuLama)
        setMemuat(false)
        setTampilSkeleton(false)
        setLama(false)
      })

    return () => {
      pembatal.abort()
      clearTimeout(waktuSkeleton)
      clearTimeout(waktuLama)
    }
  }, [aktif, halaman, putaran])

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

  // Aksi
  function buka(jenis, p) {
    if (kunci.current) return
    setAksi({ jenis, pengajuan: p, namaPetugas: ambilUser()?.nama || "" })
    setTerkirim(false)
    setPesanDialog("")
    setGalatAkses("")
  }

  function tutup() {
    if (kunci.current) return
    setAksi(null)
    setPesanDialog("")
  }

  async function konfirmasi(isian) {
    if (kunci.current || terkirim || !aksi) return
    const { jenis, pengajuan } = aksi
    if (jenis === "tolak" && !isian.alasan) {
      setPesanDialog(PESAN_ALASAN)
      return
    }

    kunci.current = true
    setMengirim(true)
    setTerkirim(true)
    setPesanDialog("")

    const jalur =
      jenis === "selesai" ? `/penarikan/${pengajuan._id}/selesai` : `/penarikan/${pengajuan._id}/proses`
    const body =
      jenis === "selesai"
        ? { catatan: isian.catatan }
        : { keputusan: jenis === "setujui" ? "setuju" : "tolak", catatan: isian.alasan }

    try {
      await api(jalur, { method: "PATCH", body, galatInline: true, aksesInline: true })
      kunci.current = false
      setAksi(null)
      tampilkanToast(KABAR[jenis])
    } catch (err) {
      kunci.current = false
      if (err?.status === 403) {
        setAksi(null)
        setGalatAkses(err.message || "Anda tidak berhak memproses pengajuan ini")
      } else if (err?.status === 404) {
        setPesanDialog(PESAN_TIDAK_ADA)
      } else if (err?.status === 400 || err?.status === 409) {
        setPesanDialog(err.message)
      } else {
        setPesanDialog(PESAN_TERPUTUS)
      }
    } finally {
      setMengirim(false)
      muatUlang()
    }
  }

  const tab = TAB.map((t) => ({ ...t, jumlah: jumlah[t.id] ?? "-" }))

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Penarikan</h1>

      <div className="mt-4 flex flex-col gap-4 empty:hidden">
        {galatAkses && <PesanInline varian="galat" ikon={WarningOctagon} isi={galatAkses} />}
        {memuat && lama && (
          <PesanInline varian="info" ikon={Info} isi="Memuat lebih lama dari biasanya">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        )}
      </div>

      <div className="mt-6">
        <GrupPil pilihan={tab} aktif={aktif} onUbah={gantiTab} label="Status penarikan" sebagaiTab />
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
          memuat && tampilSkeleton && <SkeletonPengajuan />
        ) : daftar.length === 0 ? (
          <h2 className="text-h3 font-bold">{KOSONG[aktif]}</h2>
        ) : (
          <div>
            <ul className="flex flex-col gap-3">
              {daftar.map((p) => (
                <KartuPengajuan key={p._id} pengajuan={p} onAksi={buka} />
              ))}
            </ul>
            {paginasi && (
              <Paginasi halaman={paginasi.halaman} totalHalaman={paginasi.totalHalaman} onUbah={gantiHalaman} />
            )}
          </div>
        )}
      </div>

      {aksi && (aksi.jenis === "setujui" || aksi.jenis === "tolak") && (
        <DialogProses
          pengajuan={aksi.pengajuan}
          mode={aksi.jenis}
          namaPetugas={aksi.namaPetugas}
          memproses={mengirim}
          terkirim={terkirim}
          pesan={pesanDialog}
          onKonfirmasi={konfirmasi}
          onTutup={tutup}
        />
      )}
      {aksi && aksi.jenis === "selesai" && (
        <DialogSelesai
          pengajuan={aksi.pengajuan}
          namaPetugas={aksi.namaPetugas}
          memproses={mengirim}
          terkirim={terkirim}
          pesan={pesanDialog}
          onKonfirmasi={konfirmasi}
          onTutup={tutup}
        />
      )}
    </main>
  )
}
