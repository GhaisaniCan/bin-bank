"use client"

import RoleGuard from "@/components/RoleGuard"
import KerangkaAplikasi from "@/components/KerangkaAplikasi"
import { MENU_ADMIN } from "@/lib/menu"

export default function Layout({ children }) {
  return (
    <RoleGuard peran={["admin"]}>
      <KerangkaAplikasi item={MENU_ADMIN}>{children}</KerangkaAplikasi>
    </RoleGuard>
  )
}
