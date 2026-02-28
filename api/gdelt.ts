export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || 'iran';
  const mode = url.searchParams.get('mode') || 'artlist';
  const maxrecords = url.searchParams.get('maxrecords') || '75';
  const sort = url.searchParams.get('sort') || 'datedesc';
  const timespan = url.searchParams.get('timespan') || '';
  const timeres = url.searchParams.get('timeres') || '';

  const params = new URLSearchParams({ query, mode, format: 'json' });
  if (maxrecords) params.set('maxrecords', maxrecords);
  if (sort) params.set('sort', sort);
  if (timespan) params.set('TIMESPAN', timespan);
  if (timeres) params.set('TIMERES', timeres);

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?${params}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const text = await res.text();
    return new Response(text, { status: res.status, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'GDELT proxy timeout' }), {
      status: 502,
      headers,
    });
  }
}
