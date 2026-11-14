import Link from "next/link"
import CapStatus from "@/components/CapStatus"
import { formatRupiah, formatTanggal } from "@/lib/format"

export function formatBerat(kg) {
  const angka = Number(kg).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${angka}\u00a0kg`
}

function siapkan(s, awalanTautan) {
  return {
    id: s._id,
    tanggal: formatTanggal(s.tanggal),
    nasabah: s.nasabah?.nama ?? "",
    berat: formatBerat(s.totalBerat),
    nilai: formatRupiah(s.totalNilai),
    status: s.status,
    batal: s.status === "DIBATALKAN",
    tautan: `${awalanTautan}/${s._id}`,
  }
}

function Angka({ batal, children }) {
  if (!batal) return children
  return (
    <del>
      {children}
      <span className="sr-only"> dibatalkan</span>
    </del>
  )
}

function DaftarBaris({ data }) {
  return (
    <ul className="border-t border-line-300 min-[600px]:hidden">
      {data.map((b) => (
        <li key={b.id} className="border-b border-line-300">
          <Link href={b.tautan} className="block min-h-7 px-1 py-3 hover:bg-olive-50">
            <span className="flex items-start justify-between gap-3">
              <span className="text-body font-bold">{b.nasabah}</span>
              <span className="shrink-0 text-small text-ink-700">{b.tanggal}</span>
            </span>
            <span className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <CapStatus status={b.status} />
              <span className="text-right">
                <span className="text-small tabular-nums text-ink-700">{b.berat}</span>{" "}
                <span className="text-amount font-bold tabular-nums">
                  <Angka batal={b.batal}>{b.nilai}</Angka>
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function TabelBuku({ data }) {
  const kelasKepala = "border-b border-line-300 px-2 py-3 text-small font-bold text-ink-700"
  const kelasSel = "px-2 py-3 align-top"

  return (
    <table aria-label="Daftar setoran" className="hidden w-full border-collapse text-body min-[600px]:table">
      <thead>
        <tr>
          <th scope="col" className={`${kelasKepala} text-left`}>Tanggal</th>
          <th scope="col" className={`${kelasKepala} text-left`}>Nasabah</th>
          <th scope="col" className={`${kelasKepala} text-right`}>Berat (kg)</th>
          <th scope="col" className={`${kelasKepala} text-right`}>Nilai (Rp)</th>
          <th scope="col" className={`${kelasKepala} text-left`}>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((b) => (
          <tr key={b.id} className="group relative border-b border-line-300 hover:bg-olive-50">
            <td className={`${kelasSel} whitespace-nowrap text-ink-700`}>{b.tanggal}</td>
            <td className={kelasSel}>
              <Link
                href={b.tautan}
                className="font-bold text-olive-700 underline decoration-1 after:absolute after:inset-0 group-hover:text-olive-800"
              >
                {b.nasabah}
              </Link>
            </td>
            <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{b.berat}</td>
            <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>
              <Angka batal={b.batal}>{b.nilai}</Angka>
            </td>
            <td className={kelasSel}>
              <CapStatus status={b.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function TabelSetoran({ baris = [], awalanTautan = "/petugas/setoran" }) {
  const data = baris.map((s) => siapkan(s, awalanTautan))

  return (
    <>
      <DaftarBaris data={data} />
      <TabelBuku data={data} />
    </>
  )
}