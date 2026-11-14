"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"
import { Prohibit } from "@phosphor-icons/react"
import PesanInline from "@/components/PesanInline"
import { formatJam, formatTanggal } from "@/lib/format"

const kelasTautan =
  "inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"

function contoh(id) {
  if (!/^s([1-9]|1[0-2])$/.test(id)) return null
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

  if (!setoran) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Setoran tidak ditemukan</h1>
        <Link href="/petugas/setoran" className={`${kelasTautan} mt-4`}>
          Kembali ke daftar setoran
        </Link>
      </main>
    )
  }

  return (
    <main className="pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-bold text-forest-900">Rincian setoran</h1>
        <CapStatus status={setoran.status} />
      </div>
      {setoran.status === "DIBATALKAN" && (
        <PesanInline varian="galat" ikon={Prohibit} isi="Setoran ini dibatalkan" className="mt-4">
          <p className="text-body text-ink-900">Alasan: {setoran.alasanBatal}</p>
          <p className="text-small text-ink-700">
            Dibatalkan oleh {setoran.dibatalkanOleh.nama} pada {formatTanggal(setoran.dibatalkanPada)},{" "}
            {formatJam(setoran.dibatalkanPada)}
          </p>
        </PesanInline>
      )}
      <div className="mt-6">
        <LembarSetoran setoran={setoran} />
      </div>
      <Link href="/petugas/setoran" className={`${kelasTautan} mt-4`}>
        Kembali ke daftar setoran
      </Link>
    </main>
  )
}
