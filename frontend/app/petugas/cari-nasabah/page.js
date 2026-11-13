"use client"

import { useState } from "react"

export default function Halaman() {
  const [kata, setKata] = useState("")

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
        <p className="mt-2 text-small text-ink-500">
          Ketik minimal dua huruf nama atau email
        </p>
      </div>
    </main>
  )
}