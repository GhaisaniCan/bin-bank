import { X } from "@phosphor-icons/react"

export default function TombolTutup({ onClick, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      aria-label="Tutup"
      onClick={onClick}
      disabled={disabled}
      className={`flex size-[44px] shrink-0 items-center justify-center rounded-2 border-0 bg-transparent text-ink-900 enabled:hover:bg-olive-50 focus-visible:bg-olive-50 disabled:text-ink-500 ${className}`}
    >
      <X size={24} weight="regular" aria-hidden="true" />
    </button>
  )
}
