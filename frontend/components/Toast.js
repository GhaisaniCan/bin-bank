"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ambilToast, langgananToast, tutupToast } from "@/lib/toast"

const DURASI = 8000

function bacaToast(mentah) {
  if (!mentah) return null
  try {
    return JSON.parse(mentah)
  } catch {
    return null
  }
}

// Isi toast
function IsiToast({ pesan }) {
  const [disorot, setDisorot] = useState(false)
  const [berfokus, setBerfokus] = useState(false)
  const sisa = useRef(DURASI)
  const jeda = disorot || berfokus

  useEffect(() => {
    if (jeda) return
    const mulai = Date.now()
    const waktu = setTimeout(tutupToast, sisa.current)
    return () => {
      clearTimeout(waktu)
      sisa.current = Math.max(0, sisa.current - (Date.now() - mulai))
    }
  }, [jeda])

  return (
    <div
      onMouseEnter={() => setDisorot(true)}
      onMouseLeave={() => setDisorot(false)}
      onFocus={() => setBerfokus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setBerfokus(false)
      }}
      className="flex items-center justify-between gap-4 rounded-2 bg-ink-900 py-2 pl-4 pr-2 text-body text-putih shadow-1"
    >
      <p>{pesan}</p>
      <button
        type="button"
        onClick={tutupToast}
        className="h-7 shrink-0 rounded-2 border-0 bg-transparent px-2 text-body font-bold text-putih underline decoration-1 hover:decoration-2 focus-visible:outline-putih"
      >
        Tutup
      </button>
    </div>
  )
}

// Wadah toast
export default function Toast() {
  const mentah = useSyncExternalStore(langgananToast, ambilToast, () => null)
  const toast = bacaToast(mentah)

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-8 z-10 mx-auto max-w-[400px] [&>*]:pointer-events-auto"
    >
      {toast?.pesan && <IsiToast key={toast.id} pesan={toast.pesan} />}
    </div>
  )
}
