"use client"

import RoleGuard from "@/components/RoleGuard"
import KerangkaAplikasi from "@/components/KerangkaAplikasi"
import { ambilPeran } from "@/lib/auth"
import { MENU_ADMIN, MENU_PETUGAS } from "@/lib/menu"

function Kerangka({ children }) {
  const menu = ambilPeran() === "admin" ? MENU_ADMIN : MENU_PETUGAS
  return <KerangkaAplikasi item={menu}>{children}</KerangkaAplikasi>
}

export default function Layout({ children }) {
  return (
    <RoleGuard peran={["petugas", "admin"]}>
      <Kerangka>{children}</Kerangka>
    </RoleGuard>
  )
}
