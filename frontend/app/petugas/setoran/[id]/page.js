"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import TombolBatalkanSetoran from "@/components/BatalkanSetoran"
import CapStatus from "@/components/CapStatus"
import LembarSetoran from "@/components/LembarSetoran"
import { ArrowLeft, Prohibit, WarningOctagon } from "@phosphor-icons/react"
import PesanInline from "@/components/PesanInline"
import Tombol, { kelasTombol } from "@/components/Tombol"
import { api } from "@/lib/api"
import { formatJam, formatTanggal } from "@/lib/format"

const kelasTombolKembali = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} w-full gap-2 hover:bg-olive-50 active:bg-olive-50 min-[600px]:w-auto`

const STATUS_TIDAK_DITEMUKAN = [400, 403, 404]

function petakan(data) {
  return {
    _id: data._id,
    nasabah: { _id: data.nasabah?._id ?? null, nama: data.nasabah?.nama ?? "", email: data.nasabah?.email ?? "" },
    petugas: { nama: data.petugas?.nama ?? "" },
    tanggal: data.tanggal,
    rincian: (data.rincian ?? []).map((r) => ({
      nama: r.namaSampah,
      harga: r.hargaPerKg,
      berat: r.berat,
      subtotal: r.subtotal,
    })),
    totalBerat: data.totalBerat,
    totalNilai: data.totalNilai,
    status: data.status,
    alasanBatal: data.alasanBatal ?? "",
    dibatalkanOleh: data.dibatalkanOleh?.nama ? { nama: data.dibatalkanOleh.nama } : null,
    dibatalkanPada: data.dibatalkanPada ?? null,
  }
}

export default function Halaman() {
  const { id } = useParams()
  const [putaran, setPutaran] = useState(0)
  const [hasil, setHasil] = useState({ id: null, putaran: -1, setoran: null, tidakDitemukan: false, galat: false })
  const [belumPasti, setBelumPasti] = useState(false)

  const terkini = hasil.id === id
  const memuat = !terkini || hasil.putaran !== putaran
  const setoran = terkini ? hasil.setoran : null
  const tidakDitemukan = terkini && hasil.tidakDitemukan
  const galat = terkini && hasil.galat

  const muatUlang = useCallback(() => setPutaran((n) => n + 1), [])

  // Data
  useEffect(() => {
    let hidup = true
    const dasar = { id, putaran, setoran: null, tidakDitemukan: false, galat: false }
    api(`/setoran/${encodeURIComponent(id)}`, { galatInline: true, aksesInline: true })
      .then((respons) => {
        if (!hidup) return
        if (!respons?.data) setHasil({ ...dasar, tidakDitemukan: true })
        else setHasil({ ...dasar, setoran: petakan(respons.data) })
      })
      .catch((err) => {
        if (!hidup) return
        const hilang = STATUS_TIDAK_DITEMUKAN.includes(err.status) && !err.data?.wajibGantiPassword
        setHasil({ ...dasar, tidakDitemukan: hilang, galat: !hilang })
      })
    return () => {
      hidup = false
    }
  }, [id, putaran])

  const tautanKembali = (
    <Link href="/petugas/setoran" className={`${kelasTombolKembali} mt-4`}>
      <ArrowLeft size={20} weight="regular" aria-hidden="true" className="shrink-0" />
      Kembali ke daftar setoran
    </Link>
  )

  if (tidakDitemukan) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Setoran tidak ditemukan</h1>
        {tautanKembali}
      </main>
    )
  }

  if (!setoran) {
    return (
      <main aria-busy={memuat || undefined} className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Rincian setoran</h1>
        {galat && !memuat ? (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat" className="mt-4">
            <Tombol varian="sekunder" onClick={muatUlang}>
              Coba lagi
            </Tombol>
          </PesanInline>
        ) : (
          <p className="mt-4 text-body text-ink-700" role="status">
            Memuat rincian setoran…
          </p>
        )}
        {tautanKembali}
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
          {setoran.alasanBatal && <p className="text-body text-ink-900">Alasan: {setoran.alasanBatal}</p>}
          {setoran.dibatalkanPada && (
            <p className="text-small text-ink-700">
              Dibatalkan {setoran.dibatalkanOleh ? `oleh ${setoran.dibatalkanOleh.nama} ` : ""}pada{" "}
              {formatTanggal(setoran.dibatalkanPada)}, {formatJam(setoran.dibatalkanPada)}
            </p>
          )}
        </PesanInline>
      )}
      {belumPasti && setoran.status === "TERCATAT" && (
        <PesanInline
          varian="galat"
          ikon={WarningOctagon}
          isi="Belum dipastikan tersimpan. Muat ulang rincian untuk memeriksa status."
          className="mt-4"
        >
          <Tombol varian="sekunder" disabled={memuat} onClick={muatUlang}>
            Muat ulang rincian
          </Tombol>
        </PesanInline>
      )}
      <div className="mt-6">
        <LembarSetoran setoran={setoran} />
      </div>
      <div>
        <TombolBatalkanSetoran
          setoran={setoran}
          onDibatalkan={() => {
            setBelumPasti(false)
            muatUlang()
          }}
          onBelumPasti={() => {
            setBelumPasti(true)
            muatUlang()
          }}
          className="mt-4 w-full min-[600px]:w-auto"
        />
      </div>
      {tautanKembali}
    </main>
  )
}
