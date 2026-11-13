const KUNCI_TOKEN = "binbank_token"
const KUNCI_USER = "binbank_user"

export function simpanSesi(token, user) {
  localStorage.setItem(KUNCI_TOKEN, token)
  localStorage.setItem(KUNCI_USER, JSON.stringify(user))
}

export function ambilToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(KUNCI_TOKEN)
}

export function ambilUser() {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(KUNCI_USER))
  } catch {
    return null
  }
}

export function ambilPeran() {
  return ambilUser()?.role ?? null
}

export function hapusSesi() {
  localStorage.removeItem(KUNCI_TOKEN)
  localStorage.removeItem(KUNCI_USER)
}

export const BERANDA = {
  nasabah: "/nasabah",
  petugas: "/petugas",
  admin: "/admin",
}
