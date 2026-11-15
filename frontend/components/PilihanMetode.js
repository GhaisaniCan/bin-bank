export default function PilihanMetode({ nama, legenda, opsi, nilai, onChange, disabled = false }) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-body text-ink-900">{legenda}</legend>
      <div className="mt-2 flex flex-col gap-2">
        {opsi.map((o) => {
          const id = `${nama}-${o.nilai}`
          const idPenjelasan = o.penjelasan ? `${id}-penjelasan` : undefined
          return (
            <label
              key={o.nilai}
              htmlFor={id}
              className="flex min-h-7 cursor-pointer items-center gap-3 rounded-2 border border-line-500 bg-putih px-4 py-2 hover:bg-olive-50 has-[:checked]:border-ink-900 has-[:checked]:bg-olive-100 has-[:checked]:ring-1 has-[:checked]:ring-ink-900 has-[:disabled]:cursor-default"
            >
              <input
                id={id}
                type="radio"
                name={nama}
                value={o.nilai}
                checked={nilai === o.nilai}
                onChange={() => onChange(o.nilai)}
                aria-describedby={idPenjelasan}
                className="size-5 shrink-0 accent-olive-700"
              />
              <span className="min-w-0">
                <span className="block text-body font-bold text-ink-900">{o.label}</span>
                {o.penjelasan && (
                  <span id={idPenjelasan} className="block text-small text-ink-700">
                    {o.penjelasan}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
