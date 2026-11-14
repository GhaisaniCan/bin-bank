"use client"

import { useRouter } from "next/navigation"
import { ambilPeran, ambilToken } from "@/lib/auth"
import Tombol from "@/components/Tombol"

const BERANDA = {
  nasabah: "/nasabah",
  petugas: "/petugas",
  admin: "/admin",
}

// Halaman
export default function Halaman() {
  const router = useRouter()

  function cobaLagi() {
    if (window.history.length > 1) {
      router.back()
      return
    }
    const alamat = ambilToken() ? BERANDA[ambilPeran()] : null
    router.replace(alamat ?? "/login")
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <main className="mx-auto w-full max-w-[400px]">
        <p className="text-h2 font-bold text-forest-900">BinBank</p>
        <h1 className="mt-2 text-h1 font-bold text-kuning-700">Layanan tidak tersedia</h1>

        <p className="mt-3 text-body text-ink-900">Saat ini layanan BinBank sedang tidak tersedia. Periksa koneksi Anda dan coba lagi.</p>

        <div className="mt-5">
          <Tombol varian="utama" className="w-full" onClick={cobaLagi}>
            Coba lagi
          </Tombol>
        </div>
      </main>
    </div>
  )
}
