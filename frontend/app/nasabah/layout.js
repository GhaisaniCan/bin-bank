import RoleGuard from "@/components/RoleGuard"

export default function Layout({ children }) {
  return <RoleGuard peran={["nasabah"]}>{children}</RoleGuard>
}
