"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { api } from "@/lib/api"
import FormJenisSampah from "./FormJenisSampah"

function langgananKoneksi(ubah) {
  window.addEventListener("online", ubah)
  window.addEventListener("offline", ubah)
  return () => {
    window.removeEventListener("online", ubah)
    window.removeEventListener("offline", ubah)
  }
}

const tombolUtama =
  "h-12 min-w-[96px] rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 disabled:bg-olive-50 disabled:text-ink-500"
const tombolSekunder =
  "h-12 min-w-[96px] rounded-2 border border-line-500 bg-putih px-4 text-body font-bold hover:bg-olive-50 disabled:border-0 disabled:bg-olive-50 disabled:text-ink-500"
const tombolMerusak =
  "h-12 min-w-[96px] rounded-2 bg-bata-700 px-4 text-body font-bold text-putih decoration-2 hover:underline disabled:bg-olive-50 disabled:text-ink-500 disabled:no-underline"

function rupiah(nilai) {
  return `Rp ${nilai.toLocaleString("id-ID")}`
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
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-1 border border-ink-900 font-mono text-small font-bold"
    >
      {nama.charAt(0).toUpperCase()}
    </span>
  )
}

function CapStatus({ aktif }) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center rounded-1 border px-2 text-cap font-bold uppercase ${
        aktif ? "border-daun-700 bg-daun-100 text-daun-700" : "border-line-500 bg-putih text-ink-700"
      }`}
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  )
}

function Toast({ pesan, onTutup }) {
  useEffect(() => {
    const t = setTimeout(onTutup, 8000)
    return () => clearTimeout(t)
  }, [pesan, onTutup])

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-10 mx-auto flex max-w-[480px] items-center justify-between gap-3 rounded-2 bg-ink-900 px-4 py-3 text-putih min-[600px]:bottom-6"
    >
      <span>{pesan}</span>
      <button type="button" onClick={onTutup} className="text-body font-bold underline">
        Tutup
      </button>
    </div>
  )
}

function AksiBaris({ jenis, offline, diproses, onUbah, onUbahStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={offline} onClick={() => onUbah(jenis)} className={tombolSekunder}>
        Ubah
      </button>
      <button
        type="button"
        disabled={offline || diproses}
        aria-busy={diproses}
        onClick={() => onUbahStatus(jenis)}
        className={jenis.aktif ? tombolMerusak : tombolSekunder}
      >
        {diproses ? "Menyimpan..." : jenis.aktif ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  )
}

export default function Halaman() {
  const [daftar, setDaftar] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [lambat, setLambat] = useState(false)
  const [galatBaca, setGalatBaca] = useState(null)
  const [galatTulis, setGalatTulis] = useState(null)
  const [form, setForm] = useState(null)
  const [sorot, setSorot] = useState(null)
  const [toast, setToast] = useState(null)
  const [prosesId, setProsesId] = useState(null)

  const offline = useSyncExternalStore(
    langgananKoneksi,
    () => !navigator.onLine,
    () => false
  )

  const ambil = useCallback(() => {
    const t = setTimeout(() => setLambat(true), 300)
    return api("/jenis-sampah")
      .then((hasil) => {
        setDaftar(hasil.data)
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

  const tutupToast = useCallback(() => setToast(null), [])

  function perbarui(jenis) {
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
    setToast("Jenis sampah disimpan")
  }

  async function ubahStatus(jenis) {
    setProsesId(jenis._id)
    setGalatTulis(null)
    try {
      const hasil = await api(`/jenis-sampah/${jenis._id}/status`, {
        method: "PATCH",
        body: { aktif: !jenis.aktif },
      })
      perbarui(hasil.data)
      setToast(hasil.data.aktif ? "Jenis sampah diaktifkan" : "Jenis sampah dinonaktifkan")
    } catch (err) {
      setGalatTulis(err.status ? err.message : "Belum dipastikan tersimpan. Muat ulang daftar sebelum mencoba lagi.")
    } finally {
      setProsesId(null)
    }
  }

  const terurut = daftar ? urutkan(daftar) : []
  const tombolTambah = (
    <button type="button" disabled={offline} onClick={() => setForm({ jenis: null })} className={tombolUtama}>
      Tambah jenis sampah
    </button>
  )

  return (
    <main className="mx-auto max-w-[1120px] p-4 pb-28 min-[600px]:p-5 min-[1024px]:px-6 min-[1024px]:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Jenis sampah</h1>
          <p className="mt-1 text-small text-ink-700">Harga per kg dipakai untuk setoran berikutnya</p>
        </div>
        <div className="hidden min-[600px]:block">{tombolTambah}</div>
      </div>

      {offline && (
        <div role="status" className="mt-4 rounded-2 bg-kardus-100 p-4">
          <p className="font-bold text-kardus-700">Tidak ada koneksi</p>
          <p>Angka di layar bisa sudah berubah. Menyimpan dimatikan sampai koneksi kembali.</p>
        </div>
      )}

      {galatTulis && (
        <div role="alert" className="mt-4 rounded-2 bg-bata-100 p-4">
          <p className="font-bold text-bata-700">Perubahan belum tersimpan</p>
          <p>{galatTulis}</p>
        </div>
      )}

      {galatBaca && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2 bg-bata-100 p-4">
          <p className="font-bold text-bata-700">{galatBaca}</p>
          <button type="button" onClick={muat} className={tombolSekunder}>
            Coba lagi
          </button>
        </div>
      )}

      {daftar === null && memuat && lambat && (
        <div aria-busy="true" className="mt-5 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-1 bg-olive-50" />
          ))}
        </div>
      )}

      {daftar && daftar.length === 0 && (
        <div className="mt-6">
          <h2 className="text-h3 font-bold">Belum ada jenis sampah</h2>
          <p className="mt-1">Tambahkan jenis pertama agar petugas bisa mencatat setoran.</p>
          <div className="mt-4">{tombolTambah}</div>
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
                    <CapStatus aktif={j.aktif} />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      <AksiBaris
                        jenis={j}
                        offline={offline}
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
                  <CapStatus aktif={j.aktif} />
                </div>
                <p className="mt-1 text-right tabular-nums">
                  <span className="text-small text-ink-700">Harga per kg </span>
                  {rupiah(j.hargaPerKg)}
                </p>
                <div className="mt-3">
                  <AksiBaris
                    jenis={j}
                    offline={offline}
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

      {offline && <p className="mt-3 text-small text-ink-700">Tambah, ubah, dan nonaktifkan butuh koneksi.</p>}

      <div className="fixed inset-x-0 bottom-0 border-t border-line-300 bg-putih p-4 min-[600px]:hidden [&>button]:w-full">
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

      {toast && <Toast pesan={toast} onTutup={tutupToast} />}
    </main>
  )
}
