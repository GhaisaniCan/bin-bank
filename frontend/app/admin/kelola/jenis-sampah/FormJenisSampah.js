"use client"

import { useEffect, useRef, useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import IsianTeks from "@/components/IsianTeks"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

export default function FormJenisSampah({ jenis, daftar, onTutup, onTersimpan }) {
  const dialog = useRef(null)
  const isianNama = useRef(null)
  const [nama, setNama] = useState(jenis?.nama ?? "")
  const [harga, setHarga] = useState(jenis?.hargaPerKg ? String(Math.round(jenis.hargaPerKg)) : "")
  const [galat, setGalat] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    isianNama.current.focus()
  }, [])

  function periksa() {
    const g = {}
    const n = nama.trim()
    if (!n) {
      g.nama = "Nama wajib diisi"
    } else if (
      daftar.some((j) => j._id !== jenis?._id && j.nama.trim().toLowerCase() === n.toLowerCase())
    ) {
      g.nama = "Nama ini sudah dipakai jenis sampah lain"
    }
    if (!harga || Number(harga) <= 0) g.harga = "Harga per kg harus lebih dari 0"
    return g
  }

  async function kirim(e) {
    e.preventDefault()
    const g = periksa()
    setGalat(g)
    const pertama = ["nama", "harga"].find((k) => g[k])
    if (pertama) {
      document.getElementById(pertama)?.focus()
      return
    }

    setMenyimpan(true)
    try {
      const hasil = await api(jenis ? `/jenis-sampah/${jenis._id}` : "/jenis-sampah", {
        method: jenis ? "PUT" : "POST",
        body: { nama: nama.trim(), hargaPerKg: Number(harga) },
        galatInline: true,
      })
      onTersimpan(hasil.data)
    } catch (err) {
      if (err.status === 409) {
        setGalat({ nama: "Nama ini sudah dipakai jenis sampah lain" })
      } else if (err.status) {
        setGalat({ umum: err.message })
      } else {
        setGalat({ umum: "Belum dipastikan tersimpan. Periksa daftar jenis sampah sebelum mencoba lagi." })
      }
    } finally {
      setMenyimpan(false)
    }
  }

  function batalTutup(e) {
    if (menyimpan) e.preventDefault()
  }

  return (
    <dialog
      ref={dialog}
      onCancel={batalTutup}
      onClose={onTutup}
      aria-labelledby="judul-form-jenis"
      className="m-0 mt-auto w-full max-w-none rounded-t-3 bg-putih p-5 text-ink-900 backdrop:bg-ink-900/50 min-[600px]:m-auto min-[600px]:w-[480px] min-[600px]:rounded-3"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="judul-form-jenis" className="text-h2 font-bold">
          {jenis ? "Ubah jenis sampah" : "Tambah jenis sampah"}
        </h2>
        <Tombol varian="teks" disabled={menyimpan} onClick={() => dialog.current.close()}>
          Tutup
        </Tombol>
      </div>

      <form onSubmit={kirim} noValidate className="mt-4 space-y-4">
        <IsianTeks
          id="nama"
          ref={isianNama}
          label="Nama"
          value={nama}
          maxLength={60}
          onChange={(e) => setNama(e.target.value)}
          galat={galat.nama}
        />

        <div>
          <label htmlFor="harga" className="block text-body text-ink-900">
            Harga per kg
          </label>
          <div className="relative mt-2">
            <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-body text-ink-700">
              Rp
            </span>
            <input
              id="harga"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={harga ? Number(harga).toLocaleString("id-ID") : ""}
              onChange={(e) => setHarga(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9))}
              aria-invalid={galat.harga ? true : undefined}
              aria-describedby={galat.harga ? "harga-galat harga-bantuan" : "harga-bantuan"}
              className={`h-7 w-full rounded-2 bg-putih pl-[44px] pr-3 text-body tabular-nums text-ink-900 ${
                galat.harga ? "border-2 border-bata-700" : "border border-line-500"
              }`}
            />
          </div>
          {galat.harga && (
            <p id="harga-galat" className="mt-2 text-small font-bold text-bata-700">
              {galat.harga}
            </p>
          )}
          <p id="harga-bantuan" className="mt-2 text-small text-ink-500">
            Perubahan harga hanya berlaku untuk setoran berikutnya. Setoran yang sudah tercatat tidak berubah.
          </p>
        </div>

        {galat.umum && (
          <PesanInline varian="galat" ikon={WarningOctagon} judul="Belum tersimpan" isi={galat.umum} />
        )}

        <Tombol type="submit" memproses={menyimpan} teksMemproses="Menyimpan..." className="w-full">
          Simpan jenis sampah
        </Tombol>
      </form>
    </dialog>
  )
}
