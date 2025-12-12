export function Card({className="", children}) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900 ${className}`}>{children}</div>
}
export function CardBody({className="", children}) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
export function Button({className="", ...props}) {
  return <button {...props} className={`rounded-lg px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 ${className}`} />
}
export function GhostButton({className="", ...props}) {
  return <button {...props} className={`rounded-lg px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 ${className}`} />
}
export function Badge({children, tone="zinc"}) {
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs bg-${tone}-800/60 border border-${tone}-700/40`}>{children}</span>
}
export function Input({className="", ...props}) {
  return <input {...props} className={`w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none ${className}`} />
}
export function Textarea({className="", ...props}) {
  return <textarea {...props} className={`w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 font-mono text-sm ${className}`} />
}
export function Skeleton({className=""}) {
  return <div className={`animate-pulse rounded bg-zinc-800/60 ${className}`} />
}
