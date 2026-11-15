"use client"

import { useEffect, useRef } from "react"
import TombolTutup from "@/components/TombolTutup"

export default function Dialog({ judul, onTutup, terkunci = false, fokusAwal, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
    fokusAwal?.current?.focus()
    return () => {
      if (el?.open) el.close()
    }
  }, [fokusAwal])

  function batal(e) {
    e.preventDefault()
    if (!terkunci) onTutup()
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="judul-dialog"
      onCancel={batal}
      className="m-auto w-[min(480px,calc(100%-32px))] rounded-3 bg-putih p-0 text-ink-900 shadow-2 backdrop:bg-ink-900/50"
    >
      <div className="p-4 min-[600px]:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-dialog" className="min-w-0 flex-1 break-words text-h2 font-bold">
            {judul}
          </h2>
          <TombolTutup onClick={onTutup} disabled={terkunci} className="-mr-2 -mt-2" />
        </div>
        {children}
      </div>
    </dialog>
  )
}
