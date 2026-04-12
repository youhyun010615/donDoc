const RAILWAY_BASE = process.env.RAILWAY_BASE_URL;

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

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    res.status(response.status);
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (err) {
    res.status(502).json({ error: 'Railway 서버에 연결할 수 없어요', detail: err.message });
  }
}
