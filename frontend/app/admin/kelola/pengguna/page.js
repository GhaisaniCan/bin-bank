"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, MagnifyingGlass, Prohibit, WarningOctagon, WifiSlash } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilUser } from "@/lib/auth"
import { useDaring } from "@/lib/koneksi"
import { tampilkanToast } from "@/lib/toast"
import CapStatus from "@/components/CapStatus"
import GrupPil from "@/components/GrupPil"
import MenuAksi from "@/components/MenuAksi"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import DialogResetPassword from "./DialogResetPassword"
import DialogStatusAkun from "./DialogStatusAkun"

const LIMIT = 20

const FILTER_PERAN = [
  { id: "", label: "Semua peran" },
  { id: "nasabah", label: "Nasabah" },
  { id: "petugas", label: "Petugas" },
  { id: "admin", label: "Admin" },
]

const FILTER_STATUS = [
  { id: "", label: "Semua status" },
  { id: "aktif", label: "Aktif" },
  { id: "nonaktif", label: "Nonaktif" },
]

const LABEL_PERAN = { nasabah: "Nasabah", petugas: "Petugas", admin: "Admin" }

function rapikan(user) {
  return { ...user, id: user.id ?? user._id, aktif: user.aktif !== false }
}

// Aksi baris
function AksiBaris({ user, diriSendiri, daring, onReset, onStatus }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Tombol varian="sekunder" ukuran="ringkas" disabled={!daring} onClick={() => onReset(user)}>
        Reset password
      </Tombol>
      {diriSendiri ? (
        <span aria-hidden="true" className="size-7 shrink-0" />
      ) : (
        <MenuAksi
          label={`Aksi lainnya untuk ${user.nama}`}
          disabled={!daring}
          item={[
            user.aktif
              ? { label: "Nonaktifkan", ikon: Prohibit, bahaya: true, onPilih: () => onStatus(user) }
              : { label: "Aktifkan", ikon: CheckCircle, onPilih: () => onStatus(user) },
          ]}
        />
      )}
    </div>
  )
}

function NamaAkun({ user, diriSendiri }) {
  return (
    <>
      <span className="block font-bold break-words">
        {user.nama}
        {diriSendiri && <span className="font-normal text-ink-700"> (Anda)</span>}
      </span>
      <span className="block text-small text-ink-700 break-all">{user.email}</span>
    </>
  )
}

