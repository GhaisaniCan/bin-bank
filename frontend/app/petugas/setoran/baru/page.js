"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRupiah } from "@/lib/format"
import { formatBerat } from "@/components/TabelSetoran"
import Tombol from "@/components/Tombol"

const NASABAH_CONTOH = {
  1: { nama: "Sari Wulandari", email: "sari@contoh.com" },
  2: { nama: "Budi Santoso", email: "budi@contoh.com" },
  3: { nama: "Sari Dewi", email: "saridewi@contoh.com" },
  4: { nama: "Joko Prasetyo", email: "joko@contoh.com" },
}

const JENIS_CONTOH = [
  { id: "j1", nama: "Botol plastik", hargaPerKg: 2500 },
  { id: "j2", nama: "Kardus", hargaPerKg: 2000 },
  { id: "j3", nama: "Kaleng", hargaPerKg: 5000 },
  { id: "j4", nama: "Kertas", hargaPerKg: 1500 },
  { id: "j5", nama: "Botol kaca", hargaPerKg: 1000 },
]

const KUNCI_DRAF = "binbank_draf_setoran"

const kelasTautan =
  "inline-flex min-h-7 items-center text-body text-olive-700 underline decoration-1 hover:decoration-2"

function kelasKotak(salah) {
  return salah ? "border-2 border-bata-700" : "border border-line-500"
}

function Galat({ id, pesan }) {
  if (!pesan) return null
  return (
    <p id={id} role="alert" className="mt-2 text-small font-bold text-bata-700">
      {pesan}
    </p>
  )
}

function ambilBerat(teks) {
  const t = String(teks).trim()
  if (!/^\d+([.,]\d+)?$/.test(t)) return null
  return Math.round(Number(t.replace(",", ".")) * 100) / 100
}

function hitung(baris) {
  const rincian = baris.map((b) => {
    const jenis = JENIS_CONTOH.find((j) => j.id === b.jenisId)
    const berat = ambilBerat(b.berat)
    const sah = jenis && berat !== null && berat > 0
    return {
      jenis,
      berat: sah ? berat : null,
      subtotal: sah ? Math.round(berat * jenis.hargaPerKg) : null,
    }
  })
  const totalBerat = Math.round(rincian.reduce((t, r) => t + (r.berat ?? 0), 0) * 100) / 100
  const totalNilai = rincian.reduce((t, r) => t + (r.subtotal ?? 0), 0)
  return { rincian, totalBerat, totalNilai }
}

