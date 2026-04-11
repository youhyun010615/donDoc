import { isValidToken, proxyToRailway } from './_proxy.js';

// PUT /api/* — 외부 접근 차단
// 그 외 모든 /api/* 요청은 Railway로 프록시
export default async function handler(req, res) {
  if (req.method === 'PUT' && !isValidToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path;

  return proxyToRailway(req, res, `/${pathStr}`);
}
