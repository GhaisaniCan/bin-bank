"use client"

import { useRef } from "react"

// Berdering
export default function Berdering({ className = "", children }) {
  const ref = useRef(null)
  const pergi = useRef(false)

  function masuk() {
    pergi.current = false
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    ref.current.dataset.dering = "aktif"
  }

  function keluar() {
    pergi.current = true
  }

  function putaranSelesai() {
    if (pergi.current) delete ref.current.dataset.dering
  }

  return (
    <div
      ref={ref}
      onMouseEnter={masuk}
      onMouseLeave={keluar}
      onAnimationIteration={putaranSelesai}
      className={`origin-center ${className}`}
    >
      {children}
    </div>
  )
}
