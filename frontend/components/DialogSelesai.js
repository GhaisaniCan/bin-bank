"use client"

import { useState } from "react"
import { WarningOctagon } from "@phosphor-icons/react"
import Dialog from "@/components/Dialog"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import { formatRupiah } from "@/lib/format"

export default function DialogSelesai({
  pengajuan: p,
  namaPetugas,
  memproses = false,
  terkirim = false,
  pesan = "",
  onKonfirmasi,
  onTutup,
}) {
  const [catatan, setCatatan] = useState("")
  const ewallet = p.metode?.toLowerCase() === "e-wallet"

  function kirim() {
    if (memproses || terkirim) return
    onKonfirmasi({ catatan: catatan.trim() })
  }

  return (
    <Dialog judul="Dana sudah diserahkan" onTutup={onTutup} terkunci={memproses}>
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
        {namaPetugas && (
          <div>
            <dt className="text-small text-ink-700">Diserahkan oleh</dt>
            <dd className="text-body">{namaPetugas}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <label htmlFor="catatan" className="block text-body font-bold">
          Catatan (opsional)
        </label>
        <textarea
          id="catatan"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          disabled={memproses || terkirim}
          className="mt-2 w-full rounded-2 border border-line-500 bg-putih px-3 py-3 text-body"
        />
        <p className="mt-2 text-small text-ink-500">Misalnya referensi transfer</p>
      </div>

      {pesan && <PesanInline varian="galat" ikon={WarningOctagon} isi={pesan} className="mt-4" />}

      <div className="mt-5 flex flex-wrap gap-3">
        <Tombol varian="utama" disabled={terkirim} memproses={memproses} onClick={kirim}>
          Konfirmasi dana sudah diserahkan
        </Tombol>
        <Tombol varian="sekunder" disabled={memproses} onClick={onTutup}>
          {terkirim && !memproses ? "Tutup" : "Batal"}
        </Tombol>
      </div>
    </Dialog>
  )
}
