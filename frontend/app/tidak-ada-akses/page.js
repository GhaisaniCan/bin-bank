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

  function kembali() {
    const alamat = ambilToken() ? BERANDA[ambilPeran()] : null
    router.replace(alamat ?? "/login")
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <main className="mx-auto w-full max-w-[400px]">
        <p className="text-h2 font-bold text-forest-900">BinBank</p>
        <h1 className="mt-2 text-h1 font-bold text-bata-700">Tidak ada akses</h1>

        <p className="mt-3 text-body text-ink-900">Akun Anda tidak memiliki akses ke halaman ini. Hubungi admin RW.</p>

        <div className="mt-5">
          <Tombol varian="utama" className="w-full" onClick={kembali}>
            Kembali ke Beranda
          </Tombol>
        </div>
      </main>
    </div>
  )
}
