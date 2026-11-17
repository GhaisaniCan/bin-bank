import { ambilToken, hapusSesi } from "@/lib/auth"

const BASE = "/api"

export class ApiError extends Error {
  constructor(pesan, status, data) {
    super(pesan)
    this.status = status
    this.data = data
  }
}

export async function api(path, { method = "GET", body, tanpaRedirect = false, galatInline = false, aksesInline = false, signal } = {}) {
  const headers = {}
  const token = ambilToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const formData = typeof FormData !== "undefined" && body instanceof FormData
  if (body !== undefined && !formData) headers["Content-Type"] = "application/json"

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : formData ? body : JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (signal?.aborted) throw err
    if (!tanpaRedirect && !galatInline) window.location.href = "/layanan-tidak-tersedia"
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
    } else if (res.status === 403 && data?.wajibGantiPassword === true) {
      window.location.href = "/ganti-password-wajib"
    } else if (res.status === 403 && !aksesInline) {
      window.location.href = "/tidak-ada-akses"
    } else if (res.status >= 500 && !galatInline) {
      window.location.href = "/layanan-tidak-tersedia"
    }
  }

  throw new ApiError(data?.message || data?.pesan || "Terjadi kesalahan", res.status, data)
}