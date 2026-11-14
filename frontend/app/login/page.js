"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import { ambilToken, ambilUser, simpanSesi, BERANDA } from "@/lib/auth"
import { useDaring } from "@/lib/koneksi"
import PesanInline from "@/components/PesanInline"
import IsianTeks from "@/components/IsianTeks"
import IsianKataSandi from "@/components/IsianKataSandi"
import Tombol from "@/components/Tombol"

const PESAN_KOSONG = "Isi email dan password."
const PESAN_DITOLAK = "Email atau password tidak cocok, atau akun tidak aktif."
const PESAN_TERPUTUS = "BinBank sedang tidak bisa dihubungi. Coba lagi sebentar lagi."

function tujuan(user) {
  if (!user) return null
  if (user.wajibGantiPassword === true) return "/ganti-password-wajib"
  return BERANDA[user.role] ?? null
}

// Halaman
export default function Halaman() {
  const router = useRouter()
  const daring = useDaring()
  const refEmail = useRef(null)
  const refPassword = useRef(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [memproses, setMemproses] = useState(false)
  const [galat, setGalat] = useState(null)

  useEffect(() => {
    if (!ambilToken()) return
    const alamat = tujuan(ambilUser())
    if (alamat) router.replace(alamat)
  }, [router])

  function tampilkanGalat(teks) {
    setGalat((lama) => ({ teks, kunci: (lama?.kunci ?? 0) + 1 }))
  }

  async function kirim(e) {
    e.preventDefault()
    if (!daring || memproses) return

    if (!email.trim() || !password) {
      tampilkanGalat(PESAN_KOSONG)
      ;(email.trim() ? refPassword : refEmail).current?.focus()
      return
    }

    setGalat(null)
    setMemproses(true)

    try {
      const hasil = await api("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
        tanpaRedirect: true,
      })
      simpanSesi(hasil.data.token, hasil.data.user)
      router.replace(tujuan(hasil.data.user) ?? "/")
    } catch (err) {
      setMemproses(false)
      const status = err instanceof ApiError ? err.status : 0
      if (status === 401) {
        tampilkanGalat(PESAN_DITOLAK)
        setPassword("")
        refPassword.current?.focus()
      } else if (status === 0 || status >= 500) {
        tampilkanGalat(PESAN_TERPUTUS)
      } else {
        tampilkanGalat(err.message)
      }
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <main className="mx-auto w-full max-w-[400px]">
        <p className="text-h2 font-bold text-forest-900">BinBank</p>
        <h1 className="mt-2 text-h1 font-bold text-ink-900">Masuk</h1>

        <form noValidate onSubmit={kirim} className="mt-6 flex flex-col gap-4">
          {galat && <PesanInline key={galat.kunci} varian="galat" isi={galat.teks} />}

          <IsianTeks
            ref={refEmail}
            id="email"
            label="Email"
            placeholder="Masukkan email Anda"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <IsianKataSandi
            ref={refPassword}
            id="password"
            label="Password"
            placeholder="Masukkan password Anda"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-2">
            <Tombol
              type="submit"
              varian="utama"
              className="w-full"
              memproses={memproses}
              disabled={!daring}
              aria-describedby={daring ? undefined : "alasan-nonaktif"}
            >
              Masuk
            </Tombol>
            {!daring && (
              <p id="alasan-nonaktif" className="mt-2 text-small text-ink-700">
                Masuk membutuhkan koneksi
              </p>
            )}
          </div>
        </form>

        <p className="mt-4 text-small text-ink-500">
          Lupa password? Minta admin atau petugas RW mengatur ulang.
        </p>
      </main>
    </div>
  )
}
