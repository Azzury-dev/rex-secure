export function initials(name='?') {
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const a = parts[0][0] || ''
  const b = parts[1]?.[0] || ''
  return (a + b).toUpperCase()
}