"use client"

import { useMemo, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MagnifyingGlass, Warning, WarningOctagon } from "@phosphor-icons/react"
import PesanInline from "@/components/PesanInline"
import Tombol, { kelasTombol } from "@/components/Tombol"
import { formatBerat } from "@/components/TabelSetoran"
import { formatRupiah } from "@/lib/format"
import { api } from "@/lib/api"

const KUNCI_DRAF = "binbank_draf_setoran"
const KUNCI_HASIL = "binbank_hasil_setoran"
const PESAN_TERPUTUS = "Belum dipastikan tersimpan. Periksa daftar setoran sebelum mencoba lagi."

const kelasTombolNavigasi = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} gap-2 hover:bg-olive-50 active:bg-olive-50`

function tanpaLangganan() {
  return () => {}
}

function drafSesi() {
  try {
    return sessionStorage.getItem(KUNCI_DRAF)
  } catch {
    return null
  }
}

function drafServer() {
  return undefined
}

export default function Halaman() {
  const router = useRouter()
  const mentah = useSyncExternalStore(tanpaLangganan, drafSesi, drafServer)
  const draf = useMemo(() => {
    if (mentah === undefined) return undefined
    try {
      return JSON.parse(mentah)
    } catch {
      return null
    }
  }, [mentah])
  const [memproses, setMemproses] = useState(false)
  const [galat, setGalat] = useState(null)
  const terkirim = useRef(false)

  if (draf === undefined) return null

  if (!draf || !draf.rincian?.length) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Tidak ada setoran yang sedang disiapkan</h1>
        <p className="mt-2 text-body text-ink-700">Mulai dari memilih nasabah.</p>
        <Link href="/petugas/setoran/baru" className={`${kelasTombolNavigasi} mt-4`}>
          <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="shrink-0" />
          Cari nasabah
        </Link>
      </main>
    )
  }

  const belumPasti = galat?.belumPasti === true

  async function simpan() {
    if (terkirim.current || belumPasti) return
    terkirim.current = true
    setMemproses(true)
    setGalat(null)

    const body = {
      nasabah: draf.nasabahId,
      rincian: draf.rincian.map((r) => ({ jenisSampah: r.jenisId, berat: Number(r.berat) })),
    }
    if (typeof draf.catatan === "string" && draf.catatan.trim()) body.catatan = draf.catatan.trim()

    try {
      const respons = await api("/setoran", { method: "POST", body, galatInline: true, aksesInline: true })
      sessionStorage.setItem(
        KUNCI_HASIL,
        JSON.stringify({
          setoran: respons.data.setoran,
          saldoTerkini: respons.data.saldoTerkini,
          emailNasabah: draf.nasabah?.email ?? "",
        })
      )
      router.push("/petugas/setoran/baru/tersimpan")
    } catch (err) {
      const status = err?.status ?? 0
      if (status === 0 || status >= 500) {
        setGalat({ belumPasti: true, pesan: PESAN_TERPUTUS })
      } else {
        setGalat({ belumPasti: false, pesan: err.message })
        terkirim.current = false
      }
      setMemproses(false)
    }
  }

  function kembali() {
    router.push(`/petugas/setoran/baru?nasabah=${draf.nasabahId}`)
  }

  const kelasKepala = "border-b border-line-300 px-2 py-3 text-small font-bold text-ink-700"
  const kelasSel = "px-2 py-3 align-top"

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Periksa setoran</h1>

      <PesanInline
        varian="peringatan"
        ikon={Warning}
        isi="Setoran yang sudah disimpan tidak bisa diubah. Hanya admin yang bisa membatalkan."
        className="mt-4"
      />

      <section
        aria-label="Ringkasan setoran"
        className="mt-6 rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
      >
        <dl>
          <dt className="text-small text-ink-700">Nasabah</dt>
          <dd className="text-body font-bold">{draf.nasabah.nama}</dd>
          <dd className="text-small text-ink-700">{draf.nasabah.email}</dd>
        </dl>
        <p className="mt-2 text-small text-ink-700">Tanggal dicatat otomatis saat disimpan</p>

        <h2 className="mt-6 text-h3 font-bold">Rincian sampah</h2>

        <ul className="mt-2 border-t border-line-300 min-[600px]:hidden">
          {draf.rincian.map((r, i) => (
            <li key={i} className="border-b border-line-300 py-3">
              <span className="flex items-start justify-between gap-3">
                <span className="text-body font-bold">{r.nama}</span>
                <span className="text-amount font-bold tabular-nums">{formatRupiah(r.subtotal)}</span>
              </span>
              <span className="mt-1 block text-small tabular-nums text-ink-700">
                {formatBerat(r.berat)} × {formatRupiah(r.harga)} per kg
              </span>
            </li>
          ))}
        </ul>

        <table
          aria-label="Rincian sampah"
          className="mt-2 hidden w-full border-collapse text-body min-[600px]:table"
        >
          <thead>
            <tr>
              <th scope="col" className={`${kelasKepala} text-left`}>Jenis sampah</th>
              <th scope="col" className={`${kelasKepala} text-right`}>Berat (kg)</th>
              <th scope="col" className={`${kelasKepala} text-right`}>Harga per kg (Rp)</th>
              <th scope="col" className={`${kelasKepala} text-right`}>Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {draf.rincian.map((r, i) => (
              <tr key={i} className="border-b border-line-300">
                <td className={kelasSel}>{r.nama}</td>
                <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatBerat(r.berat)}</td>
                <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatRupiah(r.harga)}</td>
                <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatRupiah(r.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t-[3px] border-double border-ink-900 pt-3">
          <dl className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-body text-ink-700">Total berat</dt>
              <dd className="text-amount font-bold tabular-nums">{formatBerat(draf.totalBerat)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-body text-ink-700">Total nilai</dt>
              <dd className="text-display font-bold tabular-nums">{formatRupiah(draf.totalNilai)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {galat && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi={galat.pesan} className="mt-5">
          {galat.belumPasti && (
            <Link href="/petugas/setoran" className="text-body font-bold text-olive-700 underline">
              Lihat daftar setoran
            </Link>
          )}
        </PesanInline>
      )}

      <div className="mt-5">
        <Tombol
          memproses={memproses}
          disabled={belumPasti}
          teksMemproses="Menyimpan..."
          onClick={simpan}
          className="w-full min-[600px]:w-auto"
        >
          Simpan setoran {formatRupiah(draf.totalNilai)}
        </Tombol>
        <div className="mt-5">
          <Tombol varian="sekunder" disabled={memproses} onClick={kembali} className="w-full min-[600px]:w-auto">
            Kembali dan ubah
          </Tombol>
        </div>
      </div>
    </main>
  )
}
