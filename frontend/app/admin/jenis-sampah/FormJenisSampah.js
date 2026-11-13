"use client"

import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"

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

export default function FormJenisSampah({ jenis, daftar, onTutup, onTersimpan }) {
  const dialog = useRef(null)
  const isianNama = useRef(null)
  const [nama, setNama] = useState(jenis?.nama ?? "")
  const [harga, setHarga] = useState(jenis ? String(jenis.hargaPerKg) : "")
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
        <button
          type="button"
          disabled={menyimpan}
          onClick={() => dialog.current.close()}
          className="h-12 text-body font-bold text-olive-700 underline disabled:text-ink-500"
        >
          Tutup
        </button>
      </div>

      <form onSubmit={kirim} noValidate className="mt-4">
        <label htmlFor="nama" className="block text-body font-bold">
          Nama
        </label>
        <div className="mt-2">
          <input
            id="nama"
            ref={isianNama}
            type="text"
            value={nama}
            maxLength={60}
            onChange={(e) => setNama(e.target.value)}
            aria-invalid={galat.nama ? "true" : "false"}
            aria-describedby={galat.nama ? "galat-nama" : undefined}
            className={kelasIsian(galat.nama)}
          />
        </div>
        <Galat id="galat-nama" pesan={galat.nama} />

        <label htmlFor="harga" className="mt-4 block text-body font-bold">
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
            aria-invalid={galat.harga ? "true" : "false"}
            aria-describedby={galat.harga ? "galat-harga bantuan-harga" : "bantuan-harga"}
            className={`${kelasIsian(galat.harga)} pl-11 tabular-nums`}
          />
        </div>
        <Galat id="galat-harga" pesan={galat.harga} />
        <p id="bantuan-harga" className="mt-2 text-small text-ink-700">
          Perubahan harga hanya berlaku untuk setoran berikutnya. Setoran yang sudah tercatat tidak berubah.
        </p>

        {galat.umum && (
          <div role="alert" className="mt-4 rounded-2 bg-bata-100 p-4">
            <p className="font-bold text-bata-700">Belum tersimpan</p>
            <p>{galat.umum}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={menyimpan}
          aria-busy={menyimpan}
          className="mt-5 h-12 w-full rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 disabled:bg-olive-50 disabled:text-ink-500"
        >
          {menyimpan ? "Menyimpan..." : "Simpan jenis sampah"}
        </button>
      </form>
    </dialog>
  )
}
