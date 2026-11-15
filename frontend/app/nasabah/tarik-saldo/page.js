"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Info, WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { useDaring } from "@/lib/koneksi"
import { formatRupiah } from "@/lib/format"
import { tampilkanToast } from "@/lib/toast"
import IsianTeks from "@/components/IsianTeks"
import PesanInline from "@/components/PesanInline"
import PilihanMetode from "@/components/PilihanMetode"
import Tombol from "@/components/Tombol"

const OPSI_METODE = [
  { nilai: "tunai", label: "Tunai", penjelasan: "Diambil langsung di petugas RW" },
  { nilai: "e-wallet", label: "E-wallet", penjelasan: "Dikirim ke akun e-wallet Anda" },
]

// Halaman
export default function Halaman() {
  const router = useRouter()
  const daring = useDaring()
  const isianJumlah = useRef(null)
  const isianNama = useRef(null)
  const isianNomor = useRef(null)
  const [putaran, setPutaran] = useState(0)
  const [memuat, setMemuat] = useState(true)
  const [galatSaldo, setGalatSaldo] = useState(false)
  const [saldo, setSaldo] = useState(null)
  const [jumlah, setJumlah] = useState(0)
  const [metode, setMetode] = useState("tunai")
  const [namaEwallet, setNamaEwallet] = useState("")
  const [nomorEwallet, setNomorEwallet] = useState("")
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState("")
  const [mengirim, setMengirim] = useState(false)

  const muatUlang = useCallback(() => {
    setMemuat(true)
    setPutaran((n) => n + 1)
  }, [])

  useEffect(() => {
    let aktif = true
    api("/penarikan/saldo", { galatInline: true })
      .then((hasil) => {
        if (!aktif) return
        setSaldo(hasil.data)
        setGalatSaldo(false)
      })
      .catch(() => {
        if (aktif) setGalatSaldo(true)
      })
      .finally(() => {
        if (aktif) setMemuat(false)
      })
    return () => {
      aktif = false
    }
  }, [putaran])

  const tersedia = saldo?.saldoTersedia ?? 0
  const ewallet = metode === "e-wallet"

  // Validasi
  function periksa() {
    const g = {}
    if (!jumlah || jumlah <= 0) g.jumlah = "Jumlah penarikan wajib diisi"
    else if (jumlah > tersedia) g.jumlah = `Melebihi saldo tersedia ${formatRupiah(tersedia)}`
    if (ewallet) {
      if (!namaEwallet.trim()) g.namaEwallet = "Nama e-wallet wajib diisi"
      if (!nomorEwallet.trim()) g.nomorEwallet = "Nomor e-wallet wajib diisi"
    }
    return g
  }

  // Kirim
  async function kirim(e) {
    e.preventDefault()
    if (mengirim) return
    const g = periksa()
    setGalat(g)
    setGalatServer("")
    if (g.jumlah) return isianJumlah.current?.focus()
    if (g.namaEwallet) return isianNama.current?.focus()
    if (g.nomorEwallet) return isianNomor.current?.focus()

    const body = { jumlah, metode }
    if (ewallet) {
      body.namaEwallet = namaEwallet.trim()
      body.nomorEwallet = nomorEwallet.trim()
    }

    setMengirim(true)
    try {
      await api("/penarikan/ajukan", { method: "POST", body, galatInline: true })
      tampilkanToast("Pengajuan terkirim")
      router.push("/nasabah")
    } catch (err) {
      setGalatServer(
        err.status === 0 || err.status >= 500
          ? "Pengajuan belum dipastikan terkirim. Periksa pengajuan Anda sebelum mengajukan lagi."
          : err.message
      )
      setMengirim(false)
      muatUlang()
    }
  }

  return (
    <main>
      <h1 className="text-h1 font-bold text-forest-900">Tarik saldo</h1>

      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* Saldo */}
          <section aria-labelledby="judul-saldo" aria-busy={memuat || undefined} className="mt-6">
            {saldo == null && memuat && <PesanInline varian="info" ikon={Info} isi="Memuat saldo..." />}
            {galatSaldo && !memuat && (
              <PesanInline varian="galat" ikon={WarningOctagon} isi="Saldo belum bisa dimuat">
                <Tombol varian="sekunder" onClick={muatUlang}>
                  Coba lagi
                </Tombol>
              </PesanInline>
            )}
            {saldo != null && (
              <div className="sticky top-0 z-[5] border-b border-line-300 bg-putih py-3">
                <h2 id="judul-saldo" className="text-small font-bold text-ink-700">
                  Saldo tersedia
                </h2>
                <p className="text-h2 font-bold tabular-nums text-ink-900">{formatRupiah(tersedia)}</p>
                {saldo.saldoTertahan > 0 && (
                  <p className="text-small text-ink-700">Sedang ditahan: {formatRupiah(saldo.saldoTertahan)}</p>
                )}
              </div>
            )}
          </section>

          {saldo != null && tersedia <= 0 && (
            <div className="mt-6">
              <h3 className="text-h3 font-bold">Belum ada yang bisa ditarik</h3>
              <p className="mt-2 text-body text-ink-700">
                {saldo.saldoTertahan > 0
                  ? "Seluruh saldo sedang menunggu keputusan pengajuan sebelumnya."
                  : "Saldo tersedia Rp 0. Belum ada yang bisa ditarik."}
              </p>
            </div>
          )}

          {saldo != null && tersedia > 0 && (
            <form onSubmit={kirim} noValidate className="mt-6">
              <fieldset disabled={mengirim} className="flex flex-col gap-4">
                {/* Isian uang */}
                <div>
                  <label htmlFor="jumlah" className="block text-body text-ink-900">
                    Jumlah penarikan
                  </label>
                  <div className="relative mt-2">
                    <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-body text-ink-700">
                      Rp
                    </span>
                    <input
                      ref={isianJumlah}
                      id="jumlah"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={jumlah ? jumlah.toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const angka = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12)
                        setJumlah(angka ? Number(angka) : 0)
                      }}
                      aria-invalid={galat.jumlah ? true : undefined}
                      aria-describedby={galat.jumlah ? "jumlah-galat" : undefined}
                      className={`h-7 w-full rounded-2 bg-putih pl-[44px] pr-3 text-body tabular-nums text-ink-900 ${
                        galat.jumlah ? "border-2 border-bata-700" : "border border-line-500"
                      }`}
                    />
                  </div>
                  {galat.jumlah && (
                    <p id="jumlah-galat" className="mt-2 text-small font-bold text-bata-700">
                      {galat.jumlah}
                    </p>
                  )}
                </div>

                {/* Metode */}
                <PilihanMetode nama="metode" legenda="Metode penarikan" opsi={OPSI_METODE} nilai={metode} onChange={setMetode} />

                {/* E-wallet */}
                {ewallet && (
                  <>
                    <IsianTeks
                      ref={isianNama}
                      id="nama-ewallet"
                      label="Nama e-wallet"
                      bantuan="Misalnya GoPay, OVO, atau DANA"
                      autoComplete="off"
                      value={namaEwallet}
                      onChange={(e) => setNamaEwallet(e.target.value)}
                      galat={galat.namaEwallet}
                    />
                    <IsianTeks
                      ref={isianNomor}
                      id="nomor-ewallet"
                      label="Nomor e-wallet"
                      inputMode="tel"
                      autoComplete="off"
                      value={nomorEwallet}
                      onChange={(e) => setNomorEwallet(e.target.value)}
                      galat={galat.nomorEwallet}
                    />
                  </>
                )}
              </fieldset>

              <p className="mt-4 text-small text-ink-500">
                Saldo belum berkurang sampai pengajuan disetujui. Pengajuan tidak bisa dibatalkan sendiri.
              </p>

              {galatServer && (
                <PesanInline varian="galat" ikon={WarningOctagon} isi={galatServer} className="mt-4" />
              )}

              {/* Bilah aksi lekat */}
              <div className="sticky bottom-[calc(var(--spacing-8)+env(safe-area-inset-bottom))] z-[5] mt-4 border-t border-line-300 bg-putih py-4 lg:bottom-0">
                <Tombol
                  type="submit"
                  memproses={mengirim}
                  teksMemproses="Mengirim..."
                  disabled={!daring}
                  className="w-full lg:w-auto"
                >
                  {jumlah > 0 ? `Ajukan penarikan ${formatRupiah(jumlah)}` : "Ajukan penarikan"}
                </Tombol>
                {!daring && <p className="mt-2 text-small text-ink-500">Mengajukan membutuhkan koneksi</p>}
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
