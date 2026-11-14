"use client"

import { House, Money, Plus, Receipt, Users } from "@phosphor-icons/react"
import RoleGuard from "@/components/RoleGuard"
import KerangkaAplikasi from "@/components/KerangkaAplikasi"

const MENU_PETUGAS = [
  { label: "Beranda", href: "/petugas", ikon: House },
  { label: "Catat Setoran", href: "/petugas/setoran/baru", ikon: Plus },
  { label: "Setoran", href: "/petugas/setoran", ikon: Receipt },
  { label: "Penarikan", href: "/petugas/penarikan", ikon: Money },
  { label: "Nasabah", href: "/petugas/cari-nasabah", ikon: Users },
]

export default function Layout({ children }) {
  return (
    <RoleGuard peran={["petugas", "admin"]}>
      <KerangkaAplikasi item={MENU_PETUGAS}>{children}</KerangkaAplikasi>
    </RoleGuard>
  )
}