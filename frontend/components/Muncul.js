"use client"

import { useLayoutEffect, useRef } from "react"

// Muncul
export default function Muncul({ arah = "naik", jeda = 0, className = "", children }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    el.dataset.tahap = "sembunyi"
    let bingkai = 0
    const pengamat = new IntersectionObserver(
      (entri) => {
        if (!entri.some((e) => e.isIntersecting)) return
        pengamat.disconnect()
        bingkai = requestAnimationFrame(() => {
          bingkai = requestAnimationFrame(() => {
            if (jeda) el.style.transitionDelay = `${jeda}ms`
            el.dataset.tahap = "tampil"
          })
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )
    pengamat.observe(el)
    return () => {
      pengamat.disconnect()
      cancelAnimationFrame(bingkai)
      if (el.dataset.tahap === "sembunyi") delete el.dataset.tahap
    }
  }, [jeda])

  return (
    <div ref={ref} data-muncul={arah} className={className}>
      {children}
    </div>
  )
}
