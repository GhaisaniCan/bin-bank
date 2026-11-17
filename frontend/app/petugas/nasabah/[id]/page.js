"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { MagnifyingGlass, UsersThree, WarningOctagon } from "@phosphor-icons/react"
import { useParams } from "next/navigation"
import { formatRupiah } from "@/lib/format"
import { api } from "@/lib/api"
import { ambilPeran } from "@/lib/auth"
import TabelMutasi, { SkeletonMutasi } from "@/components/TabelMutasi"
import Paginasi from "@/components/Paginasi"
import PesanInline from "@/components/PesanInline"
import Tombol, { kelasTombol } from "@/components/Tombol"

const kelasTombolNavigasi = `${kelasTombol({ varian: "sekunder", ukuran: "ringkas", tebal: "font-normal" })} gap-2 hover:bg-olive-50 active:bg-olive-50`

const PER_HALAMAN = 10

const STATUS_TIDAK_DITEMUKAN = [400, 403, 404]

const OPSI_API = { galatInline: true, aksesInline: true }

const HASIL_AWAL = {
  id: null,
  kunci: null,
  nasabah: null,
  tidakDitemukan: false,
  galatNasabah: false,
  saldo: null,
  galatSaldo: false,
  mutasi: null,
  totalHalaman: 0,
  galatMutasi: false,
}

// Pemetaan
function petakanMutasi(baris) {
  return {
    _id: baris._id,
    tipe: baris.tipe,
    jumlah: baris.jumlah,
    sumber: baris.sumber,
    referensiId: null,
    keterangan: baris.keterangan ?? "",
    saldoSetelah: baris.saldoSetelah,
    createdAt: baris.createdAt,
  }
}

function hilang(err) {
  return STATUS_TIDAK_DITEMUKAN.includes(err?.status) && !err?.data?.wajibGantiPassword
}

function GalatMuat({ onCobaLagi, className = "" }) {
  return (
    <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat" className={className}>
      <Tombol varian="sekunder" onClick={onCobaLagi}>
        Coba lagi
      </Tombol>
    </PesanInline>
  )
}

