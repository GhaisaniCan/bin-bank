import { ChartBar, Gear, House, Money, Plus, Receipt, Users } from "@phosphor-icons/react"

export const MENU_PETUGAS = [
  { label: "Beranda", href: "/petugas", ikon: House },
  { label: "Catat Setoran", href: "/petugas/setoran/baru", ikon: Plus },
  { label: "Setoran", href: "/petugas/setoran", ikon: Receipt },
  { label: "Penarikan", href: "/petugas/penarikan", ikon: Money },
  { label: "Nasabah", href: "/petugas/cari-nasabah", ikon: Users },
]

export const MENU_ADMIN = [
  { label: "Beranda", href: "/admin", ikon: House },
  { label: "Setoran", href: "/petugas/setoran", ikon: Receipt },
  { label: "Penarikan", href: "/petugas/penarikan", ikon: Money },
  { label: "Laporan", href: "/admin/laporan", ikon: ChartBar },
  { label: "Kelola", href: "/admin/kelola", ikon: Gear },
]
