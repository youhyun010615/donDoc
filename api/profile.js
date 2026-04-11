import { isValidToken, proxyToRailway } from './_proxy.js';

// GET /api/profile — 외부 접근 차단 (로그인/회원가입 시 userId 쿼리 포함)
// PUT /api/profile — 외부 접근 차단
export default async function handler(req, res) {
  if (req.method === 'GET' && !isValidToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'PUT' && !isValidToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return proxyToRailway(req, res, '/profile');
}
