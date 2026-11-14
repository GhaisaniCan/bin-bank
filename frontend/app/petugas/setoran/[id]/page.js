"use client"

import { useParams } from "next/navigation"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"

function contoh(id) {
  const batal = id === "s3"
  return {
    nasabah: { nama: "Sari Wulandari", email: "sari@contoh.com" },
    petugas: { nama: "Petugas Contoh" },
    tanggal: new Date(2026, 10, 12, 10).toISOString(),
    rincian: [
      { nama: "Botol plastik", harga: 2500, berat: 1.5, subtotal: 3750 },
      { nama: "Kardus", harga: 2000, berat: 3.25, subtotal: 6500 },
      { nama: "Kaleng", harga: 5000, berat: 0.75, subtotal: 3750 },
    ],
    totalBerat: 5.5,
    totalNilai: 14000,
    status: batal ? "DIBATALKAN" : "TERCATAT",
    alasanBatal: batal ? "Salah input berat, seharusnya 2,5 kg" : "",
    dibatalkanOleh: batal ? { nama: "Admin Contoh" } : null,
    dibatalkanPada: batal ? new Date(2026, 10, 12, 14).toISOString() : null,
  }
}

export default function Halaman() {
  const { id } = useParams()
  const setoran = contoh(id)

  return (
    <main className="pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-bold text-forest-900">Rincian setoran</h1>
        <CapStatus status={setoran.status} />
      </div>
      <div className="mt-6">
        <LembarSetoran setoran={setoran} />
      </div>
    </main>
  )
}
