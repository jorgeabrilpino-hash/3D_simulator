function getSupabaseBaseUrl() {
  const rawUrl = process.env.SUPABASE_URL
  if (!rawUrl) return null

  const trimmed = rawUrl.replace(/\/+$/, '')
  return trimmed.endsWith('/rest/v1') ? trimmed : `${trimmed}/rest/v1`
}

export async function insertSupabase(table: string, payload: unknown) {
  const baseUrl = getSupabaseBaseUrl()
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!baseUrl || !key) {
    return { skipped: true, reason: 'Supabase no configurado' }
  }

  const response = await fetch(`${baseUrl}/${table}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Supabase insert error ${response.status}`)
  }

  return { skipped: false }
}
