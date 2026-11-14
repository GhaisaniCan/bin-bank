"use client"

import { useState } from "react"
import TabelSetoran from "@/components/TabelSetoran"
import Paginasi from "@/components/Paginasi"
import Tombol from "@/components/Tombol"
import IsianTanggal from "@/components/IsianTanggal"

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
const dasarIsian = "mt-2 h-12 w-full rounded-2 bg-putih px-3 text-body"

function kelasIsian(salah) {
  return `${dasarIsian} ${salah ? "border-2 border-bata-700" : "border border-line-500"}`
}

function tanggalLokal(iso) {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function Halaman() {
  const [halaman, setHalaman] = useState(1)
  const [isian, setIsian] = useState(KOSONG)
  const [filter, setFilter] = useState(KOSONG)
  const [galat, setGalat] = useState("")

  const q = filter.kata.trim().toLowerCase()
  const aktif = Boolean(filter.dari || filter.sampai || q)

  const hasil = SETORAN_CONTOH.filter((s) => {
    const tgl = tanggalLokal(s.tanggal)
    if (filter.dari && tgl < filter.dari) return false
    if (filter.sampai && tgl > filter.sampai) return false
    if (q && !s.nasabah.nama.toLowerCase().includes(q)) return false
    return true
  })

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN))
  const tampil = hasil.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN)

  function terapkan(e) {
    e.preventDefault()
    if (isian.dari && isian.sampai && isian.dari > isian.sampai) {
      setGalat("Tanggal mulai tidak boleh setelah tanggal akhir")
      return
    }
    setGalat("")
    setFilter(isian)
    setHalaman(1)
  }

  function hapus() {
    setIsian(KOSONG)
    setFilter(KOSONG)
    setGalat("")
    setHalaman(1)
  }

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Setoran</h1>

      <form onSubmit={terapkan} noValidate className="mt-6">
        <div className="grid gap-4 min-[600px]:grid-cols-2">
          <div>
            <label htmlFor="dari" className="block text-body font-bold">
              Dari tanggal
            </label>
            <IsianTanggal
              id="dari"
              value={isian.dari}
              onChange={(v) => setIsian({ ...isian, dari: v })}
              salah={Boolean(galat)}
              describedBy={galat ? "galat-periode" : undefined}
            />
          </div>
          <div>
            <label htmlFor="sampai" className="block text-body font-bold">
              Sampai tanggal
            </label>
            <IsianTanggal
              id="sampai"
              value={isian.sampai}
              onChange={(v) => setIsian({ ...isian, sampai: v })}
              salah={Boolean(galat)}
              describedBy={galat ? "galat-periode" : undefined}
            />
          </div>
        </div>
        {galat && (
          <p id="galat-periode" role="alert" className="mt-2 text-small font-bold text-bata-700">
            {galat}
          </p>
        )}

        <div className="mt-4">
          <label htmlFor="kata" className="block text-body font-bold">
            Nasabah
          </label>
          <input
            id="kata"
            type="text"
            value={isian.kata}
            onChange={(e) => setIsian({ ...isian, kata: e.target.value })}
            className={kelasIsian(false)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Tombol type="submit">Terapkan filter</Tombol>
          {aktif && (
            <Tombol varian="teks" onClick={hapus}>
              Hapus filter
            </Tombol>
          )}
        </div>
      </form>

      <div className="mt-6">
        {hasil.length === 0 ? (
          <div>
            <h2 className="text-h3 font-bold">
              {aktif ? "Tidak ada setoran yang cocok dengan filter" : "Belum ada setoran"}
            </h2>
            {aktif && (
              <Tombol varian="teks" onClick={hapus} className="mt-2">
                Hapus filter
              </Tombol>
            )}
          </div>
        ) : (
          <>
            <TabelSetoran baris={tampil} />
            <Paginasi halaman={halaman} totalHalaman={totalHalaman} onUbah={setHalaman} />
          </>
        )}
      </div>
    </main>
  )
}