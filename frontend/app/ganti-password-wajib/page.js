"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ambilToken, ambilUser, BERANDA } from "@/lib/auth"
import { tampilkanToast } from "@/lib/toast"
import FormGantiPassword from "@/components/FormGantiPassword"

const KETERANGAN = "Anda masuk dengan password sementara. Buat password baru sebelum melanjutkan."

// Halaman
export default function Halaman() {
  const router = useRouter()
  const [siap, setSiap] = useState(false)

  useEffect(() => {
    if (!ambilToken()) {
      router.replace("/login")
      return
    }
    const user = ambilUser()
    if (user?.wajibGantiPassword !== true) {
      router.replace(BERANDA[user?.role] ?? "/login")
      return
    }
    setSiap(true)
  }, [router])

  function setelahBerhasil(user) {
    tampilkanToast("Password diganti")
    router.replace(BERANDA[user.role] ?? "/login")
  }

  if (!siap) return null

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <main className="mx-auto w-full max-w-[400px]">
        <p className="text-h2 font-bold text-forest-900">BinBank</p>
        <h1 className="mt-2 text-h1 font-bold text-ink-900">Ganti password</h1>
        <FormGantiPassword keterangan={KETERANGAN} onBerhasil={setelahBerhasil} />
      </main>
    </div>
  )
}
