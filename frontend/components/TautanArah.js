"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"

const kelasIkon = "shrink-0 motion-safe:transition-transform motion-safe:duration-150"

// Tautan arah
export default function TautanArah({ href, kembali = false, className = "", children }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-7 items-center gap-1 text-body font-bold text-olive-700 hover:text-olive-800 focus-visible:text-olive-800 ${className}`}
    >
      {kembali && (
        <ArrowLeft
          size={16}
          weight="bold"
          aria-hidden="true"
          className={`${kelasIkon} motion-safe:group-hover:-translate-x-1 motion-safe:group-focus-visible:-translate-x-1`}
        />
      )}
      <span>{children}</span>
      {!kembali && (
        <ArrowRight
          size={16}
          weight="bold"
          aria-hidden="true"
          className={`${kelasIkon} motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1`}
        />
      )}
    </Link>
  )
}
