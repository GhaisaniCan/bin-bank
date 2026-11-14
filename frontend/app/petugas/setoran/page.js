"use client"

import { useState } from "react"
import TabelSetoran from "@/components/TabelSetoran"
import Paginasi from "@/components/Paginasi"

const NAMA = ["Sari Wulandari", "Budi Santoso", "Sari Dewi", "Joko Prasetyo"]

const SETORAN_CONTOH = Array.from({ length: 12 }, (_, i) => ({
  _id: `s${i + 1}`,
  nasabah: { nama: NAMA[i % 4] },
  tanggal: new Date(2026, 10, 13 - i, 10).toISOString(),
  totalBerat: 2.5 + i * 0.75,
  totalNilai: 12500 + i * 4000,
  status: i === 2 ? "DIBATALKAN" : "TERCATAT",
}))

const PER_HALAMAN = 5

export default function Halaman() {
  const [halaman, setHalaman] = useState(1)
  const totalHalaman = Math.ceil(SETORAN_CONTOH.length / PER_HALAMAN)
  const tampil = SETORAN_CONTOH.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN)

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Setoran</h1>
      <div className="mt-6">
        <TabelSetoran baris={tampil} />
        <Paginasi halaman={halaman} totalHalaman={totalHalaman} onUbah={setHalaman} />
      </div>
    </main>
  )
}