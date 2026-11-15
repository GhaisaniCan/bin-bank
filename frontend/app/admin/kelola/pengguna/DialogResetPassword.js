"use client"

import { useRef, useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { tampilkanToast } from "@/lib/toast"
import Dialog from "@/components/Dialog"
import IsianKataSandi from "@/components/IsianKataSandi"
import KotakRahasia, { buatPasswordAcak } from "@/components/KotakRahasia"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

export default function DialogResetPassword({ user, daring, onTutup }) {
  const refIsian = useRef(null)
  const [password, setPassword] = useState("")
  const [galat, setGalat] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [selesai, setSelesai] = useState(null)

  function buatOtomatis() {
    setPassword(buatPasswordAcak())
    setGalat({})
  }

  async function kirim(e) {
    e.preventDefault()
    if (password.length < 8) {
      setGalat({ password: "Password sementara minimal 8 karakter" })
      refIsian.current?.focus()
      return
    }
    setMenyimpan(true)
    setGalat({})
    try {
      await api(`/users/${user.id}/password`, {
        method: "PATCH",
        body: { passwordBaru: password },
        galatInline: true,
      })
      setSelesai(password)
    } catch (err) {
      setGalat({
        umum: err.status ? err.message : "Belum dipastikan tersimpan. Coba atur ulang password sebelum menyampaikannya.",
      })
    } finally {
      setMenyimpan(false)
    }
  }

  if (selesai) {
    const tutupSelesai = () => {
      onTutup()
      tampilkanToast("Password sementara diatur")
    }
    return (
      <Dialog judul="Password sementara diatur" onTutup={tutupSelesai}>
        <p className="mt-4 text-body font-bold break-words">{user.nama}</p>
        <p className="text-small text-ink-700 break-all">{user.email}</p>
        <KotakRahasia label="Password sementara" nilai={selesai} className="mt-4" />
        <p className="mt-3 text-body">Sampaikan langsung ke pemilik akun. Ia wajib menggantinya saat masuk berikutnya.</p>
        <Tombol onClick={tutupSelesai} className="mt-5 w-full min-[600px]:w-auto">
          Selesai
        </Tombol>
      </Dialog>
    )
  }

  return (
    <Dialog judul="Reset password" onTutup={onTutup} terkunci={menyimpan} fokusAwal={refIsian}>
      <p className="mt-4 text-body font-bold break-words">{user.nama}</p>
      <p className="text-small text-ink-700 break-all">{user.email}</p>

      <form onSubmit={kirim} noValidate className="mt-4 space-y-4">
        <div>
          <IsianKataSandi
            id="password-sementara"
            ref={refIsian}
            label="Password sementara"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            galat={galat.password}
            bantuan="Minimal 8 karakter. Pengguna wajib menggantinya saat masuk berikutnya."
          />
          <Tombol varian="teks" onClick={buatOtomatis} disabled={menyimpan} className="mt-2 -ml-2">
            Buat otomatis
          </Tombol>
        </div>

        {galat.umum && (
          <PesanInline varian="galat" ikon={WarningOctagon} judul="Password belum diatur" isi={galat.umum} />
        )}

        {!daring && <p className="text-small text-ink-700">Reset password butuh koneksi.</p>}

        <Tombol type="submit" disabled={!daring} memproses={menyimpan} teksMemproses="Menyimpan..." className="w-full">
          Atur password sementara
        </Tombol>
      </form>
    </Dialog>
  )
}
