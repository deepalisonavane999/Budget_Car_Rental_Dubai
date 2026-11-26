// Vercel Serverless Function Proxy for CXPulse API
// Solves HTTP 403 Forbidden caused by WAF/Cloudflare blocking browser Origin & Referer headers

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key, Authorization'
  );

  // Handle browser preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract target API path (e.g., api/integration/v1/tickets)
    let targetPath = '';
    if (req.query && req.query.path) {
      targetPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    } else {
      targetPath = (req.url || '').replace(/^\/(api\/cxpulse-proxy|cxpulse-api)\/?/, '').split('?')[0];
    }

    const cleanPath = targetPath.replace(/^\/+/, '');
    const targetUrl = `https://cxpulse.agmcgroup.ae/${cleanPath}`;

    // Clean headers: remove Origin & Referer, spoof Host & User-Agent (matches vite.config.ts local proxy)
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Host': 'cxpulse.agmcgroup.ae',
      'User-Agent': 'PostmanRuntime/7.39.0',
    };

    // Server-side secret key from Vercel environment variables, fallback to client header if passed
    const apiKey = req.headers['x-api-key'] || process.env.CXPULSE_API_KEY || process.env.VITE_CXPULSE_API_KEY || '';
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const upstreamResponse = await fetch(targetUrl, fetchOptions);

    res.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await upstreamResponse.json().catch(() => null);
      return res.json(json);
    } else {
      const text = await upstreamResponse.text();
      return res.send(text);
    }
  } catch (err) {
    console.error('CXPulse proxy error:', err);
    return res.status(500).json({ error: err.message || 'CXPulse proxy server error' });
  }
}
