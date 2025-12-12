import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, CardBody, Input, GhostButton, Skeleton } from '../components/ui'
import { initials } from '../lib/format'

export default function Guilds() {
  const [guilds, setGuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('name-asc')
  const nav = useNavigate()

  useEffect(() => {
    setLoading(true)
    api('/guilds')
      .then(setGuilds)
      .catch(e => {
        console.error(e)
        if (String(e).includes('401')) nav('/login')
        else setErr("Impossible de récupérer les guilds")
      })
      .finally(()=>setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const f = guilds.filter(g => (g.name || '').toLowerCase().includes(q.toLowerCase()) || g.id.includes(q))
    const [k, dir] = sort.split('-')
    const s = [...f].sort((a,b) => {
      const av = (a[k] || '').toString().toLowerCase()
      const bv = (b[k] || '').toString().toLowerCase()
      return av < bv ? -1 : av > bv ? 1 : 0
    })
    return dir === 'asc' ? s : s.reverse()
  }, [guilds, q, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Guilds</h2>
          <p className="text-sm text-zinc-400">Serveurs où Rex Secure est présent</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Rechercher (nom ou ID)" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="rounded-lg bg-zinc-900 border border-zinc-800 px-2">
            <option value="name-asc">Nom ↑</option>
            <option value="name-desc">Nom ↓</option>
            <option value="id-asc">ID ↑</option>
            <option value="id-desc">ID ↓</option>
          </select>
          <GhostButton onClick={()=>window.location.reload()}>Refresh</GhostButton>
        </div>
      </div>

      {err && <p className="text-amber-400 text-sm">{err}</p>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({length:6}).map((_,i)=>(
            <Card key={i}><CardBody><Skeleton className="h-16"/></CardBody></Card>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(g => (
            <Link key={g.id} to={`/guilds/${g.id}`}>
              <Card className="hover:bg-zinc-850/60 transition">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 grid place-items-center text-sm font-semibold">
                      {initials(g.name || '??')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.name || 'Sans nom'}</div>
                      <div className="text-xs text-zinc-400">{g.id}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card><CardBody>
          <p className="text-zinc-300">Aucune guilde trouvée.</p>
          <p className="text-sm text-zinc-500 mt-1">Invite le bot sur un serveur puis reviens ici.</p>
        </CardBody></Card>
      )}
    </div>
  )
}
