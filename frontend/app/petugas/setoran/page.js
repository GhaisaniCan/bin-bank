"use client"

import TabelSetoran from "@/components/TabelSetoran"

const NAMA = ["Sari Wulandari", "Budi Santoso", "Sari Dewi", "Joko Prasetyo"]

const SETORAN_CONTOH = Array.from({ length: 12 }, (_, i) => ({
  _id: `s${i + 1}`,
  nasabah: { nama: NAMA[i % 4] },
  tanggal: new Date(2026, 10, 13 - i, 10).toISOString(),
  totalBerat: 2.5 + i * 0.75,
  totalNilai: 12500 + i * 4000,
  status: i === 2 ? "DIBATALKAN" : "TERCATAT",
}))

export default function Halaman() {
  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Setoran</h1>
      <div className="mt-6">
        <TabelSetoran baris={SETORAN_CONTOH} />
      </div>
    </main>
  )
}