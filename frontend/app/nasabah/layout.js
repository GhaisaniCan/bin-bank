"use client"

import { ClockCounterClockwise, House, Key, Tag, Wallet } from "@phosphor-icons/react"
import RoleGuard from "@/components/RoleGuard"
import KerangkaAplikasi from "@/components/KerangkaAplikasi"

const MENU_NASABAH = [
  { label: "Beranda", href: "/nasabah", ikon: House },
  { label: "Riwayat", href: "/nasabah/riwayat", ikon: ClockCounterClockwise },
  { label: "Tarik Saldo", href: "/nasabah/tarik-saldo", ikon: Wallet },
  { label: "Harga", href: "/nasabah/harga", ikon: Tag },
]

const MENU_PENGGUNA_NASABAH = [{ label: "Ganti password", href: "/nasabah/ganti-password", ikon: Key }]

export default function Layout({ children }) {
  return (
    <RoleGuard peran={["nasabah"]}>
      <KerangkaAplikasi item={MENU_NASABAH} itemPengguna={MENU_PENGGUNA_NASABAH}>{children}</KerangkaAplikasi>
    </RoleGuard>
  )
}
