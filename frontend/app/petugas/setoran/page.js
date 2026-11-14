"use client"

import { useState } from "react"
import TabelSetoran from "@/components/TabelSetoran"
import Paginasi from "@/components/Paginasi"
import Tombol from "@/components/Tombol"

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
const KOSONG = { dari: "", sampai: "", kata: "" }
const kelasIsian = "mt-2 h-12 w-full rounded-2 border border-line-500 bg-putih px-3 text-body"

export default function Halaman() {
  const [halaman, setHalaman] = useState(1)
  const [isian, setIsian] = useState(KOSONG)
  const totalHalaman = Math.ceil(SETORAN_CONTOH.length / PER_HALAMAN)
  const tampil = SETORAN_CONTOH.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN)

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Setoran</h1>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="mt-6">
        <div className="grid gap-4 min-[600px]:grid-cols-2">
          <div>
            <label htmlFor="dari" className="block text-body font-bold">
              Dari tanggal
            </label>
            <input
              id="dari"
              type="date"
              value={isian.dari}
              onChange={(e) => setIsian({ ...isian, dari: e.target.value })}
              className={kelasIsian}
            />
          </div>
          <div>
            <label htmlFor="sampai" className="block text-body font-bold">
              Sampai tanggal
            </label>
            <input
              id="sampai"
              type="date"
              value={isian.sampai}
              onChange={(e) => setIsian({ ...isian, sampai: e.target.value })}
              className={kelasIsian}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="kata" className="block text-body font-bold">
            Nasabah
          </label>
          <input
            id="kata"
            type="text"
            value={isian.kata}
            onChange={(e) => setIsian({ ...isian, kata: e.target.value })}
            className={kelasIsian}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Tombol type="submit">Terapkan filter</Tombol>
        </div>
      </form>

      <div className="mt-6">
        <TabelSetoran baris={tampil} />
        <Paginasi halaman={halaman} totalHalaman={totalHalaman} onUbah={setHalaman} />
      </div>
    </main>
  )
}