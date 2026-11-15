"use client"

import { useRef, useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import Dialog from "@/components/Dialog"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

export default function DialogHapusJenis({ jenis, daring, onTutup, onTerhapus, onNonaktifkan }) {
  const refBatal = useRef(null)
  const [menghapus, setMenghapus] = useState(false)
  const [menonaktifkan, setMenonaktifkan] = useState(false)
  const [galat, setGalat] = useState(null)
  const [dipakai, setDipakai] = useState(false)

  const sibuk = menghapus || menonaktifkan

  // Hapus
  async function hapus() {
    setMenghapus(true)
    setGalat(null)
    try {
      await api(`/jenis-sampah/${jenis._id}`, { method: "DELETE", galatInline: true })
      onTerhapus(jenis)
    } catch (err) {
      setDipakai(err.status === 409)
      setGalat(err.status ? err.message : "Belum dipastikan terhapus. Muat ulang daftar sebelum mencoba lagi.")
      setMenghapus(false)
    }
  }

  // Nonaktifkan
  async function nonaktifkan() {
    setMenonaktifkan(true)
    setGalat(null)
    const pesan = await onNonaktifkan(jenis)
    if (!pesan) return onTutup()
    setGalat(pesan)
    setMenonaktifkan(false)
  }

  return (
    <Dialog judul="Hapus jenis sampah?" onTutup={onTutup} terkunci={sibuk} fokusAwal={refBatal}>
      <p className="mt-4 text-body font-bold break-words">{jenis.nama}</p>
      <p className="mt-2 text-body">
        Jenis sampah dihapus permanen. Bila sudah pernah dipakai di setoran, hapus tidak bisa dilakukan dan sebaiknya
        dinonaktifkan.
      </p>

      {galat && (
        <PesanInline
          varian="galat"
          ikon={WarningOctagon}
          judul={dipakai ? "Jenis sampah tidak bisa dihapus" : "Jenis sampah belum terhapus"}
          isi={galat}
          className="mt-4"
        />
      )}

      {!daring && <p className="mt-4 text-small text-ink-700">Hapus dan nonaktifkan butuh koneksi.</p>}

      <div className="mt-5 flex flex-col gap-4 min-[600px]:flex-row min-[600px]:flex-wrap">
        {dipakai && jenis.aktif ? (
          <Tombol
            varian="merusak"
            disabled={!daring}
            memproses={menonaktifkan}
            teksMemproses="Menyimpan..."
            onClick={nonaktifkan}
            className="w-full min-[600px]:w-auto"
          >
            Nonaktifkan saja
          </Tombol>
        ) : (
          !dipakai && (
            <Tombol
              varian="merusak"
              disabled={!daring}
              memproses={menghapus}
              teksMemproses="Menghapus..."
              onClick={hapus}
              className="w-full min-[600px]:w-auto"
            >
              Hapus
            </Tombol>
          )
        )}
        <Tombol ref={refBatal} varian="sekunder" disabled={sibuk} onClick={onTutup} className="w-full min-[600px]:w-auto">
          Batal
        </Tombol>
      </div>
    </Dialog>
  )
}
