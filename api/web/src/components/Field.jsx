export function Row({label, children, hint}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-zinc-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

export function Text({value, onChange, placeholder=""}) {
  return (
    <input
      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none"
      value={value ?? ""}
      onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export function Number({value, onChange, min, max, step=1}) {
  return (
    <input
      type="number"
      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none"
      value={value ?? 0}
      onChange={e=>onChange(Number(e.target.value))}
      min={min} max={max} step={step}
    />
  )
}

export function Select({value, onChange, options}) {
  return (
    <select
      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none"
      value={value}
      onChange={e=>onChange(e.target.value)}
    >
      {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Tags({values=[], onChange, placeholder="ex: domaine.com"}) {
  function add(v){
    const t = v.trim()
    if (!t) return
    if (values.includes(t)) return
    onChange([...(values||[]), t])
  }
  function remove(i){
    const arr = [...(values||[])]
    arr.splice(i,1)
    onChange(arr)
  }
  let inputRef
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(values||[]).map((v,i)=>(
          <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs">
            {v}
            <button type="button" onClick={()=>remove(i)} className="opacity-70 hover:opacity-100">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={r=>inputRef=r}
          className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none"
          placeholder={placeholder}
          onKeyDown={e=>{
            if(e.key==='Enter'){ e.preventDefault(); add(e.currentTarget.value); e.currentTarget.value=''; }
          }}
        />
        <button
          type="button"
          className="rounded-lg bg-zinc-800 px-3 py-2 hover:bg-zinc-700"
          onClick={()=>{
            if (!inputRef) return;
            add(inputRef.value); inputRef.value='';
          }}
        >Ajouter</button>
      </div>
    </div>
  )
}
