const RAILWAY_BASE = 'https://dondoc-json-server-production-3c7c.up.railway.app';

export function isValidToken(req) {
  const secret = process.env.INTERNAL_API_SECRET;
  return secret && req.headers['x-internal-token'] === secret;
}

export async function proxyToRailway(req, res, railwayPath) {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const targetUrl = `${RAILWAY_BASE}${railwayPath}${qs}`;

  const fetchOptions = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (req.body && req.method !== 'GET' && req.method !== 'DELETE') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const response = await fetch(targetUrl, fetchOptions);
  const text = await response.text();

  res.status(response.status);
  try {
    res.json(JSON.parse(text));
  } catch {
    res.send(text);
  }
}
