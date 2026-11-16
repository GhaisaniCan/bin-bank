"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DotsThreeVertical } from "@phosphor-icons/react"

const JARAK = 4
const TEPI = 8

// Item
function ItemAksi({ item, refItem, onPilih, onKeyDown }) {
  const Ikon = item.ikon
  return (
    <button
      ref={refItem}
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={item.nonaktif}
      onClick={onPilih}
      onKeyDown={onKeyDown}
      className={`flex h-7 w-full items-center justify-start gap-1 whitespace-nowrap rounded-2 border-0 bg-transparent px-2 text-body font-normal hover:bg-olive-50 focus-visible:bg-olive-50 disabled:text-ink-500 disabled:hover:bg-transparent ${
        item.bahaya ? "text-bata-700" : "text-olive-700 hover:text-olive-800"
      }`}
    >
      {Ikon && <Ikon size={24} weight="regular" aria-hidden="true" className="shrink-0" />}
      {item.label}
    </button>
  )
}

// Menu aksi
export default function MenuAksi({ label, item = [], disabled = false }) {
  const idMenu = useId()
  const refPemicu = useRef(null)
  const refMenu = useRef(null)
  const refItem = useRef([])
  const refFokus = useRef(null)
  const [terbuka, setTerbuka] = useState(false)
  const [posisi, setPosisi] = useState(null)

  const aktif = item.map((it, i) => (it.nonaktif ? null : i)).filter((i) => i !== null)

  function buka(ke = "pertama") {
    if (disabled || aktif.length === 0) return
    refFokus.current = ke === "terakhir" ? aktif[aktif.length - 1] : aktif[0]
    setPosisi(null)
    setTerbuka(true)
  }

  function tutup(kembali = true) {
    setTerbuka(false)
    setPosisi(null)
    if (kembali) refPemicu.current?.focus()
  }

  // Posisi
  useLayoutEffect(() => {
    if (!terbuka) return
    function hitung() {
      const pemicu = refPemicu.current?.getBoundingClientRect()
      const menu = refMenu.current
      if (!pemicu || !menu) return
      const tinggi = menu.offsetHeight
      const lebar = menu.offsetWidth
      const ruangBawah = window.innerHeight - pemicu.bottom
      const keAtas = ruangBawah < tinggi + JARAK + TEPI && pemicu.top > ruangBawah
      const atas = keAtas ? Math.max(TEPI, pemicu.top - tinggi - JARAK) : pemicu.bottom + JARAK
      const kiri = Math.max(TEPI, Math.min(pemicu.right - lebar, window.innerWidth - lebar - TEPI))
      setPosisi({ atas, kiri })
    }
    hitung()
    window.addEventListener("resize", hitung)
    window.addEventListener("scroll", hitung, true)
    return () => {
      window.removeEventListener("resize", hitung)
      window.removeEventListener("scroll", hitung, true)
    }
  }, [terbuka])

  // Fokus awal
  useEffect(() => {
    if (!terbuka || !posisi || refFokus.current === null) return
    refItem.current[refFokus.current]?.focus()
    refFokus.current = null
  }, [terbuka, posisi])

  // Tutup luar
  useEffect(() => {
    if (!terbuka) return
    function tekanTombol(e) {
      if (e.key === "Escape") tutup()
    }
    function klikLuar(e) {
      if (refPemicu.current?.contains(e.target) || refMenu.current?.contains(e.target)) return
      tutup(false)
    }
    document.addEventListener("keydown", tekanTombol)
    document.addEventListener("pointerdown", klikLuar)
    return () => {
      document.removeEventListener("keydown", tekanTombol)
      document.removeEventListener("pointerdown", klikLuar)
    }
  }, [terbuka])

  useEffect(() => {
    if (disabled && terbuka) tutup(false)
  }, [disabled, terbuka])

  // Keyboard
  function tombolPemicu(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      buka("pertama")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      buka("terakhir")
    }
  }

  function tombolItem(e, i) {
    const posisiAktif = aktif.indexOf(i)
    let tujuan = null
    if (e.key === "ArrowDown") tujuan = aktif[(posisiAktif + 1) % aktif.length]
    else if (e.key === "ArrowUp") tujuan = aktif[(posisiAktif - 1 + aktif.length) % aktif.length]
    else if (e.key === "Home") tujuan = aktif[0]
    else if (e.key === "End") tujuan = aktif[aktif.length - 1]
    else if (e.key === "Tab") return tutup()
    if (tujuan === null) return
    e.preventDefault()
    refItem.current[tujuan]?.focus()
  }

  function pilih(it) {
    tutup()
    it.onPilih?.()
  }

  const menu = terbuka && (
    <div
      ref={refMenu}
      id={idMenu}
      role="menu"
      aria-label={label}
      style={{ top: posisi?.atas ?? 0, left: posisi?.kiri ?? 0, visibility: posisi ? "visible" : "hidden" }}
      className="fixed z-20 flex flex-col rounded-2 bg-putih p-2 shadow-1"
    >
      {item.map((it, i) => (
        <div key={it.label} role="none">
          {it.bahaya && i > 0 && !item[i - 1].bahaya && (
            <div role="separator" className="my-2 border-t border-line-300" />
          )}
          <ItemAksi
            item={it}
            refItem={(el) => {
              refItem.current[i] = el
            }}
            onPilih={() => pilih(it)}
            onKeyDown={(e) => tombolItem(e, i)}
          />
        </div>
      ))}
    </div>
  )

  return (
    <>
      <button
        ref={refPemicu}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={terbuka}
        aria-controls={terbuka ? idMenu : undefined}
        disabled={disabled}
        onClick={() => (terbuka ? tutup() : buka("pertama"))}
        onKeyDown={tombolPemicu}
        className="flex size-7 shrink-0 items-center justify-center rounded-2 border-0 bg-transparent text-ink-900 enabled:cursor-pointer enabled:hover:text-olive-700 motion-safe:transition-colors motion-safe:duration-150 disabled:text-ink-500"
      >
        <DotsThreeVertical size={24} weight="regular" aria-hidden="true" />
      </button>
      {menu && createPortal(menu, document.body)}
    </>
  )
}
