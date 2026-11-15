import CapStatus from "@/components/CapStatus"
import { formatRupiah, formatTanggal } from "@/lib/format"

export default function KartuPengajuanSaya({ pengajuan: p }) {
  const ewallet = p.metode?.toLowerCase() === "e-wallet"

  return (
    <li className="border-b border-line-500 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-amount font-bold tabular-nums">{formatRupiah(p.jumlah)}</p>
        <CapStatus status={p.status} />
      </div>
      <p className="mt-1 text-small text-ink-700">
        {formatTanggal(p.createdAt)} · {ewallet ? "E-wallet" : "Tunai"}
      </p>

      {ewallet && (
        <p className="mt-1 flex flex-wrap gap-x-3 text-body text-ink-900">
          <span>{p.namaEwallet}</span>
          <span className="tabular-nums">{p.nomorEwallet}</span>
        </p>
      )}

      {p.status === "ditolak" && p.catatan && (
        <p className="mt-2 text-body text-ink-900">Alasan: {p.catatan}</p>
      )}
    </li>
  )
}

// Skeleton
export function SkeletonPengajuanSaya({ jumlah = 3 }) {
  return (
    <ul aria-hidden="true" className="border-t border-line-500">
      {Array.from({ length: jumlah }, (_, i) => (
        <li key={i} className="flex flex-col gap-2 border-b border-line-500 py-4">
          <div className="h-5 w-1/3 rounded-1 bg-olive-50" />
          <div className="h-4 w-1/2 rounded-1 bg-olive-50" />
        </li>
      ))}
    </ul>
  )
}
