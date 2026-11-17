"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowRight, FileText, HandCoins, WarningOctagon } from "@phosphor-icons/react"
import KartuRingkasan from "@/components/KartuRingkasan"
import TabelSetoran from "@/components/TabelSetoran"
import PesanInline from "@/components/PesanInline"
import Tombol, { kelasTombol } from "@/components/Tombol"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"

const kelasUtama =
  "inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol min-[600px]:w-auto"

const kelasTombolSekunder = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} w-full gap-2 hover:bg-olive-50 active:bg-olive-50 min-[600px]:w-auto`

const KELAS_DERET = "flex flex-wrap items-stretch gap-3 pb-3"

const KELAS_ITEM = "flex min-w-0 max-w-[13rem] flex-1 basis-[9.5rem] items-stretch"

const tanpaLangganan = () => () => {}
const namaSesi = () => ambilUser()?.nama ?? ""
const namaServer = () => ""

function GalatMuat({ onUlang }) {
  return (
    <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat">
      <Tombol varian="sekunder" onClick={onUlang}>
        Coba lagi
      </Tombol>
    </PesanInline>
  )
}

export default function Halaman() {
  const nama = useSyncExternalStore(tanpaLangganan, namaSesi, namaServer)
  const [proses, setProses] = useState(null)
  const [memuatProses, setMemuatProses] = useState(true)
  const [galatProses, setGalatProses] = useState(false)
  const [putaranProses, setPutaranProses] = useState(0)
  const [setoran, setSetoran] = useState(null)
  const [memuatSetoran, setMemuatSetoran] = useState(true)
  const [galatSetoran, setGalatSetoran] = useState(false)
  const [putaranSetoran, setPutaranSetoran] = useState(0)

  // Perlu diproses
  useEffect(() => {
    let hidup = true
    const hitung = (status) =>
      api(`/penarikan?status=${status}&limit=1`, { galatInline: true }).then((h) => h?.paginasi?.total ?? 0)
    Promise.all([hitung("diajukan"), hitung("disetujui")])
      .then(([menunggu, disetujui]) => {
        if (!hidup) return
        setProses({ menunggu, disetujui })
        setGalatProses(false)
      })
      .catch(() => {
        if (hidup) setGalatProses(true)
      })
      .finally(() => {
        if (hidup) setMemuatProses(false)
      })
    return () => {
      hidup = false
    }
  }, [putaranProses])

  // Setoran terakhir
  useEffect(() => {
    let hidup = true
    api("/setoran?halaman=1&limit=5", { galatInline: true })
      .then((hasil) => {
        if (!hidup) return
        setSetoran(hasil?.data ?? [])
        setGalatSetoran(false)
      })
      .catch(() => {
        if (hidup) setGalatSetoran(true)
      })
      .finally(() => {
        if (hidup) setMemuatSetoran(false)
      })
    return () => {
      hidup = false
    }
  }, [putaranSetoran])

  const ulangProses = useCallback(() => {
    setMemuatProses(true)
    setPutaranProses((n) => n + 1)
  }, [])

  const ulangSetoran = useCallback(() => {
    setMemuatSetoran(true)
    setPutaranSetoran((n) => n + 1)
  }, [])

  const kosong = proses?.menunggu === 0 && proses?.disetujui === 0

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Beranda</h1>
      {nama && <p className="mt-2 text-small text-olive-700">{nama}</p>}

      <div className="mt-6">
        <Link href="/petugas/setoran/baru" className={kelasUtama}>
          Catat setoran
        </Link>
      </div>

      <section aria-labelledby="judul-proses" className="mt-6">
        <h2 id="judul-proses" className="text-h2 font-bold">
          Perlu diproses
        </h2>
        <div aria-busy={memuatProses || undefined}>
          {galatProses && !memuatProses ? (
            <div className="mt-4">
              <GalatMuat onUlang={ulangProses} />
            </div>
          ) : !proses ? (
            <p className="mt-2 text-body text-ink-700" role="status">
              Memuat pengajuan…
            </p>
          ) : kosong ? (
            <p className="mt-2 text-body text-ink-700">Tidak ada pengajuan yang perlu diproses</p>
          ) : (
            <ul className={`mt-4 ${KELAS_DERET}`}>
              <li className={KELAS_ITEM}>
                <KartuRingkasan
                  href="/petugas/penarikan"
                  ukuran="ringkas"
                  ikon={FileText}
                  label="Pengajuan menunggu keputusan"
                  angka={proses.menunggu}
                />
              </li>
              <li className={KELAS_ITEM}>
                <KartuRingkasan
                  href="/petugas/penarikan"
                  ukuran="ringkas"
                  ikon={HandCoins}
                  label="Dana disetujui yang perlu diserahkan"
                  angka={proses.disetujui}
                />
              </li>
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="judul-terakhir" className="mt-6">
        <h2 id="judul-terakhir" className="text-h2 font-bold">
          Setoran terakhir
        </h2>
        <div aria-busy={memuatSetoran || undefined} className="mt-4">
          {galatSetoran && !memuatSetoran ? (
            <GalatMuat onUlang={ulangSetoran} />
          ) : !setoran ? (
            <p className="text-body text-ink-700" role="status">
              Memuat setoran…
            </p>
          ) : setoran.length === 0 ? (
            <p className="text-body text-ink-700">Belum ada setoran</p>
          ) : (
            <TabelSetoran baris={setoran} />
          )}
          <Link href="/petugas/setoran" className={`${kelasTombolSekunder} mt-4`}>
            Lihat semua setoran
            <ArrowRight size={20} weight="regular" aria-hidden="true" className="shrink-0" />
          </Link>
        </div>
      </section>
    </main>
  )
}
