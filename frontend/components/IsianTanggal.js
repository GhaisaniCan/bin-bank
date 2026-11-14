"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarBlank } from "@phosphor-icons/react"

function bentuk(digit) {
  const d = digit.slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join("/")
}

function keIso(teks) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(teks)
  if (!m) return ""
  const [, hari, bulan, tahun] = m
  const tgl = new Date(Number(tahun), Number(bulan) - 1, Number(hari))
  const sah =
    tgl.getFullYear() === Number(tahun) &&
    tgl.getMonth() === Number(bulan) - 1 &&
    tgl.getDate() === Number(hari)
  return sah ? `${tahun}-${bulan}-${hari}` : ""
}

function keTeks(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ""
}

export default function IsianTanggal({ id, value, onChange, salah = false, describedBy }) {
  const refKalender = useRef(null)
  const [teks, setTeks] = useState(keTeks(value))
  const [galat, setGalat] = useState(false)

  useEffect(() => {
    if (keIso(teks) !== value) {
      setTeks(keTeks(value))
      setGalat(false)
    }
  }, [value, teks])

  function ubah(e) {
    const baru = bentuk(e.target.value.replace(/\D/g, ""))
    setTeks(baru)
    setGalat(false)
    onChange(keIso(baru))
  }

  function saatKeluar() {
    setGalat(teks !== "" && keIso(teks) === "")
  }

  function bukaKalender() {
    const el = refKalender.current
    if (!el) return
    try {
      el.showPicker()
    } catch {
      el.focus()
    }
  }

  const merah = salah || galat

  return (
    <>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          maxLength={10}
          value={teks}
          onChange={ubah}
          onBlur={saatKeluar}
          aria-invalid={merah ? "true" : "false"}
          aria-describedby={galat ? `${id}-galat` : describedBy}
          className={`h-12 w-full rounded-2 bg-putih px-3 pr-14 text-body ${
            merah ? "border-2 border-bata-700" : "border border-line-500"
          }`}
        />
        <input
          ref={refKalender}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
        />
        <button
          type="button"
          onClick={bukaKalender}
          aria-label="Buka kalender"
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-olive-700 hover:text-olive-800"
        >
          <CalendarBlank size={24} weight="regular" aria-hidden="true" />
        </button>
      </div>
      {galat && (
        <p id={`${id}-galat`} role="alert" className="mt-2 text-small font-bold text-bata-700">
          Format tanggal salah, contoh 10/11/2026
        </p>
      )}
    </>
  )
}