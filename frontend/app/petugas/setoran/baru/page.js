"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MagnifyingGlass, UserSwitch, WarningOctagon } from "@phosphor-icons/react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRupiah } from "@/lib/format"
import { formatBerat } from "@/components/TabelSetoran"
import Tombol, { kelasTombol } from "@/components/Tombol"
import PencarianNasabah from "@/components/PencarianNasabah"
import PesanInline from "@/components/PesanInline"
import { api } from "@/lib/api"

const STATUS_TIDAK_DITEMUKAN = [400, 403, 404]

function siapkanJenis(data) {
  return data
    .filter((j) => j.aktif !== false)
    .map((j) => ({ id: String(j._id), nama: j.nama, hargaPerKg: j.hargaPerKg ?? j.harga_per_kg }))
    .filter((j) => Number.isFinite(j.hargaPerKg))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
}

const KUNCI_DRAF = "binbank_draf_setoran"

const kelasTombolNavigasi = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} gap-2 hover:bg-olive-50 active:bg-olive-50`

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

function hitung(baris, daftarJenis) {
  const rincian = baris.map((b) => {
    const jenis = daftarJenis.find((j) => j.id === b.jenisId)
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
  const [putaranNasabah, setPutaranNasabah] = useState(0)
  const [hasilNasabah, setHasilNasabah] = useState({ id: null, putaran: -1, nasabah: null, tidakDitemukan: false, galat: false })
  const nasabahTerkini = hasilNasabah.id === nasabahId && hasilNasabah.putaran === putaranNasabah
  const nasabah = nasabahTerkini ? hasilNasabah.nasabah : null
  const nasabahTidakDitemukan = nasabahTerkini && hasilNasabah.tidakDitemukan
  const galatNasabah = nasabahTerkini && hasilNasabah.galat

  const kunci = useRef(1)
  const [baris, setBaris] = useState([{ kunci: 0, jenisId: "", berat: "" }])
  const [galat, setGalat] = useState({})
  const [daftarJenis, setDaftarJenis] = useState([])
  const [memuatJenis, setMemuatJenis] = useState(true)
  const [galatJenis, setGalatJenis] = useState(false)
  const [putaranJenis, setPutaranJenis] = useState(0)

  // Data nasabah
  useEffect(() => {
    if (!nasabahId) return
    let hidup = true
    const dasar = { id: nasabahId, putaran: putaranNasabah, nasabah: null, tidakDitemukan: false, galat: false }
    api(`/users/${encodeURIComponent(nasabahId)}`, { galatInline: true, aksesInline: true })
      .then((respons) => {
        if (!hidup) return
        const data = respons?.data
        if (!data) setHasilNasabah({ ...dasar, tidakDitemukan: true })
        else setHasilNasabah({ ...dasar, nasabah: { nama: data.nama, email: data.email } })
      })
      .catch((err) => {
        if (!hidup) return
        const hilang = STATUS_TIDAK_DITEMUKAN.includes(err.status) && !err.data?.wajibGantiPassword
        setHasilNasabah({ ...dasar, tidakDitemukan: hilang, galat: !hilang })
      })
    return () => {
      hidup = false
    }
  }, [nasabahId, putaranNasabah])

  useEffect(() => {
    if (!nasabahId) return
    let aktif = true
    api("/jenis-sampah", { galatInline: true })
      .then((hasil) => {
        if (!aktif) return
        setDaftarJenis(siapkanJenis(hasil.data ?? []))
        setGalatJenis(false)
      })
      .catch(() => {
        if (aktif) setGalatJenis(true)
      })
      .finally(() => {
        if (aktif) setMemuatJenis(false)
      })
    return () => {
      aktif = false
    }
  }, [nasabahId, putaranJenis])

  function muatUlangJenis() {
    setMemuatJenis(true)
    setPutaranJenis((n) => n + 1)
  }

  useEffect(() => {
    try {
      const draf = JSON.parse(sessionStorage.getItem(KUNCI_DRAF))
      if (draf && draf.nasabahId === nasabahId && Array.isArray(draf.baris) && draf.baris.length > 0) {
        setBaris(draf.baris.map((b) => ({ ...b, kunci: kunci.current++ })))
      }
    } catch {}
  }, [nasabahId])

  const { rincian, totalBerat, totalNilai } = hitung(baris, daftarJenis)

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
        <h1 className="text-h1 font-bold text-forest-900">Catat Setoran</h1>
        <p className="mt-2 text-body text-ink-700">Cari nasabah, lalu catat setorannya.</p>
        <div className="mt-5 max-w-[640px]">
          <PencarianNasabah
            hrefPilih={(id) => `/petugas/setoran/baru?nasabah=${id}`}
            hrefProfil={(id) => `/petugas/nasabah/${id}`}
          />
        </div>
      </main>
    )
  }

  const tautanCari = (
    <Link href="/petugas/setoran/baru" className={`${kelasTombolNavigasi} mt-4`}>
      <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="shrink-0" />
      Cari nasabah
    </Link>
  )

  if (nasabahTidakDitemukan) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Nasabah tidak ditemukan</h1>
        {tautanCari}
      </main>
    )
  }

  if (!nasabah) {
    return (
      <main aria-busy={!galatNasabah || undefined} className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Setoran baru</h1>
        {galatNasabah ? (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat" className="mt-4">
            <Tombol varian="sekunder" onClick={() => setPutaranNasabah((n) => n + 1)}>
              Coba lagi
            </Tombol>
          </PesanInline>
        ) : (
          <p className="mt-4 text-body text-ink-700" role="status">
            Memuat data nasabah…
          </p>
        )}
        {tautanCari}
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
        <Link href="/petugas/setoran/baru" className={`${kelasTombolNavigasi} ml-auto`}>
          <UserSwitch size={20} weight="regular" aria-hidden="true" className="shrink-0" />
          Ganti
        </Link>
      </div>

      {galatJenis && (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-small font-bold text-bata-700">Daftar jenis sampah belum bisa dimuat</p>
          <Tombol varian="teks" onClick={muatUlangJenis}>
            Coba lagi
          </Tombol>
        </div>
      )}

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
                disabled={memuatJenis}
                aria-invalid={e.jenis ? "true" : "false"}
                aria-describedby={e.jenis ? `galat-jenis-${b.kunci}` : undefined}
                className={`mt-2 h-7 w-full rounded-2 bg-putih px-3 text-body ${kelasKotak(e.jenis)}`}
              >
                <option value="">{memuatJenis ? "Memuat jenis sampah..." : "Pilih jenis sampah"}</option>
                {daftarJenis.map((j) => (
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
