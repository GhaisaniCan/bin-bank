import Image from "next/image"
import {
  BookOpen,
  Envelope,
  HandCoins,
  IdentificationCard,
  PencilSimpleLine,
  Phone,
} from "@phosphor-icons/react/dist/ssr"
import { Merek } from "@/components/BilahMenu"
import KepalaLekat from "@/components/KepalaLekat"
import Muncul from "@/components/Muncul"
import Berdering from "@/components/Berdering"
import TombolMasuk from "@/components/TombolMasuk"

export const metadata = {
  title: "BinBank – Bank Sampah Digital RW",
  description: "Catat setoran, pantau saldo, dan ajukan penarikan bank sampah RW secara digital.",
}

const wadah = "mx-auto w-full max-w-[1120px] px-4 min-[600px]:px-5 lg:px-6"
const judulBagian = "text-landing-bagian-hp font-bold text-olive-700 sm:text-landing-bagian"
const kelasMembesar =
  "motion-safe:transition-[scale] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:scale-105 motion-safe:focus-visible:scale-105"
const kelasBayanganLingkaran =
  "motion-safe:transition-[box-shadow] motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-olive-700)_22%,transparent)] motion-safe:group-focus-visible:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-olive-700)_22%,transparent)]"
const kelasFitur = `group flex flex-col items-center gap-3 lg:gap-4 ${kelasMembesar}`
const kelasLingkaranFitur = `flex size-8 shrink-0 items-center justify-center rounded-full bg-olive-100 lg:size-[96px] ${kelasBayanganLingkaran}`

const fitur = [
  { ikon: PencilSimpleLine, awal: "Pencatatan dan Perhitungan", tebal: "Otomatis" },
  { ikon: BookOpen, awal: "Buku Tabungan Digital yang", tebal: "Aman" },
  { ikon: IdentificationCard, awal: "Akses Informasi Saldo", tebal: "Mandiri" },
  { ikon: HandCoins, awal: "Pengajuan Penarikan Saldo", tebal: "Cepat" },
]

const kontak = [
  { ikon: Phone, warna: "text-forest-900", href: "tel:081234567890", teks: "0812-3456-7890", label: "Telepon" },
  { ikon: Envelope, warna: "text-olive-700", href: "mailto:info@binbank.com", teks: "info@binbank.com", label: "Email" },
]

