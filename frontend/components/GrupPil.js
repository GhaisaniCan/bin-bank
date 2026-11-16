"use client"

import { useRef } from "react"

export default function GrupPil({ pilihan, aktif, onUbah, label, sebagaiTab = false, idPanel = "panel-status" }) {
  const refPil = useRef([])

  function tekan(e, i) {
    let ke = null
    if (e.key === "ArrowRight") ke = (i + 1) % pilihan.length
    else if (e.key === "ArrowLeft") ke = (i - 1 + pilihan.length) % pilihan.length
    else if (e.key === "Home") ke = 0
    else if (e.key === "End") ke = pilihan.length - 1
    if (ke === null) return
    e.preventDefault()
    refPil.current[ke]?.focus()
  }

  return (
    <div
      role={sebagaiTab ? "tablist" : "group"}
      aria-label={label}
      className="-mx-4 -mt-4 -mb-6 flex gap-2 overflow-x-auto px-4 pt-5 pb-7 min-[600px]:-mx-5 min-[600px]:px-5 lg:-mx-6 lg:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {pilihan.map((p, i) => {
        const terpilih = p.id === aktif
        const atribut = sebagaiTab
          ? {
              role: "tab",
              id: `tab-${p.id}`,
              "aria-selected": terpilih,
              "aria-controls": idPanel,
              tabIndex: terpilih ? 0 : -1,
              onKeyDown: (e) => tekan(e, i),
            }
          : { "aria-pressed": terpilih }
        return (
          <button
            key={p.id}
            ref={(el) => {
              refPil.current[i] = el
            }}
            type="button"
            {...atribut}
            onClick={() => onUbah(p.id)}
            className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-body hover-tombol ${
              terpilih ? "bg-olive-700 font-bold text-putih" : "bg-olive-50 text-ink-900"
            }`}
          >
            {p.jumlah === undefined ? p.label : `${p.label} (${p.jumlah})`}
          </button>
        )
      })}
    </div>
  )
}
