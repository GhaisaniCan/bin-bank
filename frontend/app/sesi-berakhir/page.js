"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { hapusSesi } from "@/lib/auth"
import Tombol from "@/components/Tombol"

// Halaman
export default function Halaman() {
  const router = useRouter()

  useEffect(() => {
    hapusSesi()
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <main className="mx-auto w-full max-w-[400px]">
        <p className="text-h2 font-bold text-forest-900">BinBank</p>
        <h1 className="mt-2 text-h1 font-bold text-ink-500">Sesi berakhir</h1>

        <p className="mt-3 text-body text-ink-900">Sesi Anda sudah berakhir. Masuk lagi untuk melanjutkan.</p>

        <div className="mt-5">
          <Tombol varian="utama" className="w-full" onClick={() => router.replace("/login")}>
            Masuk lagi
          </Tombol>
        </div>
      </main>
    </div>
  )
}
