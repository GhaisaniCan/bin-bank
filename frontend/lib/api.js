import { ambilToken, hapusSesi } from "@/lib/auth"

const BASE = "/api"

export class ApiError extends Error {
  constructor(pesan, status, data) {
    super(pesan)
    this.status = status
    this.data = data
  }
}

export async function api(path, { method = "GET", body, tanpaRedirect = false } = {}) {
  const headers = {}
  const token = ambilToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    if (!tanpaRedirect) window.location.href = "/layanan-tidak-tersedia"
    throw new ApiError("Layanan tidak tersedia", 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (res.ok) return data

  if (!tanpaRedirect) {
    if (res.status === 401) {
      hapusSesi()
      window.location.href = "/sesi-berakhir"
    } else if (res.status === 403) {
      window.location.href = "/tidak-ada-akses"
    } else if (res.status >= 500) {
      window.location.href = "/layanan-tidak-tersedia"
    }
  }

  throw new ApiError(data?.message || data?.pesan || "Terjadi kesalahan", res.status, data)
}