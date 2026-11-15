"use client"

import { useState } from "react"
import { Copy } from "@phosphor-icons/react"
import Tombol from "@/components/Tombol"

const HURUF_AMAN = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"

export function buatPasswordAcak(panjang = 10) {
  const acak = new Uint32Array(panjang)
  crypto.getRandomValues(acak)
  return Array.from(acak, (n) => HURUF_AMAN[n % HURUF_AMAN.length]).join("")
}

export default function KotakRahasia({ label, nilai, className = "" }) {
  const [status, setStatus] = useState("")

  async function salin() {
    try {
      await navigator.clipboard.writeText(nilai)
      setStatus("Tersalin")
    } catch {
      setStatus("Gagal menyalin. Pilih teks lalu salin manual.")
    }
  }

  return (
    <div className={className}>
      <p className="text-small text-ink-700">{label}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2 bg-olive-50 p-4">
        <span className="min-w-0 break-all font-mono text-[24px] font-bold leading-[32px] tabular-nums select-all">{nilai}</span>
        <Tombol varian="sekunder" onClick={salin}>
          <Copy size={20} weight="regular" aria-hidden="true" className="mr-1" />
          Salin
        </Tombol>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-small font-bold text-daun-700">
        {status}
      </p>
      <p className="text-small text-ink-700">Tidak bisa dilihat lagi setelah layar ini ditutup.</p>
    </div>
  )
}
