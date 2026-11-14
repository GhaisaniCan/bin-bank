"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatRupiah } from "@/lib/format"
import TabelMutasi from "@/components/TabelMutasi"
import Tombol from "@/components/Tombol"

const NASABAH_CONTOH = {
  1: { nama: "Sari Wulandari", email: "sari@contoh.com" },
  2: { nama: "Budi Santoso", email: "budi@contoh.com" },
  3: { nama: "Sari Dewi", email: "saridewi@contoh.com" },
  4: { nama: "Joko Prasetyo", email: "joko@contoh.com" },
}

const SALDO_CONTOH = { saldo: 128500, saldoTersedia: 108500, saldoTertahan: 20000 }

const MUTASI_CONTOH = Array.from({ length: 12 }, (_, i) => {
  const keluar = i % 4 === 3
  return {
    _id: `m${i}`,
    tipe: keluar ? "DEBIT" : "KREDIT",
    jumlah: 25000,
    sumber: keluar ? "PENARIKAN" : "SETORAN",
    referensiId: null,
    keterangan: keluar ? "Penarikan tunai" : "Setoran 2.5 kg",
    saldoSetelah: 128500 - i * 10000,
    createdAt: new Date(2026, 10, 12 - i).toISOString(),
  }
})

const PER_HALAMAN = 5

export default function Halaman() {
  const { id } = useParams()
  const [halaman, setHalaman] = useState(1)
  const nasabah = NASABAH_CONTOH[id]

  if (!nasabah) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Nasabah tidak ditemukan</h1>
        <p className="mt-2 text-body text-ink-700">Periksa kembali, atau cari nasabah lain.</p>
        <Link
          href="/petugas/cari-nasabah"
          className="mt-4 inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"
        >
          Cari nasabah
        </Link>
      </main>
    )
  }

  const totalHalaman = Math.ceil(MUTASI_CONTOH.length / PER_HALAMAN)
  const tampil = MUTASI_CONTOH.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN)

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">{nasabah.nama}</h1>
      <p className="mt-2 text-small text-ink-700">{nasabah.email}</p>
      <Link
        href={`/petugas/setoran/baru?nasabah=${id}`}
        className="mt-4 inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 min-[600px]:w-auto"
      >
        Catat setoran untuk nasabah ini
      </Link>

      <section
        aria-labelledby="judul-saldo"
        className="mt-6 rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
      >
        <h2 id="judul-saldo" className="text-body text-ink-700">
          Saldo
        </h2>
        <p className="mt-1 text-display font-bold tabular-nums">
          {formatRupiah(SALDO_CONTOH.saldo)}
        </p>
        <div className="mt-4">
          <p className="text-body text-ink-700">Saldo tersedia</p>
          <p className="text-amount font-bold tabular-nums">
            {formatRupiah(SALDO_CONTOH.saldoTersedia)}
          </p>
        </div>
        {SALDO_CONTOH.saldoTertahan > 0 && (
          <p className="mt-2 text-body text-ink-700">
            <span className="tabular-nums">{formatRupiah(SALDO_CONTOH.saldoTertahan)}</span>{" "}
            sedang menunggu keputusan
          </p>
        )}
      </section>

      <section aria-labelledby="judul-mutasi" className="mt-6">
        <h2 id="judul-mutasi" className="text-h2 font-bold">
          Riwayat mutasi
        </h2>
        <div className="mt-4">
          <TabelMutasi baris={tampil} labelId="judul-mutasi" />
          <nav aria-label="Halaman daftar" className="mt-4 flex items-center justify-between gap-3">
            <Tombol varian="sekunder" disabled={halaman === 1} onClick={() => setHalaman(halaman - 1)}>
              Sebelumnya
            </Tombol>
            <span className="text-small text-ink-700">
              Halaman {halaman} dari {totalHalaman}
            </span>
            <Tombol varian="sekunder" disabled={halaman === totalHalaman} onClick={() => setHalaman(halaman + 1)}>
              Berikutnya
            </Tombol>
          </nav>
        </div>
      </section>
    </main>
  )
}