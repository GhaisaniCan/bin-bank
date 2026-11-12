"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ambilToken, ambilPeran } from "@/lib/auth"

export default function RoleGuard({ peran, children }) {
  const router = useRouter()
  const [boleh, setBoleh] = useState(false)

  useEffect(() => {
    if (!ambilToken()) {
      router.replace("/login")
      return
    }
    if (!peran.includes(ambilPeran())) {
      router.replace("/tidak-ada-akses")
      return
    }
    setBoleh(true)
  }, [peran, router])

  if (!boleh) return null
  return children
}