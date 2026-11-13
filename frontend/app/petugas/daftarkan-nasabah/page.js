"use client"

import { useState } from "react"

const dasarIsian = "h-12 w-full rounded-2 bg-putih px-3 text-body"

function kelasIsian(salah) {
  return `${dasarIsian} ${salah ? "border-2 border-bata-700" : "border border-line-500"}`
}

function Galat({ id, pesan }) {
  if (!pesan) return null
  return (
    <p id={id} role="alert" className="mt-2 text-small font-bold text-bata-700">
      {pesan}
    </p>
  )
}

export default function Halaman() {
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lihat, setLihat] = useState(false)
  const [galat, setGalat] = useState({})

  function periksa() {
    const g = {}
    if (!nama.trim()) g.nama = "Nama wajib diisi"
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      g.email = "Format email tidak valid"
    } else if (email.trim().toLowerCase() === "sari@contoh.com") {
      g.email = "Email ini sudah terdaftar atas nama Sari Wulandari"
    }
    if (password.length < 8) g.password = "Password awal minimal 8 karakter"
    return g
  }

  function kirim(e) {
    e.preventDefault()
    const g = periksa()
    setGalat(g)
    const pertama = ["nama", "email", "password"].find((k) => g[k])
    if (pertama) document.getElementById(pertama)?.focus()
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
            aria-invalid={galat.nama ? "true" : "false"}
            aria-describedby={galat.nama ? "galat-nama" : undefined}
            className={kelasIsian(galat.nama)}
          />
        </div>
        <Galat id="galat-nama" pesan={galat.nama} />

        <label htmlFor="email" className="mt-4 block text-body font-bold">
          Email
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={galat.email ? "true" : "false"}
            aria-describedby={galat.email ? "galat-email" : undefined}
            className={kelasIsian(galat.email)}
          />
        </div>
        <Galat id="galat-email" pesan={galat.email} />

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
            aria-invalid={galat.password ? "true" : "false"}
            aria-describedby={galat.password ? "galat-password" : undefined}
            className={`${kelasIsian(galat.password)} pr-24`}
          />
          <button
            type="button"
            onClick={() => setLihat(!lihat)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body text-olive-700 underline"
          >
            {lihat ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <Galat id="galat-password" pesan={galat.password} />
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