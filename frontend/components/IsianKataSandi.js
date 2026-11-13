"use client"

import { useState } from "react"
import { Eye, EyeSlash } from "@phosphor-icons/react"
import IsianTeks from "@/components/IsianTeks"

export default function IsianKataSandi({ id, autoComplete = "current-password", ...rest }) {
  const [tampil, setTampil] = useState(false)
  const Ikon = tampil ? EyeSlash : Eye

  return (
    <IsianTeks
      {...rest}
      id={id}
      type={tampil ? "text" : "password"}
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      sisiKanan={
        <button
          type="button"
          aria-label={tampil ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={tampil}
          aria-controls={id}
          onClick={() => setTampil((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-2 border-0 bg-transparent text-ink-700 hover:text-olive-700"
        >
          <Ikon size={24} weight="regular" aria-hidden="true" />
        </button>
      }
    />
  )
}
