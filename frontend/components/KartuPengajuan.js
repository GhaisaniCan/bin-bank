"use client"

import { useState } from "react"
import Tombol from "@/components/Tombol"
import { formatJam, formatRupiah, formatTanggal } from "@/lib/format"

export default function KartuPengajuan({ pengajuan: p, onAksi }) {
  const [tersalin, setTersalin] = useState(false)
  const ewallet = p.metode?.toLowerCase() === "e-wallet"

  async function salin() {
    try {
      await navigator.clipboard.writeText(p.nomorEwallet)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 2000)
    } catch {}
  }

  return (
    <li className="rounded-2 border border-line-300 bg-putih p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <p className="text-body font-bold">{p.nasabah?.nama}</p>
        <p className="text-small text-ink-700">{formatTanggal(p.createdAt)}</p>
      </div>
      <p className="mt-1 text-amount font-bold tabular-nums">{formatRupiah(p.jumlah)}</p>
      <p className="mt-1 text-body text-ink-700">{ewallet ? "E-wallet" : "Tunai"}</p>

      {ewallet && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-body">{p.namaEwallet}</span>
          <span className="text-body tabular-nums">{p.nomorEwallet}</span>
          <Tombol varian="teks" onClick={salin}>
            {tersalin ? "Tersalin" : "Salin nomor"}
          </Tombol>
          <span className="sr-only" aria-live="polite">
            {tersalin ? "Nomor tersalin" : ""}
          </span>
        </div>
      )}

      {p.status === "disetujui" && p.diprosesOleh && (
        <p className="mt-2 text-small text-ink-700">
          Disetujui oleh {p.diprosesOleh.nama} pada {formatTanggal(p.diprosesPada)}, {formatJam(p.diprosesPada)}
        </p>
      )}

      {p.status === "ditolak" && (
        <p className="mt-2 text-body text-ink-900">Alasan: {p.catatan}</p>
      )}

      {p.status === "selesai" && p.dikonfirmasiOleh && (
        <div className="mt-2 text-small text-ink-700">
          <p>
            Diserahkan oleh {p.dikonfirmasiOleh.nama} pada {formatTanggal(p.dikonfirmasiPada)},{" "}
            {formatJam(p.dikonfirmasiPada)}
          </p>
          {p.catatanKonfirmasi && <p>Catatan: {p.catatanKonfirmasi}</p>}
        </div>
      )}

      {p.status === "diajukan" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Tombol varian="sekunder" onClick={() => onAksi?.("setujui", p)}>
            Setujui
          </Tombol>
          <Tombol varian="sekunder" onClick={() => onAksi?.("tolak", p)}>
            Tolak
          </Tombol>
        </div>
      )}

      {p.status === "disetujui" && (
        <div className="mt-4">
          <Tombol varian="sekunder" onClick={() => onAksi?.("selesai", p)}>
            Tandai selesai
          </Tombol>
        </div>
      )}
    </li>
  )
}
