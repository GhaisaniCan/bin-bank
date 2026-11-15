"use client"

import { useEffect, useRef, useState } from "react"
import { Prohibit, WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { ambilPeran } from "@/lib/auth"
import { formatJam, formatRupiah, formatTanggal } from "@/lib/format"
import { useDaring } from "@/lib/koneksi"
import { tampilkanToast } from "@/lib/toast"
import Dialog from "@/components/Dialog"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

function idNasabah(setoran) {
  const n = setoran.nasabah
  return typeof n === "string" ? n : n?._id ?? n?.id
}

function formatBerat(kg) {
  return `${(Number(kg) || 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
}

// Dialog
export function DialogBatalkanSetoran({ setoran, onTutup, onDibatalkan }) {
  const daring = useDaring()
  const refAlasan = useRef(null)
  const [saldo, setSaldo] = useState(null)
  const [galatSaldo, setGalatSaldo] = useState(null)
  const [alasan, setAlasan] = useState("")
  const [galatAlasan, setGalatAlasan] = useState("")
  const [galat, setGalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const nilai = setoran.totalNilai
  const kurang = saldo !== null && saldo < nilai

  useEffect(() => {
    api(`/nasabah/${idNasabah(setoran)}/saldo`, { galatInline: true })
      .then((hasil) => setSaldo(hasil.data.saldo))
      .catch(() => setGalatSaldo("Saldo nasabah belum bisa dimuat. Tutup lalu buka lagi dialog ini."))
  }, [setoran])

  async function kirim(e) {
    e.preventDefault()
    if (!alasan.trim()) {
      setGalatAlasan("Alasan pembatalan wajib diisi")
      refAlasan.current?.focus()
      return
    }
    setGalatAlasan("")
    setGalat(null)
    setMenyimpan(true)
    try {
      const hasil = await api(`/setoran/${setoran._id}/batal`, {
        method: "PATCH",
        body: { alasan: alasan.trim() },
        galatInline: true,
      })
      tampilkanToast("Setoran dibatalkan")
      onDibatalkan(hasil.data)
    } catch (err) {
      setGalat(
        err.status
          ? err.message
          : "Belum dipastikan tersimpan. Muat ulang rincian setoran sebelum mencoba lagi."
      )
      setMenyimpan(false)
    }
  }

  return (
    <Dialog judul="Batalkan setoran?" onTutup={onTutup} terkunci={menyimpan} fokusAwal={refAlasan}>
      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="text-small text-ink-700">Nasabah</dt>
          <dd className="font-bold break-words">{setoran.nasabah?.nama ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Setoran</dt>
          <dd>
            {setoran.tanggal && `${formatTanggal(setoran.tanggal)}, ${formatJam(setoran.tanggal)} · `}
            {formatBerat(setoran.totalBerat)}
          </dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Total setoran</dt>
          <dd className="text-amount font-bold tabular-nums">{formatRupiah(nilai)}</dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-small text-ink-700">Saldo sekarang</dt>
            <dd className="tabular-nums">{saldo === null ? "Memuat..." : formatRupiah(saldo)}</dd>
          </div>
          <div>
            <dt className="text-small text-ink-700">Saldo sesudah</dt>
            <dd className="font-bold tabular-nums">
              {saldo === null ? "Memuat..." : kurang ? "-" : formatRupiah(saldo - nilai)}
            </dd>
          </div>
        </div>
      </dl>

      {kurang && (
        <PesanInline
          varian="galat"
          ikon={WarningOctagon}
          isi={`Saldo nasabah ${formatRupiah(saldo)} tidak cukup untuk membatalkan setoran ${formatRupiah(
            nilai
          )} karena sebagian sudah ditarik.`}
          className="mt-4"
        />
      )}

      {galatSaldo && <PesanInline varian="galat" ikon={WarningOctagon} isi={galatSaldo} className="mt-4" />}

      <form onSubmit={kirim} noValidate className="mt-4">
        <label htmlFor="alasan-batal" className="block text-body font-bold">
          Alasan pembatalan
        </label>
        <textarea
          id="alasan-batal"
          ref={refAlasan}
          rows={3}
          maxLength={300}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          disabled={menyimpan}
          aria-invalid={galatAlasan ? true : undefined}
          aria-describedby={galatAlasan ? "alasan-batal-galat alasan-batal-bantuan" : "alasan-batal-bantuan"}
          className={`mt-2 w-full rounded-2 bg-putih px-3 py-3 text-body ${
            galatAlasan ? "border-2 border-bata-700" : "border border-line-500"
          }`}
        />
        {galatAlasan && (
          <p id="alasan-batal-galat" className="mt-2 text-small font-bold text-bata-700">
            {galatAlasan}
          </p>
        )}
        <p id="alasan-batal-bantuan" className="mt-2 text-small text-ink-500">
          {!kurang && `Saldo nasabah dikurangi ${formatRupiah(nilai)}. `}Alasan tampil di rincian setoran dan riwayat
          nasabah.
        </p>

        {galat && (
          <PesanInline varian="galat" ikon={WarningOctagon} judul="Setoran belum dibatalkan" isi={galat} className="mt-4" />
        )}

        {!daring && <p className="mt-4 text-small text-ink-700">Membatalkan setoran butuh koneksi.</p>}

        <div className="mt-5 flex flex-col gap-4 min-[600px]:flex-row">
          <Tombol
            type="submit"
            varian="merusak"
            disabled={!daring || saldo === null || kurang}
            memproses={menyimpan}
            teksMemproses="Membatalkan..."
            className="w-full min-[600px]:w-auto"
          >
            <Prohibit size={20} weight="regular" aria-hidden="true" className="mr-1" />
            Batalkan setoran {formatRupiah(nilai)}
          </Tombol>
          <Tombol varian="sekunder" disabled={menyimpan} onClick={onTutup} className="w-full min-[600px]:w-auto">
            Kembali
          </Tombol>
        </div>
      </form>
    </Dialog>
  )
}

// Tombol
export default function TombolBatalkanSetoran({ setoran, onDibatalkan, className = "" }) {
  const daring = useDaring()
  const [buka, setBuka] = useState(false)

  if (ambilPeran() !== "admin" || setoran?.status !== "TERCATAT") return null

  return (
    <>
      <Tombol varian="merusak" disabled={!daring} onClick={() => setBuka(true)} className={className}>
        <Prohibit size={20} weight="regular" aria-hidden="true" className="mr-1" />
        Batalkan setoran
      </Tombol>
      {buka && (
        <DialogBatalkanSetoran
          setoran={setoran}
          onTutup={() => setBuka(false)}
          onDibatalkan={(data) => {
            setBuka(false)
            onDibatalkan?.(data)
          }}
        />
      )}
    </>
  )
}
