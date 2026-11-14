"use client"

import { useEffect, useRef } from "react"
import { X } from "@phosphor-icons/react"

export default function Dialog({ judul, onTutup, terkunci = false, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
    return () => {
      if (el?.open) el.close()
    }
  }, [])

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
          <h2 id="judul-dialog" className="text-h2 font-bold">
            {judul}
          </h2>
          <button
            type="button"
            onClick={onTutup}
            disabled={terkunci}
            className="flex min-h-7 shrink-0 items-center gap-1 text-body text-olive-700 underline decoration-1 hover:decoration-2 disabled:text-ink-500 disabled:no-underline"
          >
            <X size={24} weight="regular" aria-hidden="true" />
            Tutup
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
