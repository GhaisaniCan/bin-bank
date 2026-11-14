"use client"

import { useCallback, useEffect, useState } from "react"
import { WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { formatRupiah } from "@/lib/format"
import { useDaring } from "@/lib/koneksi"
import { tampilkanToast } from "@/lib/toast"
import CapStatus from "@/components/CapStatus"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import FormJenisSampah from "./FormJenisSampah"

function rapikan(jenis) {
  const harga = jenis.hargaPerKg ?? jenis.harga_per_kg
  return {
    ...jenis,
    aktif: jenis.aktif !== false,
    hargaPerKg: Number.isFinite(harga) ? harga : null,
  }
}

function rupiah(nilai) {
  return nilai === null ? "Belum diisi" : formatRupiah(nilai)
}

function urutkan(daftar) {
  return [...daftar].sort((a, b) => {
    if (a.aktif !== b.aktif) return a.aktif ? -1 : 1
    return a.nama.localeCompare(b.nama, "id")
  })
}

function Monogram({ nama }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-[24px] shrink-0 items-center justify-center rounded-1 border border-ink-900 font-mono text-small font-bold"
    >
      {nama.charAt(0).toUpperCase()}
    </span>
  )
}

function AksiBaris({ jenis, daring, diproses, onUbah, onUbahStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Tombol varian="sekunder" disabled={!daring} onClick={() => onUbah(jenis)}>
        Ubah
      </Tombol>
      <Tombol
        varian={jenis.aktif ? "merusak" : "sekunder"}
        disabled={!daring}
        memproses={diproses}
        teksMemproses="Menyimpan..."
        onClick={() => onUbahStatus(jenis)}
      >
        {jenis.aktif ? "Nonaktifkan" : "Aktifkan"}
      </Tombol>
    </div>
  )
}

