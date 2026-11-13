"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import { hapusSesi, simpanSesi } from "@/lib/auth"
import { useDaring } from "@/lib/koneksi"
import PesanInline from "@/components/PesanInline"
import IsianKataSandi from "@/components/IsianKataSandi"
import Tombol from "@/components/Tombol"

const PESAN_LAMA_KOSONG = "Isi password lama."
const PESAN_BARU_PENDEK = "Password baru minimal 8 karakter."
const PESAN_ULANG_BEDA = "Isian ulang tidak sama dengan password baru."
const PESAN_SAMA = "Password baru tidak boleh sama dengan password lama."
const PESAN_LAMA_SALAH = "Password lama salah."
const PESAN_TERPUTUS = "BinBank sedang tidak bisa dihubungi. Coba lagi sebentar lagi."

const GALAT_SERVER = {
  "Password lama wajib diisi": ["lama", PESAN_LAMA_KOSONG],
  "Password baru minimal 8 karakter": ["baru", PESAN_BARU_PENDEK],
  "Password baru tidak boleh sama dengan password lama": ["baru", PESAN_SAMA],
  "Password lama salah": ["lama", PESAN_LAMA_SALAH],
}

function periksa(lama, baru, ulang) {
  const galat = {}
  if (!lama) galat.lama = PESAN_LAMA_KOSONG
  if (baru.length < 8) galat.baru = PESAN_BARU_PENDEK
  else if (lama && baru === lama) galat.baru = PESAN_SAMA
  if (ulang !== baru) galat.ulang = PESAN_ULANG_BEDA
  return galat
}

// Form
export default function FormGantiPassword({ keterangan, onBerhasil }) {
  const router = useRouter()
  const daring = useDaring()
  const refLama = useRef(null)
  const refBaru = useRef(null)
  const refUlang = useRef(null)

  const [lama, setLama] = useState("")
  const [baru, setBaru] = useState("")
  const [ulang, setUlang] = useState("")
  const [galatIsian, setGalatIsian] = useState({})
  const [galatUmum, setGalatUmum] = useState(null)
  const [memproses, setMemproses] = useState(false)

  function fokuskan(kunci) {
    const peta = { lama: refLama, baru: refBaru, ulang: refUlang }
    peta[kunci].current?.focus()
  }

  function ubah(kunci, setter) {
    return (e) => {
      setter(e.target.value)
      if (galatIsian[kunci]) setGalatIsian(({ [kunci]: _, ...sisa }) => sisa)
    }
  }

  function tampilkanGalatUmum(teks) {
    setGalatUmum((lalu) => ({ teks, kunci: (lalu?.kunci ?? 0) + 1 }))
  }

  async function kirim(e) {
    e.preventDefault()
    if (!daring || memproses) return

    const galat = periksa(lama, baru, ulang)
    const pertama = ["lama", "baru", "ulang"].find((k) => galat[k])
    setGalatIsian(galat)
    if (pertama) {
      setGalatUmum(null)
      fokuskan(pertama)
      return
    }

    setGalatUmum(null)
    setMemproses(true)

    try {
      const hasil = await api("/auth/password", {
        method: "PATCH",
        body: { passwordLama: lama, passwordBaru: baru },
        tanpaRedirect: true,
      })
      simpanSesi(hasil.data.token, hasil.data.user)
      onBerhasil?.(hasil.data.user)
    } catch (err) {
      setMemproses(false)
      const status = err instanceof ApiError ? err.status : 0
      const petaServer = status === 400 ? GALAT_SERVER[err.message] : null
      if (status === 401) {
        hapusSesi()
        router.replace("/sesi-berakhir")
      } else if (petaServer) {
        const [kunci, teks] = petaServer
        setGalatIsian({ [kunci]: teks })
        if (kunci === "lama") setLama("")
        fokuskan(kunci)
      } else if (status === 0 || status >= 500) {
        tampilkanGalatUmum(PESAN_TERPUTUS)
      } else {
        tampilkanGalatUmum(err.message)
      }
    }
  }

  return (
    <>
      {keterangan && <p className="mt-2 text-small text-ink-700">{keterangan}</p>}

      <form noValidate onSubmit={kirim} className="mt-6 flex flex-col gap-4">
        {galatUmum && <PesanInline key={galatUmum.kunci} varian="galat" isi={galatUmum.teks} />}

        <IsianKataSandi
          ref={refLama}
          id="password-lama"
          label="Password lama"
          placeholder="Masukkan password lama Anda"
          autoComplete="current-password"
          galat={galatIsian.lama}
          value={lama}
          onChange={ubah("lama", setLama)}
        />

        <IsianKataSandi
          ref={refBaru}
          id="password-baru"
          label="Password baru"
          placeholder="Masukkan password baru Anda"
          autoComplete="new-password"
          bantuan="Minimal 8 karakter"
          galat={galatIsian.baru}
          value={baru}
          onChange={ubah("baru", setBaru)}
        />

        <IsianKataSandi
          ref={refUlang}
          id="password-ulang"
          label="Ulangi password baru"
          placeholder="Ulangi password baru Anda"
          autoComplete="new-password"
          galat={galatIsian.ulang}
          value={ulang}
          onChange={ubah("ulang", setUlang)}
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
            Simpan password baru
          </Tombol>
          {!daring && (
            <p id="alasan-nonaktif" className="mt-2 text-small text-ink-700">
              Menyimpan membutuhkan koneksi
            </p>
          )}
        </div>
      </form>
    </>
  )
}
