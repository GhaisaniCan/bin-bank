"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Recycle, Warning, WarningOctagon } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { gambarSampah, urlGambarJenis } from "@/lib/gambarSampah"
import Dialog from "@/components/Dialog"
import IsianTeks from "@/components/IsianTeks"
import PesanInline from "@/components/PesanInline"
import Tombol from "@/components/Tombol"
import TombolTutup from "@/components/TombolTutup"

export const KATEGORI = [
  { nilai: "plastik", label: "Plastik" },
  { nilai: "kertas", label: "Kertas" },
  { nilai: "besi", label: "Besi" },
  { nilai: "lainnya", label: "Lainnya" },
]

const TIPE_GAMBAR = ["image/png", "image/jpeg", "image/webp"]
const BATAS_GAMBAR = 500 * 1024
const ID_FOKUS = { nama: "nama", harga: "harga", kategori: `kategori-${KATEGORI[0].nilai}` }

function bacaUkuran(berkas) {
  return new Promise((selesai, gagal) => {
    const url = URL.createObjectURL(berkas)
    const img = new window.Image()
    img.onload = () => {
      selesai({ lebar: img.naturalWidth, tinggi: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      gagal()
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

// Pilihan kategori
function PilihanKategori({ nilai, onChange, galat, disabled }) {
  return (
    <fieldset disabled={disabled} aria-describedby={galat ? "kategori-galat" : undefined}>
      <legend className="text-body text-ink-900">Kategori</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {KATEGORI.map((k) => {
          const id = `kategori-${k.nilai}`
          return (
            <label
              key={k.nilai}
              htmlFor={id}
              className={`flex min-h-7 cursor-pointer items-center gap-3 rounded-2 bg-putih px-4 py-2 hover:bg-olive-50 has-[:checked]:border-ink-900 has-[:checked]:bg-olive-100 has-[:checked]:ring-1 has-[:checked]:ring-ink-900 has-[:disabled]:cursor-default ${
                galat ? "border-2 border-bata-700" : "border border-line-500"
              }`}
            >
              <input
                id={id}
                type="radio"
                name="kategori"
                value={k.nilai}
                checked={nilai === k.nilai}
                onChange={() => onChange(k.nilai)}
                aria-invalid={galat ? true : undefined}
                className="size-5 shrink-0 accent-olive-700"
              />
              <span className="text-body font-bold text-ink-900">{k.label}</span>
            </label>
          )
        })}
      </div>
      {galat && (
        <p id="kategori-galat" className="mt-2 text-small font-bold text-bata-700">
          {galat}
        </p>
      )}
    </fieldset>
  )
}

export default function FormJenisSampah({ jenis, daftar, onTutup, onTersimpan, onDiperbarui }) {
  const dialog = useRef(null)
  const isianNama = useRef(null)
  const isianBerkas = useRef(null)
  const [simpanan, setSimpanan] = useState(jenis ?? null)
  const [nama, setNama] = useState(jenis?.nama ?? "")
  const [harga, setHarga] = useState(jenis?.hargaPerKg ? String(Math.round(jenis.hargaPerKg)) : "")
  const [kategori, setKategori] = useState(jenis?.kategori ?? null)
  const [baru, setBaru] = useState(null)
  const [peringatanRasio, setPeringatanRasio] = useState(false)
  const [galat, setGalat] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false)
  const [menghapus, setMenghapus] = useState(false)
  const [galatHapus, setGalatHapus] = useState(null)

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    isianNama.current.focus()
  }, [])

  useEffect(() => {
    if (!baru) return
    return () => URL.revokeObjectURL(baru.url)
  }, [baru])

  function periksa() {
    const g = {}
    const n = nama.trim()
    if (!n) {
      g.nama = "Nama wajib diisi"
    } else if (
      daftar.some((j) => j._id !== simpanan?._id && j.nama.trim().toLowerCase() === n.toLowerCase())
    ) {
      g.nama = "Nama ini sudah dipakai jenis sampah lain"
    }
    if (!harga || Number(harga) <= 0) g.harga = "Harga per kg harus lebih dari 0"
    if (!kategori) g.kategori = "Pilih kategori jenis sampah"
    return g
  }

  async function pilihBerkas(e) {
    const b = e.target.files?.[0]
    e.target.value = ""
    if (!b) return
    setGalat((g) => ({ ...g, gambar: null, gambarGagal: null }))
    setPeringatanRasio(false)
    if (!TIPE_GAMBAR.includes(b.type)) {
      setGalat((g) => ({ ...g, gambar: "Format gambar harus PNG, JPG, atau WebP" }))
      return
    }
    if (b.size > BATAS_GAMBAR) {
      setGalat((g) => ({
        ...g,
        gambar: `Ukuran gambar ${Math.ceil(b.size / 1024).toLocaleString("id-ID")} KB, maksimal 500 KB`,
      }))
      return
    }
    try {
      const { lebar, tinggi } = await bacaUkuran(b)
      setPeringatanRasio(Math.abs(lebar / tinggi - 1) > 0.05)
      setBaru({ berkas: b, url: URL.createObjectURL(b) })
    } catch {
      setGalat((g) => ({ ...g, gambar: "Berkas tidak bisa dibaca sebagai gambar" }))
    }
  }

  function batalkanBerkas() {
    setBaru(null)
    setPeringatanRasio(false)
    setGalat((g) => ({ ...g, gambarGagal: null }))
  }

  async function kirim(e) {
    e.preventDefault()
    const g = periksa()
    setGalat(g)
    const pertama = ["nama", "harga", "kategori"].find((k) => g[k])
    if (pertama) {
      document.getElementById(ID_FOKUS[pertama])?.focus()
      return
    }

    setMenyimpan(true)
    let data = simpanan
    try {
      const hasil = await api(simpanan ? `/jenis-sampah/${simpanan._id}` : "/jenis-sampah", {
        method: simpanan ? "PUT" : "POST",
        body: { nama: nama.trim(), hargaPerKg: Number(harga), kategori },
        galatInline: true,
      })
      data = hasil.data
    } catch (err) {
      if (err.status === 409) {
        setGalat({ nama: "Nama ini sudah dipakai jenis sampah lain" })
      } else if (err.status) {
        setGalat({ umum: err.message })
      } else {
        setGalat({ umum: "Belum dipastikan tersimpan. Periksa daftar jenis sampah sebelum mencoba lagi." })
      }
      setMenyimpan(false)
      return
    }

    if (!baru) {
      setMenyimpan(false)
      onTersimpan(data)
      return
    }

    setSimpanan(data)
    onDiperbarui(data)
    try {
      const isi = new FormData()
      isi.append("gambar", baru.berkas)
      const hasil = await api(`/jenis-sampah/${data._id}/gambar`, {
        method: "PUT",
        body: isi,
        galatInline: true,
      })
      setMenyimpan(false)
      onTersimpan(hasil.data)
    } catch (err) {
      setGalat({
        gambarGagal: err.status
          ? `${err.message}. Data jenis sampah sudah tersimpan. Simpan lagi untuk mencoba mengunggah gambar.`
          : "Data jenis sampah sudah tersimpan, tetapi gambar belum dipastikan terunggah. Simpan lagi untuk mencoba.",
      })
      setMenyimpan(false)
    }
  }

  async function hapusGambar() {
    setMenghapus(true)
    setGalatHapus(null)
    try {
      const hasil = await api(`/jenis-sampah/${simpanan._id}/gambar`, { method: "DELETE", galatInline: true })
      setSimpanan(hasil.data)
      onDiperbarui(hasil.data)
      setKonfirmasiHapus(false)
    } catch (err) {
      setGalatHapus(err.status ? err.message : "Belum dipastikan terhapus. Tutup dialog dan periksa gambarnya.")
    } finally {
      setMenghapus(false)
    }
  }

  function batalTutup(e) {
    if (menyimpan) e.preventDefault()
  }

  const pratinjau = baru?.url
  const gambarSaatIni = urlGambarJenis(simpanan)
  const gambarBawaan = gambarSampah(nama)
  const sibuk = menyimpan || menghapus
  const deskripsiGambar = [galat.gambar && "gambar-galat", "gambar-bantuan"].filter(Boolean).join(" ")

  return (
    <>
      <dialog
        ref={dialog}
        onCancel={batalTutup}
        onClose={onTutup}
        aria-labelledby="judul-form-jenis"
        className="m-0 mt-auto w-full max-w-none rounded-t-3 bg-putih p-5 text-ink-900 backdrop:bg-ink-900/50 min-[600px]:m-auto min-[600px]:w-[480px] min-[600px]:rounded-3"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="judul-form-jenis" className="min-w-0 flex-1 break-words text-h2 font-bold">
            {jenis ? "Ubah jenis sampah" : "Tambah jenis sampah"}
          </h2>
          <TombolTutup disabled={menyimpan} onClick={() => dialog.current.close()} className="-mr-2 -mt-2" />
        </div>

        <form onSubmit={kirim} noValidate className="mt-4 space-y-4">
          <IsianTeks
            id="nama"
            ref={isianNama}
            label="Nama"
            value={nama}
            maxLength={60}
            onChange={(e) => setNama(e.target.value)}
            galat={galat.nama}
          />

          <div>
            <label htmlFor="harga" className="block text-body text-ink-900">
              Harga per kg
            </label>
            <div className="relative mt-2">
              <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-body text-ink-700">
                Rp
              </span>
              <input
                id="harga"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={harga ? Number(harga).toLocaleString("id-ID") : ""}
                onChange={(e) => setHarga(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9))}
                aria-invalid={galat.harga ? true : undefined}
                aria-describedby={galat.harga ? "harga-galat harga-bantuan" : "harga-bantuan"}
                className={`h-7 w-full rounded-2 bg-putih pl-[44px] pr-3 text-body tabular-nums text-ink-900 ${
                  galat.harga ? "border-2 border-bata-700" : "border border-line-500"
                }`}
              />
            </div>
            {galat.harga && (
              <p id="harga-galat" className="mt-2 text-small font-bold text-bata-700">
                {galat.harga}
              </p>
            )}
            <p id="harga-bantuan" className="mt-2 text-small text-ink-500">
              Perubahan harga hanya berlaku untuk setoran berikutnya. Setoran yang sudah tercatat tidak berubah.
            </p>
          </div>

          <PilihanKategori nilai={kategori} onChange={setKategori} galat={galat.kategori} disabled={menyimpan} />

          <div role="group" aria-labelledby="gambar-label">
            <p id="gambar-label" className="text-body text-ink-900">
              Gambar
            </p>
            <div className="mt-2 flex items-start gap-4">
              <div className="flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded-2 bg-olive-50">
                {pratinjau ? (
                  <img src={pratinjau} alt="Pratinjau gambar baru" className="size-full object-contain" />
                ) : gambarSaatIni ? (
                  <img src={gambarSaatIni} alt="Gambar saat ini" className="size-full object-contain" />
                ) : gambarBawaan ? (
                  <Image src={gambarBawaan} alt="" width={96} height={96} sizes="96px" className="size-full object-contain" />
                ) : (
                  <Recycle size={48} weight="regular" aria-hidden="true" className="text-ink-700" />
                )}
              </div>
              <div className="flex min-w-0 flex-col items-start gap-2">
                {!pratinjau && !gambarSaatIni && (
                  <p className="text-small text-ink-700">
                    {gambarBawaan ? "Memakai gambar bawaan" : "Belum ada gambar"}
                  </p>
                )}
                <Tombol
                  varian="sekunder"
                  disabled={sibuk}
                  aria-describedby={deskripsiGambar}
                  onClick={() => isianBerkas.current.click()}
                >
                  {pratinjau || gambarSaatIni ? "Ganti gambar" : "Pilih gambar"}
                </Tombol>
                {pratinjau ? (
                  <Tombol varian="teks" disabled={sibuk} onClick={batalkanBerkas}>
                    Batalkan gambar baru
                  </Tombol>
                ) : (
                  gambarSaatIni && (
                    <Tombol
                      varian="teks"
                      disabled={sibuk}
                      onClick={() => {
                        setGalatHapus(null)
                        setKonfirmasiHapus(true)
                      }}
                    >
                      Hapus gambar
                    </Tombol>
                  )
                )}
              </div>
            </div>
            <input
              ref={isianBerkas}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={pilihBerkas}
            />
            {galat.gambar && (
              <p id="gambar-galat" role="alert" className="mt-2 text-small font-bold text-bata-700">
                {galat.gambar}
              </p>
            )}
            {peringatanRasio && (
              <PesanInline
                varian="peringatan"
                ikon={Warning}
                isi="Rasio gambar tidak 1:1, tampilannya bisa kurang rapi di kartu."
                className="mt-2"
              />
            )}
            <p id="gambar-bantuan" className="mt-2 text-small text-ink-500">
              Disarankan gambar persegi (rasio 1:1), latar transparan, maksimal 500 KB. Format PNG, JPG, atau WebP.
            </p>
          </div>

          {galat.umum && (
            <PesanInline varian="galat" ikon={WarningOctagon} judul="Belum tersimpan" isi={galat.umum} />
          )}

          {galat.gambarGagal && (
            <PesanInline
              varian="galat"
              ikon={WarningOctagon}
              judul="Gambar gagal diunggah"
              isi={galat.gambarGagal}
            />
          )}

          <Tombol type="submit" memproses={menyimpan} disabled={menghapus} teksMemproses="Menyimpan..." className="w-full">
            Simpan jenis sampah
          </Tombol>
        </form>
      </dialog>

      {konfirmasiHapus && (
        <Dialog judul="Hapus gambar" onTutup={() => setKonfirmasiHapus(false)} terkunci={menghapus}>
          <p className="mt-4 text-body">
            Gambar {simpanan.nama} dihapus. Daftar harga kembali memakai gambar bawaan atau ikon.
          </p>
          {galatHapus && (
            <PesanInline varian="galat" ikon={WarningOctagon} judul="Gambar belum terhapus" isi={galatHapus} className="mt-4" />
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Tombol varian="merusak" memproses={menghapus} teksMemproses="Menghapus..." onClick={hapusGambar}>
              Hapus gambar
            </Tombol>
            <Tombol varian="sekunder" disabled={menghapus} onClick={() => setKonfirmasiHapus(false)}>
              Batal
            </Tombol>
          </div>
        </Dialog>
      )}
    </>
  )
}
