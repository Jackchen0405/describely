const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseKey);
}

function restUrl(path: string, query?: string) {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/rest/v1/${path}${query ? `?${query}` : ""}`;
}

function headers(extra?: HeadersInit) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Supabase request failed: ${res.status} ${detail}`);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export async function selectRows<T>(table: string, query: string) {
  const res = await fetch(restUrl(table, query), {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  return parseResponse<T[]>(res);
}

export async function selectOne<T>(table: string, query: string) {
  const rows = await selectRows<T>(table, `${query}&limit=1`);
  return rows[0] || null;
}

export async function upsertRow<T>(
  table: string,
  payload: Record<string, unknown>,
  conflictTarget: string
) {
  const res = await fetch(restUrl(table, `on_conflict=${encodeURIComponent(conflictTarget)}`), {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const rows = await parseResponse<T[]>(res);
  return rows[0] || null;
}

export async function insertRow<T>(table: string, payload: Record<string, unknown>) {
  const res = await fetch(restUrl(table), {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const rows = await parseResponse<T[]>(res);
  return rows[0] || null;
}

export async function patchRows<T>(
  table: string,
  query: string,
  payload: Record<string, unknown>
) {
  const res = await fetch(restUrl(table, query), {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return parseResponse<T[]>(res);
}

export async function deleteRows(table: string, query: string) {
  const res = await fetch(restUrl(table, query), {
    method: "DELETE",
    headers: headers(),
    cache: "no-store",
  });
  return parseResponse<null>(res);
}