export default function Halaman() {
  const daring = useDaring()
  const idSaya = ambilUser()?._id ?? ambilUser()?.id
  const [isianCari, setIsianCari] = useState("")
  const [cari, setCari] = useState("")
  const [peran, setPeran] = useState("")
  const [status, setStatus] = useState("")
  const [halaman, setHalaman] = useState(1)
  const [daftar, setDaftar] = useState(null)
  const [paginasi, setPaginasi] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [lambat, setLambat] = useState(false)
  const [galatBaca, setGalatBaca] = useState(null)
  const [sorot, setSorot] = useState(null)
  const [reset, setReset] = useState(null)
  const [ubahStatus, setUbahStatus] = useState(null)

  const ambil = useCallback(() => {
    const t = setTimeout(() => setLambat(true), 300)
    const q = new URLSearchParams({ halaman: String(halaman), limit: String(LIMIT) })
    if (cari) q.set("cari", cari)
    if (peran) q.set("role", peran)
    if (status) q.set("status", status)
    return api(`/users?${q}`, { galatInline: true })
      .then((hasil) => {
        setDaftar(hasil.data.map(rapikan))
        setPaginasi(hasil.paginasi)
        setGalatBaca(null)
      })
      .catch(() => setGalatBaca("Data belum bisa dimuat"))
      .finally(() => {
        clearTimeout(t)
        setMemuat(false)
        setLambat(false)
      })
  }, [cari, peran, status, halaman])

  const muat = useCallback(() => {
    setMemuat(true)
    setGalatBaca(null)
    ambil()
  }, [ambil])

  useEffect(() => {
    ambil()
  }, [ambil])

  useEffect(() => {
    const t = setTimeout(() => {
      const baru = isianCari.trim()
      if (baru !== cari && (baru.length === 0 || baru.length >= 2)) {
        setMemuat(true)
        setHalaman(1)
        setCari(baru)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [isianCari, cari])

  function gantiFilter(setter) {
    return (nilai) => {
      setMemuat(true)
      setHalaman(1)
      setter(nilai)
    }
  }

  function gantiHalaman(h) {
    setMemuat(true)
    setHalaman(h)
  }

  function hapusFilter() {
    setIsianCari("")
    setCari("")
    setPeran("")
    setStatus("")
    setHalaman(1)
    setMemuat(true)
  }

  function perbarui(data) {
    const user = rapikan(data)
    setDaftar((lama) => lama.map((u) => (u.id === user.id ? { ...u, ...user } : u)))
    setSorot(user.id)
  }

  function statusTersimpan(data) {
    setUbahStatus(null)
    perbarui(data)
    tampilkanToast(data.aktif ? "Akun diaktifkan" : "Akun dinonaktifkan")
  }

  const adaFilter = Boolean(cari || peran || status)

  return (
    <main className="pb-[96px] min-[600px]:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-forest-900">Pengguna</h1>
          <p className="mt-1 text-small text-ink-700">Akun nasabah, petugas, dan admin</p>
        </div>
        <Link
          href="/admin/kelola/pengguna/baru"
          className="hidden h-7 shrink-0 items-center justify-center rounded-full bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 min-[600px]:inline-flex"
        >
          Buat akun baru
        </Link>
      </div>

      <div className="mt-5">
        <label htmlFor="cari" className="block text-body text-ink-900">
          Nama atau email
        </label>
        <div className="relative mt-2">
          <MagnifyingGlass
            size={24}
            weight="regular"
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700"
          />
          <input
            id="cari"
            type="search"
            value={isianCari}
            onChange={(e) => setIsianCari(e.target.value)}
            autoComplete="off"
            aria-describedby="cari-bantuan"
            className="h-7 w-full rounded-2 border border-line-500 bg-putih pl-[48px] pr-3 text-body text-ink-900"
          />
        </div>
        <p id="cari-bantuan" className="mt-2 text-small text-ink-500">
          Ketik minimal dua huruf
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <GrupPil label="Saring menurut peran" pilihan={FILTER_PERAN} aktif={peran} onUbah={gantiFilter(setPeran)} />
        <GrupPil
          label="Saring menurut status"
          pilihan={FILTER_STATUS}
          aktif={status}
          onUbah={gantiFilter(setStatus)}
        />
      </div>

      {!daring && (
        <PesanInline
          varian="peringatan"
          ikon={WifiSlash}
          isi="Tidak ada koneksi. Daftar di layar bisa sudah berubah. Aksi dimatikan sampai koneksi kembali."
          className="mt-4"
        />
      )}

      {galatBaca && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi={galatBaca} className="mt-4">
          <Tombol varian="sekunder" disabled={!daring} onClick={muat}>
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
          <h2 className="text-h3 font-bold">{adaFilter ? "Tidak ada akun yang cocok" : "Belum ada akun"}</h2>
          {adaFilter && (
            <Tombol varian="teks" onClick={hapusFilter} className="mt-2 -ml-2">
              Hapus filter
            </Tombol>
          )}
        </div>
      )}

      {daftar && daftar.length > 0 && (
        <div aria-busy={memuat || undefined} className={memuat ? "opacity-60" : ""}>
          <p role="status" className="mt-4 text-small text-ink-700">
            {paginasi ? `${paginasi.total} akun` : `${daftar.length} akun`}
          </p>

          <table className="mt-2 hidden w-full border-collapse min-[600px]:table">
            <caption className="sr-only">Daftar akun pengguna</caption>
            <thead>
              <tr className="border-b-2 border-ink-900 text-left text-small font-bold text-ink-700">
                <th scope="col" className="py-3 pr-4">Nama dan email</th>
                <th scope="col" className="py-3 pr-4">Peran</th>
                <th scope="col" className="py-3 pr-4">Status</th>
                <th scope="col" className="py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-line-300 ${
                    u.id === sorot ? "bg-olive-100" : daftar.length > 5 && i % 2 ? "bg-olive-50" : ""
                  } ${u.aktif ? "" : "text-ink-700"}`}
                >
                  <td className="py-2 pr-4">
                    <NamaAkun user={u} diriSendiri={u.id === idSaya} />
                  </td>
                  <td className="py-2 pr-4">{LABEL_PERAN[u.role] ?? u.role}</td>
                  <td className="py-2 pr-4">
                    <CapStatus status={u.aktif ? "AKTIF" : "NONAKTIF"} />
                  </td>
                  <td className="py-2">
                    <AksiBaris
                      user={u}
                      diriSendiri={u.id === idSaya}
                      daring={daring}
                      onReset={setReset}
                      onStatus={setUbahStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-2 border-t border-line-300 min-[600px]:hidden">
            {daftar.map((u) => (
              <li
                key={u.id}
                className={`border-b border-line-300 py-3 ${u.id === sorot ? "bg-olive-100" : ""} ${
                  u.aktif ? "" : "text-ink-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <NamaAkun user={u} diriSendiri={u.id === idSaya} />
                    <span className="mt-1 block text-small">{LABEL_PERAN[u.role] ?? u.role}</span>
                  </div>
                  <CapStatus status={u.aktif ? "AKTIF" : "NONAKTIF"} />
                </div>
                <div className="mt-3">
                  <AksiBaris
                    user={u}
                    diriSendiri={u.id === idSaya}
                    daring={daring}
                    onReset={setReset}
                    onStatus={setUbahStatus}
                  />
                </div>
              </li>
            ))}
          </ul>

          {paginasi && (
            <Paginasi
              halaman={paginasi.halaman}
              totalHalaman={paginasi.totalHalaman}
              onUbah={gantiHalaman}
              nonaktif={memuat || !daring}
            />
          )}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] z-10 border-t border-line-300 bg-putih p-4 min-[600px]:hidden">
        <Link
          href="/admin/kelola/pengguna/baru"
          className="flex h-7 w-full items-center justify-center rounded-full bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800"
        >
          Buat akun baru
        </Link>
      </div>

      {reset && <DialogResetPassword user={reset} daring={daring} onTutup={() => setReset(null)} />}

      {ubahStatus && (
        <DialogStatusAkun
          user={ubahStatus}
          daring={daring}
          onTutup={() => setUbahStatus(null)}
          onTersimpan={statusTersimpan}
        />
      )}
    </main>
  )
}
