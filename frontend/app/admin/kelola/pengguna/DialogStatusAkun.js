"use client"

import { useRef, useState } from "react"
import { Warning, WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { formatRupiah } from "@/lib/format"
import Dialog from "@/components/Dialog"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

export default function DialogStatusAkun({ user, daring, onTutup, onTersimpan }) {
  const refBatal = useRef(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [galat, setGalat] = useState(null)
  const menonaktifkan = user.aktif
  const punyaSaldo = user.role === "nasabah" && Number(user.saldo) > 0

  async function simpan() {
    setMenyimpan(true)
    setGalat(null)
    try {
      const hasil = await api(`/users/${user.id}/status`, {
        method: "PATCH",
        body: { aktif: !user.aktif },
        galatInline: true,
      })
      onTersimpan(hasil.data)
    } catch (err) {
      setGalat(err.status ? err.message : "Belum dipastikan tersimpan. Muat ulang daftar sebelum mencoba lagi.")
      setMenyimpan(false)
    }
  }

  return (
    <Dialog
      judul={menonaktifkan ? "Nonaktifkan akun?" : "Aktifkan akun?"}
      onTutup={onTutup}
      terkunci={menyimpan}
      fokusAwal={refBatal}
    >
      <p className="mt-4 text-body font-bold break-words">{user.nama}</p>
      <p className="text-small text-ink-700 break-all">{user.email}</p>

      {menonaktifkan ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-body">
          <li>Akun tidak bisa masuk lagi.</li>
          <li>Sesi yang sedang terbuka tetap berlaku sampai berakhir, paling lama 8 jam.</li>
          <li>Data setoran, penarikan, dan saldo tetap tercatat.</li>
        </ul>
      ) : (
        <p className="mt-3 text-body">Akun bisa masuk lagi dengan password yang sama.</p>
      )}

      {menonaktifkan && punyaSaldo && (
        <PesanInline
          varian="peringatan"
          ikon={Warning}
          isi={`Nasabah ini masih punya saldo ${formatRupiah(user.saldo)}.`}
          className="mt-4"
        />
      )}

      {galat && (
        <PesanInline varian="galat" ikon={WarningOctagon} judul="Status belum tersimpan" isi={galat} className="mt-4" />
      )}

      {!daring && <p className="mt-4 text-small text-ink-700">Mengubah status butuh koneksi.</p>}

      <div className="mt-5 flex flex-col gap-4 min-[600px]:flex-row">
        <Tombol
          varian={menonaktifkan ? "merusak" : "utama"}
          disabled={!daring}
          memproses={menyimpan}
          teksMemproses="Menyimpan..."
          onClick={simpan}
          className="w-full min-[600px]:w-auto"
        >
          {menonaktifkan ? "Nonaktifkan akun" : "Aktifkan akun"}
        </Tombol>
        <Tombol
          ref={refBatal}
          varian="sekunder"
          disabled={menyimpan}
          onClick={onTutup}
          className="w-full min-[600px]:w-auto"
        >
          Batal
        </Tombol>
      </div>
    </Dialog>
  )
}
