export default function IsianTeks({ id, label, bantuan, galat, sisiKanan, ...rest }) {
  const idGalat = galat ? `${id}-galat` : null
  const idBantuan = bantuan ? `${id}-bantuan` : null
  const deskripsi = [idGalat, idBantuan].filter(Boolean).join(" ") || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-body text-ink-900">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          aria-invalid={galat ? true : undefined}
          aria-describedby={deskripsi}
          className={`h-7 w-full rounded-2 bg-putih pl-3 text-body text-ink-900 placeholder:text-ink-500 ${
            sisiKanan ? "pr-7" : "pr-3"
          } ${galat ? "border-2 border-bata-700" : "border border-line-500"}`}
          {...rest}
        />
        {sisiKanan && <div className="absolute inset-y-0 right-0 flex items-center">{sisiKanan}</div>}
      </div>
      {galat && (
        <p id={idGalat} className="mt-2 text-small font-bold text-bata-700">
          {galat}
        </p>
      )}
      {bantuan && (
        <p id={idBantuan} className="mt-2 text-small text-ink-500">
          {bantuan}
        </p>
      )}
    </div>
  )
}