export default function Halaman() {
  const daring = useDaring()
  const [daftar, setDaftar] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [lambat, setLambat] = useState(false)
  const [galatBaca, setGalatBaca] = useState(null)
  const [galatTulis, setGalatTulis] = useState(null)
  const [form, setForm] = useState(null)
  const [sorot, setSorot] = useState(null)
  const [prosesId, setProsesId] = useState(null)

  const ambil = useCallback(() => {
    const t = setTimeout(() => setLambat(true), 300)
    return api("/jenis-sampah")
      .then((hasil) => {
        setDaftar(hasil.data.map(rapikan))
        setGalatBaca(null)
      })
      .catch(() => setGalatBaca("Data belum bisa dimuat"))
      .finally(() => {
        clearTimeout(t)
        setMemuat(false)
        setLambat(false)
      })
  }, [])

  const muat = useCallback(() => {
    setMemuat(true)
    setGalatBaca(null)
    ambil()
  }, [ambil])

  useEffect(() => {
    ambil()
  }, [ambil])

  useEffect(() => {
    window.addEventListener("online", muat)
    return () => window.removeEventListener("online", muat)
  }, [muat])

  function perbarui(data) {
    const jenis = rapikan(data)
    setDaftar((lama) =>
      lama.some((j) => j._id === jenis._id)
        ? lama.map((j) => (j._id === jenis._id ? jenis : j))
        : [jenis, ...lama]
    )
    setSorot(jenis._id)
  }

  function tersimpan(jenis) {
    setForm(null)
    perbarui(jenis)
    tampilkanToast("Jenis sampah disimpan")
  }

  async function ubahStatus(jenis) {
    setProsesId(jenis._id)
    setGalatTulis(null)
    try {
      const hasil = await api(`/jenis-sampah/${jenis._id}/status`, {
        method: "PATCH",
        body: { aktif: !jenis.aktif },
        galatInline: true,
      })
      perbarui(hasil.data)
      tampilkanToast(hasil.data.aktif ? "Jenis sampah diaktifkan" : "Jenis sampah dinonaktifkan")
    } catch (err) {
      setGalatTulis(err.status ? err.message : "Belum dipastikan tersimpan. Muat ulang daftar sebelum mencoba lagi.")
    } finally {
      setProsesId(null)
    }
  }

  const terurut = daftar ? urutkan(daftar) : []
  const tombolTambah = (
    <Tombol disabled={!daring} onClick={() => setForm({ jenis: null })} className="w-full min-[600px]:w-auto">
      Tambah jenis sampah
    </Tombol>
  )

  return (
    <main className="pb-[96px] min-[600px]:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-forest-900">Jenis sampah</h1>
          <p className="mt-1 text-small text-ink-700">Harga per kg dipakai untuk setoran berikutnya</p>
        </div>
        <div className="hidden min-[600px]:block">{tombolTambah}</div>
      </div>

      {!daring && (
        <PesanInline
          varian="peringatan"
          ikon={WifiSlash}
          isi="Tidak ada koneksi. Angka di layar bisa sudah berubah. Menyimpan dimatikan sampai koneksi kembali."
          className="mt-4"
        />
      )}

      {galatTulis && (
        <PesanInline
          varian="galat"
          ikon={WarningOctagon}
          judul="Perubahan belum tersimpan"
          isi={galatTulis}
          className="mt-4"
        />
      )}

      {galatBaca && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi={galatBaca} className="mt-4">
          <Tombol varian="sekunder" onClick={muat}>
            Coba lagi
          </Tombol>
        </PesanInline>
      )}

      {daftar === null && memuat && lambat && (
        <div aria-busy="true" className="mt-5 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 rounded-1 bg-olive-50" />
          ))}
        </div>
      )}

      {daftar && daftar.length === 0 && (
        <div className="mt-6">
          <h2 className="text-h3 font-bold">Belum ada jenis sampah</h2>
          <p className="mt-1">Tambahkan jenis pertama agar petugas bisa mencatat setoran.</p>
          <div className="mt-4 hidden min-[600px]:block">{tombolTambah}</div>
        </div>
      )}

      {daftar && daftar.length > 0 && (
        <>
          <table className="mt-5 hidden w-full border-collapse min-[600px]:table">
            <thead>
              <tr className="border-b-2 border-ink-900 text-left text-small font-bold text-ink-700">
                <th scope="col" className="py-3 pr-4">Jenis sampah</th>
                <th scope="col" className="py-3 pr-4 text-right">Harga per kg</th>
                <th scope="col" className="py-3 pr-4">Status</th>
                <th scope="col" className="py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {terurut.map((j, i) => (
                <tr
                  key={j._id}
                  className={`border-b border-line-300 ${
                    j._id === sorot ? "bg-olive-100" : terurut.length > 5 && i % 2 ? "bg-olive-50" : ""
                  } ${j.aktif ? "" : "text-ink-700"}`}
                >
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-3">
                      <Monogram nama={j.nama} />
                      {j.nama}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{rupiah(j.hargaPerKg)}</td>
                  <td className="py-2 pr-4">
                    <CapStatus status={j.aktif ? "AKTIF" : "NONAKTIF"} />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      <AksiBaris
                        jenis={j}
                        daring={daring}
                        diproses={prosesId === j._id}
                        onUbah={(jenis) => setForm({ jenis })}
                        onUbahStatus={ubahStatus}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-5 border-t border-line-300 min-[600px]:hidden">
            {terurut.map((j) => (
              <li
                key={j._id}
                className={`border-b border-line-300 py-3 ${j._id === sorot ? "bg-olive-100" : ""} ${
                  j.aktif ? "" : "text-ink-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3 font-bold">
                    <Monogram nama={j.nama} />
                    {j.nama}
                  </span>
                  <CapStatus status={j.aktif ? "AKTIF" : "NONAKTIF"} />
                </div>
                <p className="mt-1 text-right tabular-nums">
                  <span className="text-small text-ink-700">Harga per kg </span>
                  {rupiah(j.hargaPerKg)}
                </p>
                <div className="mt-3">
                  <AksiBaris
                    jenis={j}
                    daring={daring}
                    diproses={prosesId === j._id}
                    onUbah={(jenis) => setForm({ jenis })}
                    onUbahStatus={ubahStatus}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!daring && <p className="mt-3 text-small text-ink-700">Tambah, ubah, dan nonaktifkan butuh koneksi.</p>}

      <div className="fixed inset-x-0 bottom-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] z-10 border-t border-line-300 bg-putih p-4 min-[600px]:hidden">
        {tombolTambah}
      </div>

      {form && (
        <FormJenisSampah
          jenis={form.jenis}
          daftar={daftar || []}
          onTutup={() => setForm(null)}
          onTersimpan={tersimpan}
        />
      )}
    </main>
  )
}
