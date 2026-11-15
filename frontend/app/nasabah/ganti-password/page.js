"use client"

import { useState } from "react"
import { tampilkanToast } from "@/lib/toast"
import FormGantiPassword from "@/components/FormGantiPassword"

// Halaman
export default function Halaman() {
  const [putaran, setPutaran] = useState(0)

  function setelahBerhasil() {
    tampilkanToast("Password berhasil diganti")
    setPutaran((n) => n + 1)
  }

  return (
    <main className="max-w-[400px] pb-6">
      <h1 className="text-h1 font-bold text-forest-900">Ganti password</h1>
      <FormGantiPassword key={putaran} onBerhasil={setelahBerhasil} />
    </main>
  )
}
