"use client"

import { useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import Dialog from "@/components/Dialog"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import { formatRupiah } from "@/lib/format"

export default function DialogProses({
  pengajuan: p,
  mode,
  namaPetugas,
  memproses = false,
  terkirim = false,
  pesan = "",
  onKonfirmasi,
  onTutup,
}) {
  const [alasan, setAlasan] = useState("")

  const setuju = mode === "setujui"
  const ewallet = p.metode?.toLowerCase() === "e-wallet"
  const adaSaldo = typeof p.saldoNasabah === "number"
  const kurang = setuju && adaSaldo && p.saldoNasabah < 0
  const alasanKosong = !setuju && alasan.trim() === ""

  function kirim() {
    if (memproses || terkirim || alasanKosong) return
    onKonfirmasi(setuju ? {} : { alasan: alasan.trim() })
  }

  return (
    <Dialog judul={setuju ? "Setujui pengajuan" : "Tolak pengajuan"} onTutup={onTutup} terkunci={memproses}>
      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="text-small text-ink-700">Nasabah</dt>
          <dd className="text-body font-bold">{p.nasabah?.nama}</dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Nominal</dt>
          <dd className="text-amount font-bold tabular-nums">{formatRupiah(p.jumlah)}</dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Metode</dt>
          <dd className="text-body">
            {ewallet ? `E-wallet, ${p.namaEwallet} ${p.nomorEwallet}` : "Tunai"}
          </dd>
        </div>
        {setuju && (
          <div>
            <dt className="text-small text-ink-700">Saldo tersedia nasabah</dt>
            <dd className="text-body font-bold tabular-nums">{adaSaldo ? formatRupiah(p.saldoNasabah) : "-"}</dd>
            <dd className="text-small text-ink-500">Sudah dikurangi pengajuan yang menunggu, termasuk pengajuan ini</dd>
          </div>
        )}
        {namaPetugas && (
          <div>
            <dt className="text-small text-ink-700">Diproses oleh</dt>
            <dd className="text-body">{namaPetugas}</dd>
          </div>
        )}
      </dl>

      {kurang && (
        <p role="alert" className="mt-4 text-body font-bold text-bata-700">
          Saldo tersedia nasabah kini {formatRupiah(p.saldoNasabah)}. Server akan menolak bila saldo tidak mencukupi.
        </p>
      )}

      {pesan && <PesanInline varian="galat" ikon={WarningOctagon} isi={pesan} className="mt-4" />}

      {!setuju && (
        <div className="mt-4">
          <label htmlFor="alasan" className="block text-body font-bold">
            Alasan penolakan
          </label>
          <textarea
            id="alasan"
            rows={3}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            disabled={memproses || terkirim}
            className="mt-2 w-full rounded-2 border border-line-500 bg-putih px-3 py-3 text-body"
          />
          <p className="mt-2 text-small text-ink-500">
            Alasan wajib diisi dan terlihat oleh nasabah
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {setuju ? (
          <Tombol varian="utama" disabled={terkirim} memproses={memproses} onClick={kirim}>
            Setujui {formatRupiah(p.jumlah)}
          </Tombol>
        ) : (
          <Tombol varian="merusak" disabled={alasanKosong || terkirim} memproses={memproses} onClick={kirim}>
            Tolak pengajuan
          </Tombol>
        )}
        <Tombol varian="sekunder" disabled={memproses} onClick={onTutup}>
          {terkirim && !memproses ? "Tutup" : "Batal"}
        </Tombol>
      </div>
    </Dialog>
  )
}
