"use client"

import { useState } from "react"

const kelasIsian =
  "h-12 w-full rounded-2 border border-line-500 bg-putih px-3 text-body"

export default function Halaman() {
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lihat, setLihat] = useState(false)

  function kirim(e) {
    e.preventDefault()
  }

  return (
    <main className="mx-auto max-w-[640px] p-4">
      <h1 className="text-h1 font-bold">Daftarkan nasabah</h1>

      <form onSubmit={kirim} noValidate className="mt-5">
        <label htmlFor="nama" className="block text-body font-bold">
          Nama
        </label>
        <div className="mt-2">
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={kelasIsian}
          />
        </div>

        <label htmlFor="email" className="mt-4 block text-body font-bold">
          Email
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={kelasIsian}
          />
        </div>

        <label htmlFor="password" className="mt-4 block text-body font-bold">
          Password awal
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            type={lihat ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={`${kelasIsian} pr-24`}
          />
          <button
            type="button"
            onClick={() => setLihat(!lihat)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body text-olive-700 underline"
          >
            {lihat ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <p className="mt-2 text-small text-ink-500">
          Nasabah wajib menggantinya saat masuk pertama kali
        </p>

        <button
          type="submit"
          className="mt-5 h-12 w-full rounded-2 bg-olive-700 text-body font-bold text-putih hover:bg-olive-800"
        >
          Daftarkan nasabah
        </button>
      </form>
    </main>
  )
}