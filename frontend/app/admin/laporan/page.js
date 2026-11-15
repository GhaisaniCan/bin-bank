"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { formatRupiah, formatTanggal } from "@/lib/format"
import { useDaring } from "@/lib/koneksi"
import CapStatus from "@/components/CapStatus"
import IsianTanggal from "@/components/IsianTanggal"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

const TAB = [
  { id: "setoran", label: "Setoran" },
  { id: "penarikan", label: "Penarikan dan saldo" },
]

// Periode
function bulanBerjalan() {
  const hariIni = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())
  const [tahun, bulan] = hariIni.split("-").map(Number)
  const akhir = new Date(Date.UTC(tahun, bulan, 0)).getUTCDate()
  const bb = String(bulan).padStart(2, "0")
  return { dari: `${tahun}-${bb}-01`, sampai: `${tahun}-${bb}-${String(akhir).padStart(2, "0")}` }
}

function teksPeriode({ dari, sampai }) {
  const awal = formatTanggal(`${dari}T00:00:00+07:00`)
  const akhir = formatTanggal(`${sampai}T00:00:00+07:00`)
  return awal === akhir ? awal : `${awal} sampai ${akhir}`
}

// Angka
function formatBerat(kg) {
  const angka = (Number(kg) || 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${angka} kg`
}

function formatJumlah(n) {
  return (Number(n) || 0).toLocaleString("id-ID")
}

// Tab
function TabLaporan({ aktif, onUbah }) {
  const refTab = useRef([])

  function tekan(e, i) {
    let ke = null
    if (e.key === "ArrowRight") ke = (i + 1) % TAB.length
    else if (e.key === "ArrowLeft") ke = (i - 1 + TAB.length) % TAB.length
    else if (e.key === "Home") ke = 0
    else if (e.key === "End") ke = TAB.length - 1
    if (ke === null) return
    e.preventDefault()
    refTab.current[ke]?.focus()
    onUbah(TAB[ke].id)
  }

  return (
    <div role="tablist" aria-label="Jenis laporan" className="mt-4 flex gap-2 border-b border-line-300">
      {TAB.map((t, i) => {
        const terpilih = t.id === aktif
        return (
          <button
            key={t.id}
            ref={(el) => {
              refTab.current[i] = el
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={terpilih}
            aria-controls={`panel-${t.id}`}
            tabIndex={terpilih ? 0 : -1}
            onClick={() => onUbah(t.id)}
            onKeyDown={(e) => tekan(e, i)}
            className={`-mb-px min-h-7 border-b-[3px] px-3 text-body text-ink-900 ${
              terpilih ? "border-ink-900 font-bold" : "border-transparent hover:bg-olive-50"
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// Tabel setoran
function TabelSetoranPerJenis({ data, periode }) {
  const baris = data.setoranPerJenis
  return (
    <>
      <table className="mt-5 w-full border-collapse">
        <caption className="sr-only">Setoran per jenis sampah, {teksPeriode(periode)}</caption>
        <thead>
          <tr className="border-b-2 border-ink-900 text-left text-small font-bold text-ink-700">
            <th scope="col" className="py-3 pr-3">Jenis sampah</th>
            <th scope="col" className="py-3 pr-3 text-right">Berat (kg)</th>
            <th scope="col" className="py-3 text-right">Nilai (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {baris.length === 0 ? (
            <tr className="border-b border-line-300">
              <td colSpan={3} className="py-4 text-ink-700">
                Tidak ada setoran pada periode ini
              </td>
            </tr>
          ) : (
            baris.map((b, i) => (
              <tr
                key={b.jenisSampah ?? b.namaSampah}
                className={`border-b border-line-300 ${baris.length > 5 && i % 2 ? "min-[1024px]:bg-olive-50" : ""}`}
              >
                <th scope="row" className="py-3 pr-3 text-left font-normal">
                  {b.namaSampah}
                </th>
                <td className="whitespace-nowrap py-3 pr-3 text-right tabular-nums">{formatBerat(b.totalBerat)}</td>
                <td className="whitespace-nowrap py-3 text-right tabular-nums">{formatRupiah(b.totalNilai)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-[3px] border-double border-ink-900 font-bold">
            <th scope="row" className="py-3 pr-3 text-left">
              Total
            </th>
            <td className="whitespace-nowrap py-3 pr-3 text-right tabular-nums">{formatBerat(data.setoran.totalBerat)}</td>
            <td className="whitespace-nowrap py-3 text-right tabular-nums">{formatRupiah(data.setoran.totalNilai)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 text-small text-ink-700">
        {formatJumlah(data.setoran.totalTransaksi)} setoran. Setoran yang dibatalkan tidak dihitung. Nilai memakai
        harga saat setoran dicatat.
      </p>
    </>
  )
}

// Tabel penarikan
function TabelPenarikanPerStatus({ data, periode }) {
  return (
    <>
      <table className="mt-5 w-full border-collapse">
        <caption className="sr-only">Penarikan per status, {teksPeriode(periode)}</caption>
        <thead>
          <tr className="border-b-2 border-ink-900 text-left text-small font-bold text-ink-700">
            <th scope="col" className="py-3 pr-3">Status</th>
            <th scope="col" className="py-3 pr-3 text-right">Jumlah</th>
            <th scope="col" className="py-3 text-right">Total nominal</th>
          </tr>
        </thead>
        <tbody>
          {data.penarikanPerStatus.map((p) => (
            <tr key={p.status} className="border-b border-line-300">
              <th scope="row" className="py-3 pr-3 text-left font-normal">
                <CapStatus status={p.status} />
              </th>
              <td className="py-3 pr-3 text-right tabular-nums">{formatJumlah(p.totalTransaksi)}</td>
              <td className="whitespace-nowrap py-3 text-right tabular-nums">{formatRupiah(p.totalNominal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-small text-ink-700">
        Pengajuan dihitung menurut tanggal diajukan.
      </p>

      <div className="mt-6 border-t-[3px] border-double border-ink-900 pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-body font-bold">Total saldo seluruh nasabah</h2>
          <p className="text-amount font-bold tabular-nums">{formatRupiah(data.saldo.totalUangMengendap)}</p>
        </div>
        <p className="mt-1 text-small text-ink-700">
          Saldo saat ini dari {formatJumlah(data.saldo.totalNasabah)} nasabah, tidak mengikuti periode.
        </p>
      </div>
    </>
  )
}

export default function Halaman() {
  const daring = useDaring()
  const [tab, setTab] = useState("setoran")
  const [isian, setIsian] = useState(bulanBerjalan)
  const [periode, setPeriode] = useState(null)
  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [lambat, setLambat] = useState(false)
  const [galatPeriode, setGalatPeriode] = useState("")
  const [galatBaca, setGalatBaca] = useState(null)

  const ambil = useCallback((p) => {
    const t = setTimeout(() => setLambat(true), 300)
    return api(`/laporan?dari=${p.dari}&sampai=${p.sampai}`, { galatInline: true })
      .then((hasil) => {
        setData(hasil.data)
        setPeriode(p)
        setGalatBaca(null)
      })
      .catch((err) => setGalatBaca(err.status && err.status < 500 ? err.message : "Data belum bisa dimuat"))
      .finally(() => {
        clearTimeout(t)
        setMemuat(false)
        setLambat(false)
      })
  }, [])

  useEffect(() => {
    ambil(bulanBerjalan())
  }, [ambil])

  function tampilkan(e) {
    e.preventDefault()
    if (!isian.dari || !isian.sampai) {
      setGalatPeriode("Isi tanggal mulai dan tanggal akhir")
      return
    }
    if (isian.dari > isian.sampai) {
      setGalatPeriode("Tanggal mulai tidak boleh setelah tanggal akhir")
      return
    }
    setGalatPeriode("")
    setMemuat(true)
    ambil(isian)
  }

  function cobaLagi() {
    setMemuat(true)
    ambil(periode ?? bulanBerjalan())
  }

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Laporan</h1>

      <TabLaporan aktif={tab} onUbah={setTab} />

      <form onSubmit={tampilkan} noValidate className="mt-5">
        <div className="grid gap-4 min-[600px]:grid-cols-2 min-[1024px]:grid-cols-[1fr_1fr_auto] min-[1024px]:items-end">
          <div>
            <label htmlFor="dari" className="block text-body font-bold">
              Dari tanggal
            </label>
            <IsianTanggal
              id="dari"
              value={isian.dari}
              onChange={(v) => setIsian((lama) => ({ ...lama, dari: v }))}
              salah={Boolean(galatPeriode)}
              describedBy={galatPeriode ? "galat-periode" : undefined}
            />
          </div>
          <div>
            <label htmlFor="sampai" className="block text-body font-bold">
              Sampai tanggal
            </label>
            <IsianTanggal
              id="sampai"
              value={isian.sampai}
              onChange={(v) => setIsian((lama) => ({ ...lama, sampai: v }))}
              salah={Boolean(galatPeriode)}
              describedBy={galatPeriode ? "galat-periode" : undefined}
            />
          </div>
          <Tombol
            type="submit"
            disabled={!daring}
            memproses={memuat && data !== null}
            teksMemproses="Memuat..."
            className="w-full min-[600px]:col-span-2 min-[600px]:w-auto min-[600px]:justify-self-start min-[1024px]:col-span-1"
          >
            Tampilkan laporan
          </Tombol>
        </div>
        {galatPeriode && (
          <p id="galat-periode" role="alert" className="mt-2 text-small font-bold text-bata-700">
            {galatPeriode}
          </p>
        )}
      </form>

      {!daring && (
        <PesanInline
          varian="peringatan"
          ikon={WifiSlash}
          isi="Tidak ada koneksi. Angka di layar adalah data terakhir yang dimuat."
          className="mt-4"
        />
      )}

      {galatBaca && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi={galatBaca} className="mt-4">
          <Tombol varian="sekunder" disabled={!daring} onClick={cobaLagi}>
            Coba lagi
          </Tombol>
        </PesanInline>
      )}

      {data === null && memuat && lambat && (
        <div aria-busy="true" className="mt-6 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-7 rounded-1 bg-olive-50" />
          ))}
        </div>
      )}

      {data && periode && (
        <section
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          aria-busy={memuat || undefined}
          className="mt-6"
        >
          <p className="text-small text-ink-700">
            Periode <span className="font-bold text-ink-900">{teksPeriode(periode)}</span>
          </p>
          {tab === "setoran" ? (
            <TabelSetoranPerJenis data={data} periode={periode} />
          ) : (
            <TabelPenarikanPerStatus data={data} periode={periode} />
          )}
        </section>
      )}
    </main>
  )
}
