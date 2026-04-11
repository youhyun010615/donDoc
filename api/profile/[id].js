import { isValidToken, proxyToRailway } from '../_proxy.js';

// GET /api/profile/:id — 외부 접근 차단
// PUT /api/profile/:id — 외부 접근 차단
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET' && !isValidToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'PUT' && !isValidToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return proxyToRailway(req, res, `/profile/${id}`);
}
