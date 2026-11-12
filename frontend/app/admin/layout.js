import RoleGuard from "@/components/RoleGuard"

export default function Layout({ children }) {
  return <RoleGuard peran={["admin"]}>{children}</RoleGuard>
}
