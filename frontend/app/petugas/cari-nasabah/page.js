"use client"

import { useState } from "react"
import Link from "next/link"

const NASABAH_CONTOH = [
  { id: "1", nama: "Sari Wulandari", email: "sari@contoh.com" },
  { id: "2", nama: "Budi Santoso", email: "budi@contoh.com" },
  { id: "3", nama: "Sari Dewi", email: "saridewi@contoh.com" },
  { id: "4", nama: "Joko Prasetyo", email: "joko@contoh.com" },
]

export default function Halaman() {
  const [kata, setKata] = useState("")
  const q = kata.trim().toLowerCase()
  const hasil =
    q.length >= 2
      ? NASABAH_CONTOH.filter(
          (n) =>
            n.nama.toLowerCase().includes(q) ||
            n.email.toLowerCase().includes(q)
        )
      : []

  return (
    <main className="mx-auto max-w-[640px] p-4">
      <h1 className="text-h1 font-bold">Cari nasabah</h1>

      <div className="mt-5">
        <label htmlFor="cari" className="block text-body font-bold">
          Nama atau email
        </label>
        <input
          id="cari"
          type="text"
          value={kata}
          onChange={(e) => setKata(e.target.value)}
          autoFocus
          className="mt-2 h-12 w-full rounded-2 border border-line-500 bg-putih px-3 text-body"
        />
      </div>

      {q.length < 2 ? (
        <p className="mt-2 text-small text-ink-500">
          Ketik minimal dua huruf nama atau email
        </p>
      ) : hasil.length === 0 ? (
        <div className="mt-5">
          <p className="text-body">Tidak ada nasabah dengan nama atau email itu</p>
          <Link
            href="/petugas/daftarkan-nasabah"
            className="mt-3 inline-block text-body text-olive-700 underline"
          >
            Daftarkan nasabah baru
          </Link>
        </div>
      ) : (
        <ul className="mt-5 border-t border-line-300">
          {hasil.map((n) => (
            <li key={n.id} className="border-b border-line-300">
              <Link
                href={`/petugas/nasabah/${n.id}`}
                className="block min-h-[64px] px-1 py-3 hover:bg-olive-50"
              >
                <span className="block text-body font-bold">{n.nama}</span>
                <span className="block text-small text-ink-700">{n.email}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}