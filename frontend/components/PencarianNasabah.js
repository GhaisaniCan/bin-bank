"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserPlus, WarningOctagon } from "@phosphor-icons/react"
import IsianTeks from "@/components/IsianTeks"
import PesanInline from "@/components/PesanInline"
import Tombol, { kelasTombol } from "@/components/Tombol"
import { api } from "@/lib/api"

const LIMIT_HASIL = 10
const JEDA_KETIK = 300

const kelasPilUtama =
  "relative inline-flex h-[40px] w-fit items-center justify-center rounded-full bg-olive-700 px-5 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol after:absolute after:inset-x-0 after:-inset-y-[2px]"

const kelasPilSekunder =
  "relative inline-flex h-[40px] w-fit items-center justify-center rounded-full border border-line-500 bg-putih px-5 text-body font-bold text-ink-900 hover:bg-olive-50 active:bg-olive-50 hover-tombol after:absolute after:inset-x-0 after:-inset-y-[2px]"

export default function PencarianNasabah({ hrefPilih, hrefProfil }) {
  const [kata, setKata] = useState("")
  const [putaran, setPutaran] = useState(0)
  const [hasil, setHasil] = useState({ q: null, putaran: -1, data: [], total: 0, galat: false })
  const q = kata.trim()
  const cukup = q.length >= 2

  const terkini = hasil.q === q && hasil.putaran === putaran
  const memuat = cukup && !terkini
  const galat = cukup && terkini && hasil.galat
  const daftar = cukup && terkini && !hasil.galat ? hasil.data : []
  const kosong = cukup && terkini && !hasil.galat && daftar.length === 0

  // Pencarian
  useEffect(() => {
    if (q.length < 2) return
    const pengendali = new AbortController()
    const dasar = { q, putaran, data: [], total: 0, galat: false }
    const jeda = setTimeout(() => {
      const kueri = new URLSearchParams({ cari: q, halaman: "1", limit: String(LIMIT_HASIL) })
      api(`/users?${kueri}`, { galatInline: true, signal: pengendali.signal })
        .then((respons) => {
          if (pengendali.signal.aborted) return
          const data = (respons?.data ?? []).map((n) => ({ id: String(n._id), nama: n.nama, email: n.email }))
          setHasil({ ...dasar, data, total: respons?.paginasi?.total ?? data.length })
        })
        .catch(() => {
          if (!pengendali.signal.aborted) setHasil({ ...dasar, galat: true })
        })
    }, JEDA_KETIK)
    return () => {
      clearTimeout(jeda)
      pengendali.abort()
    }
  }, [q, putaran])

  return (
    <div>
      <IsianTeks
        id="cari-nasabah"
        label="Nama atau email"
        bantuan="Ketik minimal dua huruf nama atau email"
        value={kata}
        onChange={(e) => setKata(e.target.value)}
        autoComplete="off"
        autoFocus
      />

      <div aria-busy={memuat || undefined}>
        {memuat && (
          <p className="mt-5 text-body text-ink-700" role="status">
            Mencari nasabah…
          </p>
        )}

        {galat && (
          <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat" className="mt-5">
            <Tombol varian="sekunder" onClick={() => setPutaran((n) => n + 1)}>
              Coba lagi
            </Tombol>
          </PesanInline>
        )}

        {kosong && (
          <p className="mt-5 text-body" role="status">
            Tidak ada nasabah yang cocok
          </p>
        )}

        {daftar.length > 0 && (
          <>
            <ul className="mt-5 flex flex-col gap-3" aria-label="Hasil pencarian nasabah">
              {daftar.map((n) => (
                <li key={n.id} className="rounded-2 border border-line-300 bg-putih p-4">
                  <p className="text-body font-bold">{n.nama}</p>
                  <p className="text-small text-ink-700">{n.email}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link href={hrefPilih(n.id)} className={kelasPilUtama}>
                      Catat setoran
                    </Link>
                    <Link href={hrefProfil(n.id)} className={kelasPilSekunder}>
                      Lihat profil
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            {hasil.total > LIMIT_HASIL && (
              <p className="mt-3 text-small text-ink-700" role="status">
                Menampilkan {daftar.length} dari {hasil.total}, persempit pencarian.
              </p>
            )}
          </>
        )}
      </div>

      <Link
        href="/petugas/daftarkan-nasabah"
        className={`${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} mt-5 w-full gap-2 hover:bg-olive-50 active:bg-olive-50 min-[600px]:w-auto`}
      >
        <UserPlus size={20} weight="regular" aria-hidden="true" className="shrink-0" />
        Daftarkan nasabah baru
      </Link>
    </div>
  )
}
