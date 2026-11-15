"use client"

import { useSyncExternalStore } from "react"

function langgan(perbarui) {
  window.addEventListener("scroll", perbarui, { passive: true })
  return () => window.removeEventListener("scroll", perbarui)
}

function sudahDigulir() {
  return window.scrollY > 8
}

// Kepala lekat
export default function KepalaLekat({ children }) {
  const digulir = useSyncExternalStore(langgan, sudahDigulir, () => false)

  return (
    <header
      className={`sticky top-0 z-30 border-b-2 border-olive-100 bg-krem-50 transition-shadow duration-150 motion-reduce:transition-none ${
        digulir ? "shadow-1" : "shadow-0"
      }`}
    >
      {children}
    </header>
  )
}
