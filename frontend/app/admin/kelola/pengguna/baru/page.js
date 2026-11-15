"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { useDaring } from "@/lib/koneksi"
import IsianKataSandi from "@/components/IsianKataSandi"
import IsianTeks from "@/components/IsianTeks"
import KotakRahasia, { buatPasswordAcak } from "@/components/KotakRahasia"
import PesanInline from "@/components/PesanInline"
import PilihanMetode from "@/components/PilihanMetode"
import Tombol from "@/components/Tombol"

const OPSI_PERAN = [
  { nilai: "petugas", label: "Petugas", penjelasan: "Mencatat setoran dan memproses penarikan" },
  { nilai: "admin", label: "Admin", penjelasan: "Mengelola harga, akun, pembatalan, dan laporan" },
  { nilai: "nasabah", label: "Nasabah", penjelasan: "Warga yang menabung sampah" },
]

const LABEL_PERAN = { nasabah: "Nasabah", petugas: "Petugas", admin: "Admin" }
const KOSONG = { role: "petugas", nama: "", email: "", password: "" }

export default function Halaman() {
  const daring = useDaring()
  const refNama = useRef(null)
  const [isian, setIsian] = useState(KOSONG)
  const [galat, setGalat] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [berhasil, setBerhasil] = useState(null)

  function ubah(kunci) {
    return (e) => setIsian((lama) => ({ ...lama, [kunci]: e.target.value }))
  }

  function periksa() {
    const g = {}
    if (!isian.nama.trim()) g.nama = "Nama wajib diisi"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(isian.email.trim())) g.email = "Format email tidak valid"
    if (isian.password.length < 8) g.password = "Password awal minimal 8 karakter"
    return g
  }

  async function kirim(e) {
    e.preventDefault()
    const g = periksa()
    setGalat(g)
    const pertama = ["nama", "email", "password"].find((k) => g[k])
    if (pertama) {
      document.getElementById(pertama)?.focus()
      return
    }

    setMenyimpan(true)
    try {
      const hasil = await api("/users", {
        method: "POST",
        body: {
          nama: isian.nama.trim(),
          email: isian.email.trim(),
          password: isian.password,
          role: isian.role,
        },
        galatInline: true,
      })
      setBerhasil({ ...hasil.data, password: isian.password })
      window.scrollTo(0, 0)
    } catch (err) {
      if (err.status === 409) {
        setGalat({ email: "Email ini sudah terdaftar" })
        document.getElementById("email")?.focus()
      } else if (err.status) {
        setGalat({ umum: err.message })
      } else {
        setGalat({ umum: "Belum dipastikan tersimpan. Periksa daftar pengguna sebelum mencoba lagi." })
      }
    } finally {
      setMenyimpan(false)
    }
  }

  function ulang() {
    setIsian(KOSONG)
    setGalat({})
    setBerhasil(null)
    setTimeout(() => refNama.current?.focus(), 0)
  }

  if (berhasil) {
    return (
      <main className="max-w-[640px] pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Akun dibuat</h1>

        <dl className="mt-5 space-y-3">
          <div>
            <dt className="text-small text-ink-700">Nama</dt>
            <dd className="font-bold break-words">{berhasil.nama}</dd>
          </div>
          <div>
            <dt className="text-small text-ink-700">Email</dt>
            <dd className="font-bold break-all">{berhasil.email}</dd>
          </div>
          <div>
            <dt className="text-small text-ink-700">Peran</dt>
            <dd className="font-bold">{LABEL_PERAN[berhasil.role] ?? berhasil.role}</dd>
          </div>
        </dl>

        <KotakRahasia label="Password awal" nilai={berhasil.password} className="mt-5" />
        <p className="mt-3">Sampaikan langsung ke pemilik akun. Ia wajib menggantinya saat masuk pertama kali.</p>

        <div className="mt-6 flex flex-col gap-4 min-[600px]:flex-row">
          <Link
            href="/admin/kelola/pengguna"
            className="flex h-7 items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800"
          >
            Kembali ke daftar pengguna
          </Link>
          <Tombol varian="sekunder" onClick={ulang}>
            Buat akun lain
          </Tombol>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[640px] pb-[96px] min-[600px]:pb-6">
      <Link href="/admin/kelola/pengguna" className="text-small text-olive-700 underline">
        Pengguna
      </Link>
      <h1 className="mt-1 text-h1 font-bold text-forest-900">Buat akun</h1>

      {!daring && (
        <PesanInline
          varian="peringatan"
          ikon={WifiSlash}
          isi="Tidak ada koneksi. Membuat akun dimatikan sampai koneksi kembali."
          className="mt-4"
        />
      )}

      <form id="form-akun" onSubmit={kirim} noValidate className="mt-5 space-y-4">
        <PilihanMetode
          nama="peran"
          legenda="Peran"
          opsi={OPSI_PERAN}
          nilai={isian.role}
          onChange={(role) => setIsian((lama) => ({ ...lama, role }))}
          disabled={menyimpan}
        />
        <IsianTeks
          id="nama"
          ref={refNama}
          label="Nama"
          autoComplete="off"
          maxLength={80}
          value={isian.nama}
          onChange={ubah("nama")}
          galat={galat.nama}
        />
        <IsianTeks
          id="email"
          type="email"
          label="Email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={isian.email}
          onChange={ubah("email")}
          galat={galat.email}
        />
        <div>
          <IsianKataSandi
            id="password"
            label="Password awal"
            autoComplete="new-password"
            value={isian.password}
            onChange={ubah("password")}
            galat={galat.password}
            bantuan="Minimal 8 karakter. Pemilik akun wajib menggantinya saat masuk pertama kali."
          />
          <Tombol
            varian="teks"
            disabled={menyimpan}
            onClick={() => setIsian((lama) => ({ ...lama, password: buatPasswordAcak() }))}
            className="mt-2 -ml-2"
          >
            Buat otomatis
          </Tombol>
        </div>

        {galat.umum && (
          <PesanInline varian="galat" ikon={WarningOctagon} judul="Akun belum dibuat" isi={galat.umum} />
        )}
      </form>

      <div className="fixed inset-x-0 bottom-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] z-10 border-t border-line-300 bg-putih p-4 min-[600px]:static min-[600px]:mt-6 min-[600px]:border-0 min-[600px]:p-0">
        <Tombol
          type="submit"
          form="form-akun"
          disabled={!daring}
          memproses={menyimpan}
          teksMemproses="Membuat akun..."
          className="w-full min-[600px]:w-auto"
        >
          Buat akun
        </Tombol>
      </div>
    </main>
  )
}
