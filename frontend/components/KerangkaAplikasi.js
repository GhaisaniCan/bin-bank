"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SignOut, User } from "@phosphor-icons/react"
import { ambilUser, hapusSesi } from "@/lib/auth"
import BilahMenu, { Merek } from "@/components/BilahMenu"

// Item menu pengguna
function ItemMenu({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-full items-center justify-start gap-1 whitespace-nowrap rounded-2 border-0 bg-transparent px-2 text-body font-normal text-olive-700 hover:bg-olive-50 hover:text-olive-800"
    >
      {children}
    </button>
  )
}

// Menu pengguna
function MenuPengguna({ item = [] }) {
  const router = useRouter()
  const idMenu = useId()
  const refWadah = useRef(null)
  const refTombol = useRef(null)
  const [nama, setNama] = useState("")
  const [terbuka, setTerbuka] = useState(false)

  useEffect(() => {
    setNama(ambilUser()?.nama ?? "")
  }, [])

  useEffect(() => {
    if (!terbuka) return
    function tekanTombol(e) {
      if (e.key !== "Escape") return
      setTerbuka(false)
      refTombol.current?.focus()
    }
    function klikLuar(e) {
      if (!refWadah.current?.contains(e.target)) setTerbuka(false)
    }
    document.addEventListener("keydown", tekanTombol)
    document.addEventListener("pointerdown", klikLuar)
    return () => {
      document.removeEventListener("keydown", tekanTombol)
      document.removeEventListener("pointerdown", klikLuar)
    }
  }, [terbuka])

  function buka(href) {
    setTerbuka(false)
    router.push(href)
  }

  function keluar() {
    setTerbuka(false)
    hapusSesi()
    router.replace("/login")
  }

  return (
    <div ref={refWadah} className="relative">
      <button
        ref={refTombol}
        type="button"
        aria-expanded={terbuka}
        aria-controls={idMenu}
        onClick={() => setTerbuka((v) => !v)}
        className="flex h-7 min-w-7 max-w-[240px] items-center gap-1 rounded-2 border-0 bg-transparent px-2 text-body font-normal text-ink-900 cursor-pointer hover:text-olive-700"
      >
        <span className="truncate">{nama}</span>
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-olive-50 text-forest-900">
          <User size={24} weight="regular" aria-hidden="true" />
        </span>
      </button>
      {terbuka && (
        <div id={idMenu} className="absolute right-0 top-full z-20 mt-1 flex flex-col rounded-2 bg-putih p-2 shadow-1">
          {item.map((menu) => {
            const Ikon = menu.ikon
            return (
              <ItemMenu key={menu.href} onClick={() => buka(menu.href)}>
                {Ikon && <Ikon size={24} weight="regular" aria-hidden="true" className="shrink-0" />}
                {menu.label}
              </ItemMenu>
            )
          })}
          <ItemMenu onClick={keluar}>
            <SignOut size={24} weight="regular" aria-hidden="true" className="shrink-0" />
            Keluar
          </ItemMenu>
        </div>
      )}
    </div>
  )
}

// Kerangka
export default function KerangkaAplikasi({ item, itemPengguna, children }) {
  return (
    <div className="min-h-dvh bg-krem-50 lg:flex">
      <BilahMenu item={item} />
      <div className="min-w-0 flex-1 pb-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto w-full max-w-[1120px] px-4 min-[600px]:px-5 lg:px-6">
          <header className="flex h-8 items-center justify-between gap-2 lg:justify-end">
            <Merek href={item[0]?.href ?? "/"} className="lg:hidden" />
            <MenuPengguna item={itemPengguna} />
          </header>
          {children}
        </div>
      </div>
    </div>
  )
}
