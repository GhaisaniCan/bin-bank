"use client"

import { useState } from "react"
import KartuPengajuan from "@/components/KartuPengajuan"
import Paginasi from "@/components/Paginasi"
import TabStatus from "@/components/TabStatus"

const NAMA = ["Sari Wulandari", "Budi Santoso", "Sari Dewi", "Joko Prasetyo"]

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

function buat(n, status, metode) {
  const ewallet = metode === "e-wallet"
  const diproses = status !== "diajukan"
  const selesai = status === "selesai"
  return {
    _id: `p${n}`,
    nasabah: { nama: NAMA[n % 4] },
    jumlah: 20000 + n * 5000,
    metode,
    namaEwallet: ewallet ? "DANA" : "",
    nomorEwallet: ewallet ? `08123456${1000 + n}` : "",
    status,
    createdAt: new Date(2026, 10, 14 - n, 9).toISOString(),
    diprosesOleh: diproses ? { nama: "Petugas Contoh" } : null,
    diprosesPada: diproses ? new Date(2026, 10, 14 - n, 15).toISOString() : null,
    dikonfirmasiOleh: selesai ? { nama: "Petugas Contoh" } : null,
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

const DATA_CONTOH = URUTAN.map((status, i) => buat(i + 1, status, i % 2 === 0 ? "tunai" : "e-wallet"))

const PER_HALAMAN = 5

export default function Halaman() {
  const [aktif, setAktif] = useState("diajukan")
  const [halaman, setHalaman] = useState(1)

  const tab = TAB.map((t) => ({ ...t, jumlah: DATA_CONTOH.filter((p) => p.status === t.id).length }))
  const hasil = DATA_CONTOH.filter((p) => p.status === aktif)
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN))
  const tampil = hasil.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN)

  function ganti(id) {
    setAktif(id)
    setHalaman(1)
  }

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Penarikan</h1>

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
                <KartuPengajuan key={p._id} pengajuan={p} />
              ))}
            </ul>
            <Paginasi halaman={halaman} totalHalaman={totalHalaman} onUbah={setHalaman} />
          </>
        )}
      </div>
    </main>
  )
}
