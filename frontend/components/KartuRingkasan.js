import Link from "next/link"
import { CaretRight } from "@phosphor-icons/react"

const KELAS_KARTU =
  "flex h-full min-h-[240px] flex-col rounded-3 bg-putih p-5 shadow-kartu min-[600px]:p-6 lg:p-5 xl:p-6"

// Kerangka
export function KerangkaKartuRingkasan() {
  return (
    <div className={KELAS_KARTU}>
      <div className="h-5 w-3/4 rounded-1 bg-olive-50" />
      <div className="mt-auto h-7 w-1/2 rounded-1 bg-olive-50" />
      <div className="mt-3 h-5 w-2/3 rounded-1 bg-olive-50" />
    </div>
  )
}

// Kartu
export default function KartuRingkasan({ href, label, angka, keterangan, ikon: Ikon }) {
  return (
    <Link href={href} className={`${KELAS_KARTU} hover-kartu text-forest-900 no-underline`}>
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-h2 font-normal lg:text-h3 xl:text-h2">{label}</span>
        {Ikon && (
          <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-olive-50 min-[600px]:size-[56px] lg:size-[48px] xl:size-[56px]">
            <Ikon size={24} weight="regular" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="mt-auto block break-words pt-5 text-display font-bold tabular-nums min-[600px]:text-display-lg lg:text-h1 xl:text-display min-[1440px]:text-display-lg">
        {angka}
      </span>
      <span className="mt-2 flex items-end justify-between gap-3">
        {keterangan && <span className="min-w-0 text-body text-ink-700">{keterangan}</span>}
        <CaretRight size={24} weight="bold" aria-hidden="true" className="ml-auto shrink-0" />
      </span>
    </Link>
  )
}
