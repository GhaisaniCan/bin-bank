"use client"
import Link from "next/link"

import { useRef, useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import IsianKataSandi from "@/components/IsianKataSandi"
import PesanInline from "@/components/PesanInline"
import { api } from "@/lib/api"
import { tampilkanToast } from "@/lib/toast"

const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PESAN_TERPUTUS = "Belum dipastikan tersimpan. Periksa daftar nasabah sebelum mencoba lagi."
const GALAT_SERVER = {
  "Nama dan email wajib diisi": "nama",
  "Format email tidak valid": "email",
  "Password minimal 8 karakter": "password",
}

const dasarIsian = "h-12 w-full rounded-2 bg-putih px-3 text-body placeholder:text-ink-500"

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
  const [galat, setGalat] = useState({})
  const [berhasil, setBerhasil] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const terkirim = useRef(false)

  function periksa() {
    const g = {}
    if (!nama.trim()) g.nama = "Nama wajib diisi"
    if (!email.trim()) g.email = "Email wajib diisi"
    else if (!FORMAT_EMAIL.test(email.trim())) g.email = "Format email tidak valid"
    if (!password) g.password = "Password awal wajib diisi"
    else if (password.length < 8) g.password = "Password awal minimal 8 karakter"
    return g
  }

  function fokuskan(g) {
    const pertama = ["nama", "email", "password"].find((k) => g[k])
    if (pertama) document.getElementById(pertama)?.focus()
    return pertama
  }

  async function kirim(e) {
    e.preventDefault()
    if (terkirim.current) return
    const g = periksa()
    setGalat(g)
    if (fokuskan(g)) return

    terkirim.current = true
    setMenyimpan(true)
    try {
      const hasil = await api("/users", {
        method: "POST",
        body: { nama: nama.trim(), email: email.trim(), password, role: "nasabah" },
        galatInline: true,
        aksesInline: true,
      })
      const data = hasil?.data ?? {}
      setBerhasil({ id: data.id ?? data._id, nama: data.nama, email: data.email, password })
      setNama("")
      setEmail("")
      setPassword("")
      setGalat({})
      tampilkanToast("Nasabah terdaftar")
      window.scrollTo(0, 0)
    } catch (err) {
      const status = err?.status ?? 0
      const kolom = status === 400 ? GALAT_SERVER[err.message] : null
      if (status === 409) {
        const g = { email: err.message || "Email sudah terdaftar" }
        setGalat(g)
        fokuskan(g)
      } else if (kolom) {
        const g = { [kolom]: err.message }
        setGalat(g)
        fokuskan(g)
      } else if (status === 0 || status >= 500) {
        setGalat({ umum: PESAN_TERPUTUS })
      } else {
        setGalat({ umum: err.message })
      }
    } finally {
      terkirim.current = false
      setMenyimpan(false)
    }
  }

  function ulang() {
    setNama("")
    setEmail("")
    setPassword("")
    setGalat({})
    setBerhasil(null)
  }

  if (berhasil) {
    return (
      <main className="mx-auto max-w-[640px] p-4">
        <h1 className="text-h1 font-bold">Nasabah terdaftar</h1>

        <dl className="mt-5 bg-olive-50 p-4">
          <dt className="text-small text-ink-700">Nama</dt>
          <dd className="text-body font-bold">{berhasil.nama}</dd>
          <dt className="mt-3 text-small text-ink-700">Email</dt>
          <dd className="text-body font-bold">{berhasil.email}</dd>
          <dt className="mt-3 text-small text-ink-700">Password awal</dt>
          <dd className="text-h2 font-bold tabular-nums">{berhasil.password}</dd>
        </dl>

        <p className="mt-3 text-small text-ink-700">
          Password awal tidak bisa dilihat lagi setelah layar ini ditutup.
          Nasabah wajib menggantinya saat masuk pertama kali.
        </p>

        <Link
          href={`/petugas/setoran/baru?nasabah=${encodeURIComponent(berhasil.id)}`}
          className="mt-5 flex h-12 items-center justify-center rounded-2 bg-olive-700 text-body font-bold text-putih hover:bg-olive-800 hover-tombol"
        >
          Catat setoran untuk nasabah ini
        </Link>
        <button
          type="button"
          onClick={ulang}
          className="mt-3 h-12 w-full rounded-2 border border-line-500 text-body font-bold hover:bg-olive-50 hover-tombol"
        >
          Daftarkan nasabah lain
        </button>
      </main>
    )
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
            placeholder="Masukkan nama nasabah"
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
            placeholder="Masukkan email nasabah"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={galat.email ? "true" : "false"}
            aria-describedby={galat.email ? "galat-email" : undefined}
            className={kelasIsian(galat.email)}
          />
        </div>
        <Galat id="galat-email" pesan={galat.email} />

        <div className="mt-4">
          <IsianKataSandi
            id="password"
            label="Password awal"
            placeholder="Masukkan password awal nasabah"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            galat={galat.password}
            bantuan="Nasabah wajib menggantinya saat masuk pertama kali"
          />
        </div>

        {galat.umum && (
          <PesanInline varian="galat" ikon={WarningOctagon} judul="Nasabah belum terdaftar" isi={galat.umum} className="mt-4" />
        )}

        <button
          type="submit"
          disabled={menyimpan}
          aria-busy={menyimpan || undefined}
          className="mt-5 h-12 w-full rounded-2 bg-olive-700 text-body font-bold text-putih enabled:hover:bg-olive-800 disabled:bg-olive-50 disabled:text-ink-500 hover-tombol"
        >
          {menyimpan ? "Mendaftarkan..." : "Daftarkan nasabah"}
        </button>
      </form>
    </main>
  )
}