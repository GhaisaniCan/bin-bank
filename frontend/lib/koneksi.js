import { useSyncExternalStore } from "react"

function langganKoneksi(panggil) {
  window.addEventListener("online", panggil)
  window.addEventListener("offline", panggil)
  return () => {
    window.removeEventListener("online", panggil)
    window.removeEventListener("offline", panggil)
  }
}

export function useDaring() {
  return useSyncExternalStore(
    langganKoneksi,
    () => navigator.onLine,
    () => true
  )
}
