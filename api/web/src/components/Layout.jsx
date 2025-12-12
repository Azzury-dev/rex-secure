import { Link, NavLink, useLocation } from 'react-router-dom'

function cx(...cls){ return cls.filter(Boolean).join(' ') }

export default function Layout({ children }) {
  const loc = useLocation()
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:block border-r border-zinc-800 bg-zinc-950 sticky top-0 h-dvh">
        <div className="px-4 py-4 border-b border-zinc-800">
          <Link to="/guilds" className="text-lg font-semibold">🛡️ Rex Secure</Link>
          <p className="text-xs text-zinc-500 mt-1">Dashboard sécurité</p>
        </div>
        <nav className="p-2">
          <NavLink
            to="/guilds"
            className={({isActive})=>cx(
              "block rounded-lg px-3 py-2 text-sm",
              isActive ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
            )}
          >Guilds</NavLink>
          <a
            href="/api/auth/logout"
            className="mt-2 block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >Se déconnecter</a>
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-zinc-400">{loc.pathname}</div>
          <div className="flex items-center gap-2">
            <a href="/api/auth/login" className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Changer de compte</a>
          </div>
        </header>
        <main className="p-4 max-w-6xl">{children}</main>
      </div>
    </div>
  )
}