export default function Halaman() {
  const { id } = useParams()
  const admin = ambilPeran() === "admin"
  const [halaman, setHalaman] = useState(1)
  const [putaran, setPutaran] = useState(0)
  const [hasil, setHasil] = useState(HASIL_AWAL)

  const memuat = hasil.kunci !== `${id}|${halaman}|${putaran}`
  const tampil = hasil.id === id ? hasil : HASIL_AWAL
  const muatUlang = useCallback(() => setPutaran((n) => n + 1), [])

  // Data
  useEffect(() => {
    const kendali = new AbortController()
    const opsi = { ...OPSI_API, signal: kendali.signal }
    const idAman = encodeURIComponent(id)
    const kunci = `${id}|${halaman}|${putaran}`

    Promise.all([
      api(`/users/${idAman}`, opsi).then((r) => ({ data: r?.data ?? null }), (err) => ({ err })),
      api(`/nasabah/${idAman}/saldo`, opsi).then((r) => ({ data: r?.data ?? null }), (err) => ({ err })),
      api(`/nasabah/${idAman}/riwayat?halaman=${halaman}&limit=${PER_HALAMAN}`, opsi).then(
        (r) => ({ data: r?.data ?? [], paginasi: r?.paginasi }),
        (err) => ({ err })
      ),
    ]).then(([pengguna, saldo, riwayat]) => {
      if (kendali.signal.aborted) return
      const tidakDitemukan =
        hilang(pengguna.err) || (!pengguna.err && !pengguna.data) || hilang(saldo.err) || hilang(riwayat.err)
      setHasil({
        id,
        kunci,
        tidakDitemukan,
        nasabah: pengguna.data ? { nama: pengguna.data.nama ?? "", email: pengguna.data.email ?? "" } : null,
        galatNasabah: Boolean(pengguna.err),
        saldo: saldo.data,
        galatSaldo: Boolean(saldo.err) || !saldo.data,
        mutasi: riwayat.err ? null : riwayat.data.map(petakanMutasi),
        totalHalaman: riwayat.paginasi?.totalHalaman ?? 0,
        galatMutasi: Boolean(riwayat.err),
      })
    })

    return () => kendali.abort()
  }, [id, halaman, putaran])

  const { nasabah } = tampil

  if (!memuat && hasil.tidakDitemukan) {
    return (
      <main className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Nasabah tidak ditemukan</h1>
        <p className="mt-2 text-body text-ink-700">Periksa kembali, atau cari nasabah lain.</p>
        {admin ? (
          <Link href="/admin/kelola/pengguna" className={`${kelasTombolNavigasi} mt-4`}>
            <UsersThree size={20} weight="regular" aria-hidden="true" className="shrink-0" />
            Kelola pengguna
          </Link>
        ) : (
          <Link href="/petugas/setoran/baru" className={`${kelasTombolNavigasi} mt-4`}>
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="shrink-0" />
            Cari nasabah
          </Link>
        )}
      </main>
    )
  }

  if (!nasabah) {
    return (
      <main aria-busy={memuat || undefined} className="pb-6">
        <h1 className="text-h1 font-bold text-forest-900">Profil nasabah</h1>
        {!memuat && hasil.galatNasabah ? (
          <GalatMuat onCobaLagi={muatUlang} className="mt-4" />
        ) : (
          <p className="mt-4 text-body text-ink-700" role="status">
            Memuat profil nasabah…
          </p>
        )}
      </main>
    )
  }

  const { saldo } = tampil
  const memuatSaldo = memuat && !saldo
  const memuatMutasi = memuat

  return (
    <main className="pb-6">
      <h1 className="text-h1 font-bold text-forest-900">{nasabah.nama}</h1>
      <p className="mt-2 text-small text-ink-700">{nasabah.email}</p>
      {!admin && (
        <Link
          href={`/petugas/setoran/baru?nasabah=${id}`}
          className="mt-4 inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 hover-tombol min-[600px]:w-auto"
        >
          Catat setoran untuk nasabah ini
        </Link>
      )}

      <section
        aria-labelledby="judul-saldo"
        aria-busy={memuatSaldo || undefined}
        className="mt-6 rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
      >
        <h2 id="judul-saldo" className="text-body text-ink-700">
          Saldo
        </h2>
        {saldo ? (
          <>
            <p className="mt-1 text-display font-bold tabular-nums">{formatRupiah(saldo.saldo)}</p>
            <div className="mt-4">
              <p className="text-body text-ink-700">Saldo tersedia</p>
              <p className="text-amount font-bold tabular-nums">{formatRupiah(saldo.saldoTersedia)}</p>
            </div>
            {saldo.saldoTertahan > 0 && (
              <p className="mt-2 text-body text-ink-700">
                <span className="tabular-nums">{formatRupiah(saldo.saldoTertahan)}</span>{" "}
                sedang menunggu keputusan
              </p>
            )}
          </>
        ) : memuatSaldo ? (
          <p className="mt-1 text-body text-ink-700" role="status">
            Memuat saldo…
          </p>
        ) : null}
        {!memuat && hasil.galatSaldo && <GalatMuat onCobaLagi={muatUlang} className="mt-4" />}
      </section>

      <section aria-labelledby="judul-mutasi" aria-busy={memuatMutasi || undefined} className="mt-6">
        <h2 id="judul-mutasi" className="text-h2 font-bold">
          Riwayat mutasi
        </h2>
        <div className="mt-4">
          {memuatMutasi ? (
            <SkeletonMutasi />
          ) : hasil.galatMutasi ? (
            <GalatMuat onCobaLagi={muatUlang} />
          ) : hasil.mutasi.length === 0 ? (
            <p className="text-body text-ink-700">Belum ada transaksi</p>
          ) : (
            <TabelMutasi baris={hasil.mutasi} labelId="judul-mutasi" />
          )}
          <Paginasi
            halaman={halaman}
            totalHalaman={tampil.totalHalaman}
            onUbah={setHalaman}
            nonaktif={memuat}
          />
        </div>
      </section>
    </main>
  )
}