// Halaman
export default function Halaman() {
  return (
    <div className="flex min-h-dvh flex-col bg-halaman-panjang">
      {/* Kepala */}
      <KepalaLekat>
        <div className="flex h-8 items-center justify-between gap-2 px-4 min-[600px]:px-5 lg:h-[calc(var(--spacing-8)+var(--spacing-2))] lg:px-6">
          <Merek href="/" className="min-h-7 min-w-0" />
          <TombolMasuk teks="Masuk" ukuran="ringkas" />
        </div>
      </KepalaLekat>

      <main className="flex-1">
        {/* Hero */}
        <section
          aria-labelledby="judul-hero"
          className="@container overflow-x-clip pt-6 pb-3 sm:pt-7 sm:pb-2 lg:pt-8 lg:pb-0"
        >
          <div className="relative">
            <div
              className={`${wadah} grid grid-cols-[minmax(0,1fr)_38%] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_44%] sm:gap-5 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-7`}
            >
              <div className="relative z-10">
                <Muncul arah="kiri" jeda={100}>
                  <p className="text-small text-ink-900 sm:text-h3">
                    Dari <strong className="font-bold text-olive-700">Sampah</strong>, Jadi{" "}
                    <strong className="font-bold text-olive-700">Saldo</strong>
                  </p>
                </Muncul>
                <Muncul arah="kiri" jeda={200} className="mt-2">
                  <h1 id="judul-hero">
                    <span className="block text-landing-judul-hp font-bold text-olive-700 sm:text-landing-judul">BinBank:</span>
                    <span className="mt-1 block text-landing-subjudul-hp font-bold text-ink-900 sm:text-landing-subjudul">
                      Bank Sampah Digital RW
                    </span>
                  </h1>
                </Muncul>
                <Muncul arah="kiri" jeda={300} className="mt-4">
                  <p className="max-w-[40ch] text-landing-isi-hp text-ink-900 sm:text-landing-isi">
                    Tak perlu lagi mencatat setoran Anda secara manual pada buku tabungan.
                  </p>
                </Muncul>
                <Muncul arah="kiri" jeda={400} className="mt-4 lg:mt-5">
                  <TombolMasuk teks="Coba Sekarang" ukuran="hero" panah />
                </Muncul>
              </div>
              <div aria-hidden="true" className="aspect-[1151/1021]" />
            </div>
            <div className="absolute top-1/2 right-0 w-[38%] -translate-y-1/2 sm:w-[44%] lg:w-[480px]">
              <Muncul
                arah="diam"
                jeda={100}
                className="absolute top-[40.5%] left-[27%] z-0 w-[83%] max-w-none -translate-y-1/2"
              >
                <Image
                  src="/landing/blob-hero.webp"
                  alt=""
                  aria-hidden="true"
                  width={420}
                  height={422}
                  className="block h-auto w-full"
                />
              </Muncul>
              <Muncul arah="kanan" jeda={200} className="relative z-10">
                <Image
                  src="/landing/hero-tangan-sampah.webp"
                  alt="Tangan memegang kantong sampah daur ulang"
                  width={1151}
                  height={798}
                  priority
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 44vw, 38vw"
                  className="block h-auto w-full"
                />
              </Muncul>
            </div>
          </div>
        </section>

        {/* Apa itu BinBank */}
        <section
          aria-labelledby="judul-apa-itu"
          className="@container overflow-x-clip pt-7 pb-5 sm:pt-8 sm:pb-7 lg:pt-[calc(var(--spacing-8)+var(--spacing-6))] lg:pb-7"
        >
          <div className="relative">
            <div aria-hidden="true" className="absolute top-1/2 left-0 w-[38%] -translate-y-1/2 lg:w-[300px]">
              <Muncul arah="diam" className="absolute top-1/2 right-0 w-[147%] max-w-none -translate-y-1/2">
                <Image
                  src="/landing/blob-ponsel.webp"
                  alt=""
                  aria-hidden="true"
                  width={420}
                  height={422}
                  className="block h-auto w-full"
                />
              </Muncul>
              <Muncul arah="kiri" className="relative ml-auto w-[60%] translate-x-[calc(min(100cqw,1120px)*0.04)]">
                <div className="absolute inset-x-[6%] inset-y-[3%] rounded-2 bg-putih lg:rounded-3" />
                <Image
                  src="/landing/ponsel.webp"
                  alt=""
                  aria-hidden="true"
                  width={420}
                  height={842}
                  sizes="(min-width: 1024px) 180px, 23vw"
                  className="relative block h-auto w-full"
                />
              </Muncul>
            </div>
            <div
              className={`${wadah} grid grid-cols-[38%_minmax(0,1fr)] items-center gap-5 lg:grid-cols-[max(0px,calc(348px_-_max(0px,(100cqw_-_1120px)_/_2)_-_var(--spacing-6)))_minmax(0,1fr)] lg:gap-0`}
            >
              <div aria-hidden="true" className="aspect-[5/6] lg:aspect-auto lg:h-[361px]" />
              <Muncul arah="kanan" className="relative ml-[calc(min(100cqw,1120px)*0.04)]">
                <h2 id="judul-apa-itu" className={judulBagian}>
                  Apa itu BinBank?
                </h2>
                <p className="mt-3 max-w-[60ch] text-landing-isi-hp text-ink-900 sm:text-landing-isi lg:mt-4">
                  <strong className="font-bold">BinBank</strong> adalah aplikasi digital berbasis sistem pencatatan
                  terpusat yang dirancang khusus untuk memodernisasi dan mengotomatisasi seluruh proses operasional
                  bank sampah tingkat RW.
                </p>
              </Muncul>
            </div>
          </div>
        </section>

        {/* Fitur utama */}
        <section aria-labelledby="judul-fitur">
          <div className={`${wadah} pt-7 pb-6 sm:pt-8 sm:pb-7 lg:pt-[calc(var(--spacing-8)+var(--spacing-6))] lg:pb-8`}>
            <Muncul arah="naik">
              <h2 id="judul-fitur" className={`${judulBagian} text-center`}>
                4 Fitur Utama
              </h2>
            </Muncul>
            <ul className="mt-6 grid grid-cols-4 gap-1 sm:gap-5 lg:mt-7 lg:gap-7">
              {fitur.map(({ ikon: Ikon, awal, tebal }, i) => (
                <li key={tebal} className="min-w-0 text-center">
                  <Muncul arah="naik" jeda={i * 100}>
                    <div tabIndex={0} className={kelasFitur}>
                      <span className={kelasLingkaranFitur}>
                        <Ikon weight="regular" aria-hidden="true" className="size-6 text-olive-700 lg:size-7" />
                      </span>
                      <p className="text-landing-fitur break-words text-ink-900 hyphens-auto">
                        {awal} <strong className="font-bold">{tebal}</strong>
                      </p>
                    </div>
                  </Muncul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Kontak */}
        <section aria-labelledby="judul-kontak" className="overflow-x-clip">
          <div
            className={`${wadah} flex items-center justify-center gap-4 pt-8 pb-7 sm:gap-6 lg:gap-8 lg:pt-[calc(var(--spacing-8)+var(--spacing-6))] lg:pb-8`}
          >
            <div className="relative w-[36%] max-w-[260px] shrink-0">
              <Muncul arah="diam">
                <Image
                  src="/landing/blob-kontak.webp"
                  alt=""
                  aria-hidden="true"
                  width={398}
                  height={386}
                  className="block h-auto w-full"
                />
              </Muncul>
              <Muncul arah="kiri" className="absolute top-1/2 left-1/2 w-[59%] -translate-x-1/2 -translate-y-1/2">
                <Berdering>
                  <Image
                    src="/landing/telepon.webp"
                    alt=""
                    aria-hidden="true"
                    width={915}
                    height={934}
                    sizes="(min-width: 1024px) 160px, 22vw"
                    className="block h-auto w-full"
                  />
                </Berdering>
              </Muncul>
            </div>
            <div className="min-w-0">
              <Muncul arah="kanan">
                <h2 id="judul-kontak" className={judulBagian}>
                  Kontak Kami
                </h2>
              </Muncul>
              <ul className="mt-2 flex flex-col gap-1 lg:mt-4 lg:gap-2">
                {kontak.map(({ ikon: Ikon, warna, href, teks, label }, i) => (
                  <li key={href}>
                    <Muncul arah="kanan" jeda={(i + 1) * 100}>
                      <a
                        href={href}
                        className={`group flex min-h-7 origin-left items-center gap-2 text-landing-isi-hp text-ink-900 sm:text-landing-isi no-underline hover:text-olive-700 lg:gap-3 ${kelasMembesar}`}
                      >
                        <span
                          className={`flex size-[40px] shrink-0 items-center justify-center rounded-full bg-olive-100 lg:size-7 ${kelasBayanganLingkaran}`}
                        >
                          <Ikon size={24} weight="fill" aria-hidden="true" className={warna} />
                        </span>
                        <span className="min-w-0 break-words">
                          <span className="sr-only">{label}: </span>
                          {teks}
                        </span>
                      </a>
                    </Muncul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Kaki */}
      <footer className="border-t-2 border-olive-100">
        <p className="px-4 py-4 text-left text-small font-bold text-ink-900 sm:text-body min-[600px]:px-5 lg:px-6">© 2026 BinBank</p>
      </footer>
    </div>
  )
}