function FormSetoran() {
  const router = useRouter()
  const params = useSearchParams()
  const nasabahId = params.get("nasabah")
  const nasabah = nasabahId ? NASABAH_CONTOH[nasabahId] : null

  const kunci = useRef(1)
  const [baris, setBaris] = useState([{ kunci: 0, jenisId: "", berat: "" }])
  const [galat, setGalat] = useState({})

  useEffect(() => {
    try {
      const draf = JSON.parse(sessionStorage.getItem(KUNCI_DRAF))
      if (draf && draf.nasabahId === nasabahId && Array.isArray(draf.baris) && draf.baris.length > 0) {
        setBaris(draf.baris.map((b) => ({ ...b, kunci: kunci.current++ })))
      }
    } catch {}
  }, [nasabahId])

  const { rincian, totalBerat, totalNilai } = hitung(baris)

  function ubah(kunciBaris, medan, nilai) {
    setBaris((lama) => lama.map((b) => (b.kunci === kunciBaris ? { ...b, [medan]: nilai } : b)))
    setGalat((g) => ({ ...g, [kunciBaris]: undefined }))
  }

  function rapikan(kunciBaris) {
    const b = baris.find((x) => x.kunci === kunciBaris)
    const angka = ambilBerat(b.berat)
    if (angka !== null && angka > 0) ubah(kunciBaris, "berat", angka.toFixed(2).replace(".", ","))
  }

  function tambah() {
    const baru = { kunci: kunci.current++, jenisId: "", berat: "" }
    setBaris((lama) => [...lama, baru])
    setTimeout(() => document.getElementById(`jenis-${baru.kunci}`)?.focus(), 0)
  }

  function hapus(kunciBaris) {
    setBaris((lama) => lama.filter((b) => b.kunci !== kunciBaris))
    setGalat((g) => ({ ...g, [kunciBaris]: undefined }))
  }

  function periksa() {
    const g = {}
    baris.forEach((b, i) => {
      const e = {}
      if (!b.jenisId) e.jenis = "Pilih jenis sampah"
      if (!rincian[i].berat) e.berat = "Berat harus angka lebih dari 0"
      if (e.jenis || e.berat) g[b.kunci] = e
    })
    setGalat(g)

    const pertama = baris.find((b) => g[b.kunci])
    if (pertama) {
      const e = g[pertama.kunci]
      document.getElementById(e.jenis ? `jenis-${pertama.kunci}` : `berat-${pertama.kunci}`)?.focus()
      return
    }

    sessionStorage.setItem(
      KUNCI_DRAF,
      JSON.stringify({
        nasabahId,
        nasabah,
        baris: baris.map(({ jenisId, berat }) => ({ jenisId, berat })),
        rincian: rincian.map((r) => ({
          jenisId: r.jenis.id,
          nama: r.jenis.nama,
          harga: r.jenis.hargaPerKg,
          berat: r.berat,
          subtotal: r.subtotal,
        })),
        totalBerat,
        totalNilai,
      })
    )
    router.push("/petugas/setoran/baru/konfirmasi")
  }

  if (!nasabahId) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Setoran untuk siapa?</h1>
        <p className="mt-2 text-body text-ink-700">Pilih nasabah dulu sebelum mencatat setoran.</p>
        <Link href="/petugas/cari-nasabah" className={`${kelasTautan} mt-4`}>
          Cari nasabah
        </Link>
      </main>
    )
  }

  if (!nasabah) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Nasabah tidak ditemukan</h1>
        <Link href="/petugas/cari-nasabah" className={`${kelasTautan} mt-4`}>
          Cari nasabah
        </Link>
      </main>
    )
  }

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Setoran baru</h1>

      <div className="sticky top-0 z-[5] mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-300 bg-putih py-3">
        <div>
          <p className="text-body font-bold">{nasabah.nama}</p>
          <p className="text-small text-ink-700">{nasabah.email}</p>
        </div>
        <Link href="/petugas/cari-nasabah" className={kelasTautan}>
          Ganti
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {baris.map((b, i) => {
          const r = rincian[i]
          const e = galat[b.kunci] ?? {}
          return (
            <li key={b.kunci} className="rounded-2 border border-line-300 bg-putih p-4">
              <label htmlFor={`jenis-${b.kunci}`} className="block text-body font-bold">
                Jenis sampah
              </label>
              <select
                id={`jenis-${b.kunci}`}
                value={b.jenisId}
                onChange={(ev) => ubah(b.kunci, "jenisId", ev.target.value)}
                aria-invalid={e.jenis ? "true" : "false"}
                aria-describedby={e.jenis ? `galat-jenis-${b.kunci}` : undefined}
                className={`mt-2 h-7 w-full rounded-2 bg-putih px-3 text-body ${kelasKotak(e.jenis)}`}
              >
                <option value="">Pilih jenis sampah</option>
                {JENIS_CONTOH.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama}, {formatRupiah(j.hargaPerKg)} per kg
                  </option>
                ))}
              </select>
              <Galat id={`galat-jenis-${b.kunci}`} pesan={e.jenis} />

              <label htmlFor={`berat-${b.kunci}`} className="mt-4 block text-body font-bold">
                Berat (kg)
              </label>
              <div className="relative mt-2">
                <input
                  id={`berat-${b.kunci}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={b.berat}
                  onChange={(ev) => ubah(b.kunci, "berat", ev.target.value)}
                  onBlur={() => rapikan(b.kunci)}
                  aria-invalid={e.berat ? "true" : "false"}
                  aria-describedby={e.berat ? `galat-berat-${b.kunci}` : undefined}
                  className={`h-8 w-full rounded-2 bg-putih px-3 pr-14 text-[24px] font-bold tabular-nums ${kelasKotak(e.berat)}`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-body text-ink-700">
                  kg
                </span>
              </div>
              <Galat id={`galat-berat-${b.kunci}`} pesan={e.berat} />

              <dl className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div>
                  <dt className="text-small text-ink-700">Harga per kg</dt>
                  <dd className="text-body tabular-nums">{r.jenis ? formatRupiah(r.jenis.hargaPerKg) : "-"}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-small text-ink-700">Subtotal</dt>
                  <dd className="text-amount font-bold tabular-nums">
                    {r.subtotal !== null ? formatRupiah(r.subtotal) : "-"}
                  </dd>
                </div>
              </dl>

              {baris.length > 1 && (
                <div className="mt-3">
                  <Tombol varian="teks" onClick={() => hapus(b.kunci)}>
                    Hapus baris
                  </Tombol>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <Tombol varian="sekunder" onClick={tambah} className="mt-4">
        Tambah jenis lain
      </Tombol>

      <div className="mt-6 border-t-[3px] border-double border-ink-900 pt-3">
        <dl className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-body text-ink-700">Total berat</dt>
            <dd className="text-amount font-bold tabular-nums">{formatBerat(totalBerat)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-body text-ink-700">Total nilai</dt>
            <dd className="text-h2 font-bold tabular-nums">{formatRupiah(totalNilai)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-small text-ink-500">Perkiraan. Nilai resmi dihitung saat disimpan.</p>
      </div>

      <div className="sticky bottom-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] z-[5] mt-4 border-t border-line-300 bg-putih py-4 lg:static lg:border-t-0">
        <Tombol onClick={periksa} className="w-full lg:w-auto">
          Periksa setoran
        </Tombol>
      </div>
    </main>
  )
}

export default function Halaman() {
  return (
    <Suspense fallback={null}>
      <FormSetoran />
    </Suspense>
  )
}
