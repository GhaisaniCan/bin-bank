"use client"

import { useCallback, useEffect, useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import TabelSetoran from "@/components/TabelSetoran"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import IsianTanggal from "@/components/IsianTanggal"
import { api } from "@/lib/api"

const PER_HALAMAN = 5
const KOSONG = { dari: "", sampai: "", kata: "" }
const dasarIsian = "mt-2 h-12 w-full rounded-2 bg-putih px-3 text-body"

function kelasIsian(salah) {
  return `${dasarIsian} ${salah ? "border-2 border-bata-700" : "border border-line-500"}`
}

export default function Halaman() {
  const [halaman, setHalaman] = useState(1)
  const [isian, setIsian] = useState(KOSONG)
  const [filter, setFilter] = useState(KOSONG)
  const [galat, setGalat] = useState("")
  const [daftar, setDaftar] = useState([])
  const [paginasi, setPaginasi] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galatBaca, setGalatBaca] = useState(false)
  const [putaran, setPutaran] = useState(0)

  const q = filter.kata.trim()
  const aktif = Boolean(filter.dari || filter.sampai || q)
  const totalHalaman = Math.max(1, paginasi?.totalHalaman ?? 1)

  // Data
  useEffect(() => {
    let hidup = true
    const kueri = new URLSearchParams({ halaman: String(halaman), limit: String(PER_HALAMAN) })
    if (filter.dari) kueri.set("dari", filter.dari)
    if (filter.sampai) kueri.set("sampai", filter.sampai)
    if (q) kueri.set("cari", q)
    api(`/setoran?${kueri}`, { galatInline: true })
      .then((hasil) => {
        if (!hidup) return
        setDaftar(hasil?.data ?? [])
        setPaginasi(hasil?.paginasi ?? null)
        setGalatBaca(false)
      })
      .catch(() => {
        if (hidup) setGalatBaca(true)
      })
      .finally(() => {
        if (hidup) setMemuat(false)
      })
    return () => {
      hidup = false
    }
  }, [filter.dari, filter.sampai, q, halaman, putaran])

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setPutaran((n) => n + 1)
  }, [])

  function gantiHalaman(h) {
    setMemuat(true)
    setHalaman(h)
  }

  function terapkan(e) {
    e.preventDefault()
    if (isian.dari && isian.sampai && isian.dari > isian.sampai) {
      setGalat("Tanggal mulai tidak boleh setelah tanggal akhir")
      return
    }
    setGalat("")
    setFilter(isian)
    setHalaman(1)
    muatUlang()
  }

  function hapus() {
    setIsian(KOSONG)
    setFilter(KOSONG)
    setGalat("")
    setHalaman(1)
    muatUlang()
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

      <div aria-busy={memuat || undefined} className="mt-6">
        {galatBaca && !memuat ? (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        ) : memuat && !paginasi ? (
          <p className="text-body text-ink-700" role="status">
            Memuat setoran…
          </p>
        ) : daftar.length === 0 ? (
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
            <TabelSetoran baris={daftar} />
            <Paginasi halaman={halaman} totalHalaman={totalHalaman} onUbah={gantiHalaman} nonaktif={memuat} />
          </>
        )}
      </div>
    </main>
  )
}