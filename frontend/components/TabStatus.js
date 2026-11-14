"use client"

import { useRef } from "react"

export default function TabStatus({ tab, aktif, onUbah }) {
  const refTab = useRef([])

  function tekan(e, i) {
    let ke = null
    if (e.key === "ArrowRight") ke = (i + 1) % tab.length
    else if (e.key === "ArrowLeft") ke = (i - 1 + tab.length) % tab.length
    else if (e.key === "Home") ke = 0
    else if (e.key === "End") ke = tab.length - 1
    if (ke === null) return
    e.preventDefault()
    refTab.current[ke]?.focus()
  }

  return (
    <div role="tablist" aria-label="Status penarikan" className="grid grid-cols-2 gap-2 min-[600px]:flex">
      {tab.map((t, i) => {
        const terpilih = t.id === aktif
        return (
          <button
            key={t.id}
            ref={(el) => {
              refTab.current[i] = el
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={terpilih}
            aria-controls="panel-status"
            tabIndex={terpilih ? 0 : -1}
            onClick={() => onUbah(t.id)}
            onKeyDown={(e) => tekan(e, i)}
            className={`min-h-7 border-b-[3px] px-3 text-body text-ink-900 ${
              terpilih ? "border-ink-900 font-bold" : "border-transparent hover:bg-olive-50"
            }`}
          >
            {t.label} ({t.jumlah})
          </button>
        )
      })}
    </div>
  )
}
