"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"
import { ambilToken, ambilPeran, BERANDA } from "@/lib/auth"

const kelasUkuran = {
  biasa: "h-7 min-w-[96px] gap-2 px-5 text-h3",
  ringkas: "relative h-[40px] gap-1 px-4 text-h3 after:absolute after:inset-x-0 after:-inset-y-[2px]",
  hero: "relative h-[40px] gap-1 px-4 text-body sm:text-h3 after:absolute after:inset-x-0 after:-inset-y-[2px] lg:h-7 lg:min-w-[96px] lg:gap-2 lg:px-5",
}

const kelasGerak =
  "motion-safe:transition-[scale,box-shadow] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:scale-105 motion-safe:focus-visible:scale-105 motion-safe:hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-olive-800)_30%,transparent)] motion-safe:focus-visible:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-olive-800)_30%,transparent)]"

const kelasGerakPanah =
  "motion-safe:transition-[translate] motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"

const kelasPanah = {
  biasa: "size-5",
  ringkas: "size-4",
  hero: "size-4 lg:size-5",
}

function langgan(perbarui) {
  window.addEventListener("storage", perbarui)
  return () => window.removeEventListener("storage", perbarui)
}

function berandaSesi() {
  if (!ambilToken()) return null
  return BERANDA[ambilPeran()] ?? null
}

// Tombol masuk
export default function TombolMasuk({ teks = "Masuk", ukuran = "biasa", panah = false, className = "" }) {
  const beranda = useSyncExternalStore(langgan, berandaSesi, () => null)

  return (
    <Link
      href={beranda ?? "/login"}
      className={`group inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-olive-700 font-bold text-putih no-underline hover:bg-olive-800 active:bg-olive-800 hover-tombol ${kelasUkuran[ukuran]} ${className}`}
    >
      <span>{teks}</span>
      {panah && <ArrowRight weight="bold" aria-hidden="true" className={`shrink-0 ${kelasGerakPanah} ${kelasPanah[ukuran]}`} />}
    </Link>
  )
}
