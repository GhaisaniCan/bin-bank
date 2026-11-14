import Link from "next/link"
import { WarningOctagon } from "@phosphor-icons/react"
import { formatRupiah } from "@/lib/format"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"

const kelasLembar = "rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"

// Skeleton
export function SkeletonLembarSaldo() {
  return (
    <div aria-hidden="true" className={kelasLembar}>
      <div className="h-4 w-1/4 rounded-1 bg-olive-50" />
      <div className="mt-2 h-7 w-2/3 rounded-1 bg-olive-50" />
      <div className="mt-4 h-4 w-1/3 rounded-1 bg-olive-50" />
      <div className="mt-2 h-5 w-1/2 rounded-1 bg-olive-50" />
      <div className="mt-5 h-7 w-full rounded-2 bg-olive-50 min-[600px]:w-1/3" />
    </div>
  )
}

// Lembar saldo
export default function LembarSaldo({ data, galat = false, onCobaLagi }) {
  const termuat = data != null

  return (
    <section aria-labelledby="judul-saldo" className={kelasLembar}>
      <h2 id="judul-saldo" className="text-body text-ink-700">
        Saldo
      </h2>
      {termuat ? (
        <p className="mt-1 text-display font-bold tabular-nums lg:text-display-lg">{formatRupiah(data.saldo)}</p>
      ) : (
        <p className="mt-1 text-h2 font-bold text-ink-700">Belum termuat</p>
      )}
      {termuat && data.saldo === 0 && (
        <p className="mt-2 text-body text-ink-700">Saldo bertambah setelah petugas mencatat setoran.</p>
      )}

      <div className="mt-4">
        <p className="text-body text-ink-700">Saldo tersedia</p>
        {termuat ? (
          <p className="text-amount font-bold tabular-nums">{formatRupiah(data.saldoTersedia)}</p>
        ) : (
          <p className="text-body font-bold text-ink-700">Belum termuat</p>
        )}
      </div>
      {termuat && data.saldoTertahan > 0 && (
        <p className="mt-2 text-body text-ink-700">
          <span className="tabular-nums">{formatRupiah(data.saldoTertahan)}</span> sedang menunggu keputusan
        </p>
      )}

      {galat && (
        <PesanInline varian="galat" ikon={WarningOctagon} isi="Data belum bisa dimuat" className="mt-4">
          <Tombol varian="sekunder" onClick={onCobaLagi}>
            Coba lagi
          </Tombol>
        </PesanInline>
      )}

      <Link
        href="/nasabah/tarik-saldo"
        className="mt-5 inline-flex h-7 w-full min-w-[96px] items-center justify-center rounded-2 bg-olive-700 px-4 text-body font-bold text-putih hover:bg-olive-800 active:bg-olive-800 min-[600px]:w-auto"
      >
        Tarik saldo
      </Link>
    </section>
  )
}
