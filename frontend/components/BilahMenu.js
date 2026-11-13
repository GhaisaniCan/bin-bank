"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

function cocok(pathname, item, daftar) {
  const beranda = daftar.some((lain) => lain !== item && lain.href.startsWith(item.href + "/"))
  if (beranda) return pathname === item.href
  return pathname === item.href || pathname.startsWith(item.href + "/")
}

// Merek
export function Merek({ href, className = "" }) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-h2 font-bold text-forest-900 ${className}`}>
      <Image src="/logo-binbank.png" alt="" width={34} height={32} priority className="h-6 w-auto" />
      <span>BinBank</span>
    </Link>
  )
}

// Bilah menu
export default function BilahMenu({ item = [] }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line-300 bg-putih pb-[env(safe-area-inset-bottom)] lg:sticky lg:top-0 lg:h-dvh lg:w-[240px] lg:shrink-0 lg:border-t-0 lg:border-r lg:pb-0"
    >
      <div className="mb-4 hidden py-4 pr-4 pl-5 lg:block">
        <Merek href={item[0]?.href ?? "/"} className="w-fit" />
      </div>
      <ul className="flex h-8 lg:h-auto lg:flex-col">
        {item.map((menu) => {
          const aktif = cocok(pathname, menu, item)
          const Ikon = menu.ikon
          return (
            <li key={menu.href} className="flex flex-1 lg:flex-none">
              <Link
                href={menu.href}
                aria-current={aktif ? "page" : undefined}
                className={`relative flex min-h-7 min-w-7 flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-small text-ink-900 before:absolute before:inset-x-0 before:top-0 before:h-[3px] lg:h-7 lg:flex-row lg:justify-start lg:gap-3 lg:px-5 lg:text-left lg:text-body lg:before:inset-x-auto lg:before:inset-y-0 lg:before:left-0 lg:before:h-auto lg:before:w-[3px] ${
                  aktif ? "bg-olive-100 font-bold before:bg-olive-700" : "hover:bg-olive-50"
                }`}
              >
                {Ikon && <Ikon size={24} weight="regular" aria-hidden="true" className="shrink-0" />}
                <span>{menu.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
