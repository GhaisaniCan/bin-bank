import { formatJam, formatRupiah, formatTanggal } from "@/lib/format"
import { formatBerat } from "@/components/TabelSetoran"

export default function LembarSetoran({ setoran }) {
  const batal = setoran.status === "DIBATALKAN"
  const kelasKepala = "border-b border-line-300 px-2 py-3 text-small font-bold text-ink-700"
  const kelasSel = "px-2 py-3 align-top"

  return (
    <section
      aria-label="Rincian setoran"
      className="rounded-2 border border-line-300 bg-putih p-4 min-[600px]:p-5"
    >
      <dl className="grid gap-4 min-[600px]:grid-cols-3">
        <div>
          <dt className="text-small text-ink-700">Nasabah</dt>
          <dd className="text-body font-bold">{setoran.nasabah.nama}</dd>
          <dd className="text-small text-ink-700">{setoran.nasabah.email}</dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Tanggal</dt>
          <dd className="text-body font-bold">
            {formatTanggal(setoran.tanggal)}, {formatJam(setoran.tanggal)}
          </dd>
        </div>
        <div>
          <dt className="text-small text-ink-700">Dicatat oleh</dt>
          <dd className="text-body font-bold">{setoran.petugas.nama}</dd>
        </div>
      </dl>

      <h2 className="mt-6 text-h3 font-bold">Rincian sampah</h2>

      <ul className="mt-2 border-t border-line-300 min-[600px]:hidden">
        {setoran.rincian.map((r, i) => (
          <li key={i} className="border-b border-line-300 py-3">
            <span className="flex items-start justify-between gap-3">
              <span className="text-body font-bold">{r.nama}</span>
              <span className="text-amount font-bold tabular-nums">{formatRupiah(r.subtotal)}</span>
            </span>
            <span className="mt-1 block text-small tabular-nums text-ink-700">
              {formatBerat(r.berat)} × {formatRupiah(r.harga)} per kg
            </span>
          </li>
        ))}
      </ul>

      <table
        aria-label="Rincian sampah"
        className="mt-2 hidden w-full border-collapse text-body min-[600px]:table"
      >
        <thead>
          <tr>
            <th scope="col" className={`${kelasKepala} text-left`}>Jenis sampah</th>
            <th scope="col" className={`${kelasKepala} text-right`}>Berat (kg)</th>
            <th scope="col" className={`${kelasKepala} text-right`}>Harga per kg (Rp)</th>
            <th scope="col" className={`${kelasKepala} text-right`}>Subtotal (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {setoran.rincian.map((r, i) => (
            <tr key={i} className="border-b border-line-300">
              <td className={kelasSel}>{r.nama}</td>
              <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatBerat(r.berat)}</td>
              <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatRupiah(r.harga)}</td>
              <td className={`${kelasSel} whitespace-nowrap text-right tabular-nums`}>{formatRupiah(r.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 border-t-[3px] border-double border-ink-900 pt-3">
        <dl className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-body text-ink-700">Total berat</dt>
            <dd className="text-amount font-bold tabular-nums">{formatBerat(setoran.totalBerat)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-body text-ink-700">Total nilai</dt>
            <dd className="text-h2 font-bold tabular-nums">
              {batal ? (
                <del>
                  {formatRupiah(setoran.totalNilai)}
                  <span className="sr-only"> dibatalkan</span>
                </del>
              ) : (
                formatRupiah(setoran.totalNilai)
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
