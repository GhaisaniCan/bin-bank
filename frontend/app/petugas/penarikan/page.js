"use client"

import { useState } from "react"
import { CheckCircle } from "@phosphor-icons/react"
import DialogProses from "@/components/DialogProses"
import DialogSelesai from "@/components/DialogSelesai"
import KartuPengajuan from "@/components/KartuPengajuan"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import TabStatus from "@/components/TabStatus"

const NAMA = ["Sari Wulandari", "Budi Santoso", "Sari Dewi", "Joko Prasetyo"]
const PETUGAS = { nama: "Petugas Contoh" }

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

function buat(n, status, metode) {
  const ewallet = metode === "e-wallet"
  const diproses = status !== "diajukan"
  const selesai = status === "selesai"
  return {
    _id: `p${n}`,
    nasabah: { nama: NAMA[n % 4] },
    jumlah: 20000 + n * 5000,
    saldoNasabah: n === 1 ? 10000 : 128500,
    metode,
    namaEwallet: ewallet ? "DANA" : "",
    nomorEwallet: ewallet ? `08123456${1000 + n}` : "",
    status,
    createdAt: new Date(2026, 10, 14 - n, 9).toISOString(),
    diprosesOleh: diproses ? PETUGAS : null,
    diprosesPada: diproses ? new Date(2026, 10, 14 - n, 15).toISOString() : null,
    dikonfirmasiOleh: selesai ? PETUGAS : null,
    dikonfirmasiPada: selesai ? new Date(2026, 10, 15 - n, 10).toISOString() : null,
    catatanKonfirmasi: selesai && ewallet ? "Ref transfer 88231" : "",
    catatan: status === "ditolak" ? "Nominal tidak sesuai dengan saldo" : "",
  }
}

const URUTAN = [
  ...Array(7).fill("diajukan"),
  ...Array(3).fill("disetujui"),
  ...Array(2).fill("ditolak"),
  ...Array(2).fill("selesai"),
]

const DATA_AWAL = URUTAN.map((status, i) => buat(i + 1, status, i % 2 === 0 ? "tunai" : "e-wallet"))

const PER_HALAMAN = 5

export default function Halaman() {
  const [data, setData] = useState(DATA_AWAL)
  const [aktif, setAktif] = useState("diajukan")
  const [halaman, setHalaman] = useState(1)
  const [aksi, setAksi] = useState(null)
  const [kabar, setKabar] = useState("")

  const tab = TAB.map((t) => ({ ...t, jumlah: data.filter((p) => p.status === t.id).length }))
  const hasil = data.filter((p) => p.status === aktif)
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN))
  const halamanAman = Math.min(halaman, totalHalaman)
  const tampil = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN)
  const terpilih = aksi ? data.find((p) => p._id === aksi.id) : null

  function ganti(id) {
    setAktif(id)
    setHalaman(1)
  }

  function buka(jenis, p) {
    setAksi({ jenis, id: p._id })
  }

  function selesaiAksi(hasilIsian) {
    const sekarang = new Date().toISOString()
    const { jenis, id } = aksi
    setData((lama) =>
      lama.map((d) => {
        if (d._id !== id) return d
        if (jenis === "setujui") {
          return {
            ...d,
            status: "disetujui",
            diprosesOleh: PETUGAS,
            diprosesPada: sekarang,
            saldoNasabah: d.saldoNasabah - d.jumlah,
          }
        }
        if (jenis === "tolak") {
          return { ...d, status: "ditolak", diprosesOleh: PETUGAS, diprosesPada: sekarang, catatan: hasilIsian.alasan }
        }
        return {
          ...d,
          status: "selesai",
          dikonfirmasiOleh: PETUGAS,
          dikonfirmasiPada: sekarang,
          catatanKonfirmasi: hasilIsian.catatan,
        }
      })
    )
    setKabar(KABAR[jenis])
    setAksi(null)
    setTimeout(() => setKabar(""), 8000)
  }

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Penarikan</h1>

      {kabar && <PesanInline varian="berhasil" ikon={CheckCircle} isi={kabar} className="mt-4" />}

      <div className="mt-6">
        <TabStatus tab={tab} aktif={aktif} onUbah={ganti} />
      </div>

      <div id="panel-status" role="tabpanel" aria-labelledby={`tab-${aktif}`} className="mt-4">
        {hasil.length === 0 ? (
          <h2 className="text-h3 font-bold">{KOSONG[aktif]}</h2>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {tampil.map((p) => (
                <KartuPengajuan key={p._id} pengajuan={p} onAksi={buka} />
              ))}
            </ul>
            <Paginasi halaman={halamanAman} totalHalaman={totalHalaman} onUbah={setHalaman} />
          </>
        )}
      </div>

      {terpilih && (aksi.jenis === "setujui" || aksi.jenis === "tolak") && (
        <DialogProses
          pengajuan={terpilih}
          mode={aksi.jenis}
          onKonfirmasi={selesaiAksi}
          onTutup={() => setAksi(null)}
        />
      )}
      {terpilih && aksi.jenis === "selesai" && (
        <DialogSelesai pengajuan={terpilih} onKonfirmasi={selesaiAksi} onTutup={() => setAksi(null)} />
      )}
    </main>
  )
}
