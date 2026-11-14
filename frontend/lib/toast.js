const KUNCI_TOAST = "binbank_toast"
const PERISTIWA_TOAST = "binbank-toast"

function kabari() {
  window.dispatchEvent(new Event(PERISTIWA_TOAST))
}

export function tampilkanToast(pesan) {
  try {
    sessionStorage.setItem(KUNCI_TOAST, JSON.stringify({ pesan, id: Date.now() }))
  } catch {}
  kabari()
}

export function tutupToast() {
  try {
    sessionStorage.removeItem(KUNCI_TOAST)
  } catch {}
  kabari()
}

export function ambilToast() {
  try {
    return sessionStorage.getItem(KUNCI_TOAST)
  } catch {
    return null
  }
}

export function langgananToast(panggil) {
  window.addEventListener(PERISTIWA_TOAST, panggil)
  window.addEventListener("storage", panggil)
  return () => {
    window.removeEventListener(PERISTIWA_TOAST, panggil)
    window.removeEventListener("storage", panggil)
  }
}
