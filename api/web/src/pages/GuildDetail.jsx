import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, CardBody, Button, GhostButton, Skeleton } from '../components/ui'
import { Row, Text, Number as NumberField, Select, Tags } from '../components/Field'

function Tabs({tab, setTab}) {
  const base = "px-3 py-2 rounded-lg text-sm"
  const off = "text-zinc-300 hover:bg-zinc-900"
  const on = "bg-zinc-800 text-white"
  return (
    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
      {['overview','config','incidents'].map(t=>(
        <button key={t} onClick={()=>setTab(t)} className={`${base} ${tab===t?on:off}`}>{t}</button>
      ))}
    </div>
  )
}

export default function GuildDetail() {
  const { id } = useParams()
  const [cfgText, setCfgText] = useState('')
  const [cfgLoading, setCfgLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [incLoading, setIncLoading] = useState(true)
  const [incidents, setIncidents] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setCfgLoading(true)
    api(`/guilds/${id}/config`)
      .then(j => setCfgText(JSON.stringify(j, null, 2)))
      .catch(() => setMsg('Erreur chargement config'))
      .finally(()=>setCfgLoading(false))
  }, [id])

  useEffect(() => {
    setIncLoading(true)
    api(`/guilds/${id}/incidents`)
      .then(setIncidents)
      .catch(()=>{})
      .finally(()=>setIncLoading(false))
  }, [id])

  const cfg = useMemo(()=> {
    try { return JSON.parse(cfgText || '{}') } catch { return {} }
  }, [cfgText])

  function update(path, value){
    const next = {...cfg}
    const keys = path.split('.')
    let cur = next
    for (let i=0;i<keys.length-1;i++){
      cur[keys[i]] = cur[keys[i]] ?? {}
      cur = cur[keys[i]]
    }
    cur[keys[keys.length-1]] = value
    setCfgText(JSON.stringify(next, null, 2))
  }

  async function save() {
    setSaving(true); setMsg('')
    try {
      const parsed = JSON.parse(cfgText)
      await api(`/guilds/${id}/config`, { method:'POST', body: JSON.stringify(parsed) })
      setMsg('Config sauvegardée ✅')
    } catch (e) {
      setMsg('JSON invalide ou erreur de sauvegarde ❌'); console.error(e)
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Guild {id}</h2>
        <p className="text-sm text-zinc-400">Gestion sécurité & configuration</p>
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">Mode</div>
                  <div className="text-lg font-semibold">{cfg.mode || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <GhostButton onClick={()=>window.location.reload()}>Refresh</GhostButton>
                  <Button onClick={()=>alert('Lockdown (demo)')}>Lockdown</Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <Card><CardBody>
                  <div className="text-sm text-zinc-400">Seuils</div>
                  {cfg.thresholds ? (
                    <div className="text-sm mt-1">
                      soft: {cfg.thresholds.soft} • quarantine: {cfg.thresholds.quarantine} • ban: {cfg.thresholds.ban} • lockdown: {cfg.thresholds.lockdown}
                    </div>
                  ) : <Skeleton className="h-5" />}
                </CardBody></Card>
                <Card><CardBody>
                  <div className="text-sm text-zinc-400">Cooldowns</div>
                  {cfg.cooldowns ? (
                    <div className="text-sm mt-1">message: {cfg.cooldowns.message} • link: {cfg.cooldowns.link}</div>
                  ) : <Skeleton className="h-5" />}
                </CardBody></Card>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-zinc-400">Quarantine</div>
              {cfg.quarantine ? (
                <div className="text-sm mt-1">
                  rôle: <span className="font-medium">{cfg.quarantine.role_name}</span><br/>
                  durée: {cfg.quarantine.duration_sec}s
                </div>
              ) : <Skeleton className="h-5" />}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'config' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <GhostButton onClick={()=>window.location.reload()}>Annuler</GhostButton>
            <Button disabled={saving} onClick={save}>{saving?'Sauvegarde...':'Sauvegarder'}</Button>
          </div>

          {/* Mode */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Mode</h3>
            <Row label="Mode d’action" hint="observe = log only, enforce = appliquer les sanctions">
              <Select
                value={cfg.mode || 'observe'}
                onChange={(v)=>update('mode', v)}
                options={[
                  {label:'Observe (log only)', value:'observe'},
                  {label:'Enforce (actif)', value:'enforce'}
                ]}
              />
            </Row>
          </CardBody></Card>

          {/* Seuils */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Seuils</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Row label="Soft">
                <NumberField value={cfg.thresholds?.soft ?? 30} onChange={(v)=>update('thresholds.soft', v)} />
              </Row>
              <Row label="Quarantine">
                <NumberField value={cfg.thresholds?.quarantine ?? 60} onChange={(v)=>update('thresholds.quarantine', v)} />
              </Row>
              <Row label="Ban">
                <NumberField value={cfg.thresholds?.ban ?? 90} onChange={(v)=>update('thresholds.ban', v)} />
              </Row>
              <Row label="Lockdown">
                <NumberField value={cfg.thresholds?.lockdown ?? 120} onChange={(v)=>update('thresholds.lockdown', v)} />
              </Row>
            </div>
          </CardBody></Card>

          {/* Poids */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Poids (scores des signaux)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(cfg.weights || {
                joins_10s:25, new_account:20, name_similarity:15,
                msg_burst:25, mentions_rate:20, links_rate:20,
                bad_link:60, perm_change_admin:50, webhook_spike:40
              }).map(([k,v])=>(
                <Row key={k} label={k}>
                  <NumberField value={v} onChange={(nv)=>update(`weights.${k}`, nv)} />
                </Row>
              ))}
            </div>
          </CardBody></Card>

          {/* Cooldowns */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Cooldowns</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
              <Row label="Messages (ex: 1/10s)">
                <Text value={cfg.cooldowns?.message ?? '1/10s'} onChange={(v)=>update('cooldowns.message', v)} />
              </Row>
              <Row label="Liens (ex: 2/30s)">
                <Text value={cfg.cooldowns?.link ?? '2/30s'} onChange={(v)=>update('cooldowns.link', v)} />
              </Row>
            </div>
          </CardBody></Card>

          {/* Quarantine */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Quarantine</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Row label="Nom du rôle">
                <Text value={cfg.quarantine?.role_name ?? 'Quarantine'} onChange={(v)=>update('quarantine.role_name', v)} />
              </Row>
              <Row label="Durée (sec)">
                <NumberField value={cfg.quarantine?.duration_sec ?? 3600} onChange={(v)=>update('quarantine.duration_sec', v)} />
              </Row>
            </div>
          </CardBody></Card>

          {/* Lists */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-3">Allow/Deny lists</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              <Row label="Allowlist domaines">
                <Tags values={cfg.allowlist?.domains || []} onChange={(arr)=>update('allowlist.domains', arr)} placeholder="ex: exemple.com" />
              </Row>
              <Row label="Denylist domaines">
                <Tags values={cfg.denylist?.domains || []} onChange={(arr)=>update('denylist.domains', arr)} placeholder="ex: grabify.link" />
              </Row>
            </div>
          </CardBody></Card>

          {/* Zone JSON (debug) */}
          <Card><CardBody>
            <h3 className="text-lg font-semibold mb-2">Aperçu JSON (lecture seule)</h3>
            <pre className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-3 overflow-auto">{cfgText}</pre>
          </CardBody></Card>
        </div>
      )}

      {/* INCIDENTS */}
      {tab === 'incidents' && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Incidents récents</h3>
              <GhostButton onClick={()=>window.location.reload()}>Refresh</GhostButton>
            </div>
            {incLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14"/><Skeleton className="h-14"/><Skeleton className="h-14"/>
              </div>
            ) : incidents.length ? (
              <div className="space-y-2">
                {incidents.map(it => (
                  <div key={it.id} className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                    <div className="text-sm font-medium">{it.type || 'incident'} • score {it.risk_score ?? '-'}</div>
                    <div className="text-xs text-zinc-400">{it.started_at ? new Date(it.started_at).toLocaleString() : ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Aucun incident.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}