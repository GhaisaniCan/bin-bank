import Link from "next/link"
import { formatRupiah, formatTanggal } from "@/lib/format"

const KETERANGAN_SUMBER = {
  SETORAN: "Setoran",
  PENARIKAN: "Penarikan",
  PEMBATALAN_SETORAN: "Pembatalan setoran",
}

const SUMBER_SETORAN = ["SETORAN", "PEMBATALAN_SETORAN"]

function siapkan(baris) {
  const masuk = baris.tipe === "KREDIT" ? formatRupiah(baris.jumlah) : ""
  const keluar = baris.tipe === "DEBIT" ? formatRupiah(baris.jumlah) : ""
  const tautan = SUMBER_SETORAN.includes(baris.sumber) && baris.referensiId ? `/nasabah/setoran/${baris.referensiId}` : null
  return {
    id: baris._id,
    tanggal: formatTanggal(baris.createdAt),
    keterangan: baris.keterangan?.trim() || KETERANGAN_SUMBER[baris.sumber] || "",
    masuk,
    keluar,
    saldo: formatRupiah(baris.saldoSetelah),
    tautan,
  }
}

// Skeleton
export function SkeletonMutasi({ jumlah = 5 }) {
  return (
    <ul aria-hidden="true" className="border-t border-line-300">
      {Array.from({ length: jumlah }, (_, i) => (
        <li key={i} className="flex min-h-7 items-center border-b border-line-300 py-3">
          <div className="h-4 w-full rounded-1 bg-olive-50" />
        </li>
      ))}
    </ul>
  )
}

// Daftar baris
function DaftarBaris({ data }) {
  return (
    <ul className="border-t border-line-300 min-[600px]:hidden">
      {data.map((b) => {
        const isi = (
          <>
            <span className="flex items-start justify-between gap-3">
              <span className={b.tautan ? "text-olive-700 underline decoration-1 group-hover:text-olive-800" : "text-ink-900"}>
                {b.keterangan}
              </span>
              <span className="shrink-0 text-small text-ink-700">{b.tanggal}</span>
            </span>
            <span className="mt-1 flex flex-wrap justify-end gap-x-4 gap-y-1 text-right">
              <span>
                <span className="text-small text-ink-700">{b.masuk ? "Masuk" : "Keluar"}</span>{" "}
                <span className="text-amount font-bold tabular-nums">{b.masuk || b.keluar}</span>
              </span>
              <span>
                <span className="text-small text-ink-700">Saldo</span>{" "}
                <span className="text-amount font-bold tabular-nums">{b.saldo}</span>
              </span>
            </span>
          </>
        )
        return (
          <li key={b.id} className="border-b border-line-300">
            {b.tautan ? (
              <Link href={b.tautan} className="group block min-h-7 px-1 py-3 hover:bg-olive-50">
                {isi}
              </Link>
            ) : (
              <div className="block min-h-7 px-1 py-3">{isi}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// Tabel buku
function TabelBuku({ data, labelId }) {
  const kelasKepala = "border-b border-line-300 px-2 py-3 text-small font-bold text-ink-700"
  const kelasSel = "px-2 py-3 align-top"

  return (
    <table aria-labelledby={labelId} className="hidden w-full border-collapse text-body min-[600px]:table">
      <thead>
        <tr>
          <th scope="col" className={`${kelasKepala} text-left`}>Tanggal</th>
          <th scope="col" className={`${kelasKepala} text-left`}>Keterangan</th>
          <th scope="col" className={`${kelasKepala} text-center`}>Masuk</th>
          <th scope="col" className={`${kelasKepala} text-center`}>Keluar</th>
          <th scope="col" className={`${kelasKepala} text-center`}>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {data.map((b) => (
          <tr key={b.id} className={`border-b border-line-300 ${b.tautan ? "group relative hover:bg-olive-50" : ""}`}>
            <td className={`${kelasSel} whitespace-nowrap text-ink-700`}>{b.tanggal}</td>
            <td className={kelasSel}>
              {b.tautan ? (
                <Link
                  href={b.tautan}
                  className="text-olive-700 underline decoration-1 after:absolute after:inset-0 group-hover:text-olive-800"
                >
                  {b.keterangan}
                </Link>
              ) : (
                b.keterangan
              )}
            </td>
            <td className={`${kelasSel} whitespace-nowrap text-center tabular-nums`}>{b.masuk}</td>
            <td className={`${kelasSel} whitespace-nowrap text-center tabular-nums`}>{b.keluar}</td>
            <td className={`${kelasSel} whitespace-nowrap text-center tabular-nums`}>{b.saldo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Tabel mutasi
export default function TabelMutasi({ baris = [], labelId }) {
  const data = baris.map(siapkan)

  return (
    <>
      <DaftarBaris data={data} />
      <TabelBuku data={data} labelId={labelId} />
    </>
  )
}
