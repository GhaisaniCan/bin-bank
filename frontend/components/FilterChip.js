"use client"

export default function FilterChip({ pilihan, aktif, onUbah, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-2 flex gap-2 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {pilihan.map((p) => {
        const terpilih = p.id === aktif
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={terpilih}
            onClick={() => onUbah(p.id)}
            className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-body ${
              terpilih ? "bg-olive-700 font-bold text-putih" : "bg-olive-50 text-ink-900"
            }`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
