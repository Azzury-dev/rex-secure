export async function api(path, opts = {}) {
  const url = path.startsWith('/api') ? path : `/api${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
