"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus } from "@phosphor-icons/react"
import IsianTeks from "@/components/IsianTeks"
import { kelasTombol } from "@/components/Tombol"

const NASABAH_CONTOH = [
  { id: "1", nama: "Sari Wulandari", email: "sari@contoh.com" },
  { id: "2", nama: "Budi Santoso", email: "budi@contoh.com" },
  { id: "3", nama: "Sari Dewi", email: "saridewi@contoh.com" },
  { id: "4", nama: "Joko Prasetyo", email: "joko@contoh.com" },
]

const kelasPilUtama =
  "relative inline-flex h-[40px] w-fit items-center justify-center rounded-full bg-olive-700 px-5 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol after:absolute after:inset-x-0 after:-inset-y-[2px]"

const kelasPilSekunder =
  "relative inline-flex h-[40px] w-fit items-center justify-center rounded-full border border-line-500 bg-putih px-5 text-body font-bold text-ink-900 hover:bg-olive-50 active:bg-olive-50 hover-tombol after:absolute after:inset-x-0 after:-inset-y-[2px]"

export default function PencarianNasabah({ hrefPilih, hrefProfil }) {
  const [kata, setKata] = useState("")
  const q = kata.trim().toLowerCase()
  const hasil =
    q.length >= 2
      ? NASABAH_CONTOH.filter(
          (n) => n.nama.toLowerCase().includes(q) || n.email.toLowerCase().includes(q)
        )
      : []

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

      {q.length >= 2 && hasil.length === 0 && (
        <p className="mt-5 text-body" role="status">
          Tidak ada nasabah dengan nama atau email itu
        </p>
      )}

      {hasil.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3" aria-label="Hasil pencarian nasabah">
          {hasil.map((n) => (
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
      )}

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
