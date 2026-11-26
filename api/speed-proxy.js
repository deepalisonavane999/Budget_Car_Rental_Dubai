// Vercel Serverless Function Proxy for Speed Auto Systems API
// Keeps SPEED_API_KEY and SPEED_API_CODE secure on the server side (not exposed to browser/client bundle)

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, ApiKey, Authorization'
  );

  // Handle browser preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let targetPath = '';
    if (req.query && req.query.path) {
      targetPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    } else {
      targetPath = (req.url || '').replace(/^\/(api\/speed-proxy|speed-api)\/?/, '').split('?')[0];
    }

    const cleanPath = targetPath.replace(/^\/+/, '');

    // Server-side secret environment variables from Vercel
    const apiKey = process.env.SPEED_API_KEY || process.env.VITE_API_KEY || req.headers['apikey'] || '';
    const apiCode = process.env.SPEED_API_CODE || process.env.VITE_API_CODE || '';

    // Build target Azure API URL with code parameter
    let targetUrl = `https://speedapi-budgetgensys-grgacxg8grhvh2cs.uaenorth-01.azurewebsites.net/api/${cleanPath}`;
    if (apiCode) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${separator}code=${encodeURIComponent(apiCode)}`;
    }

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    if (apiKey) {
      headers['ApiKey'] = apiKey;
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
    console.error('Speed API proxy error:', err);
    return res.status(500).json({ error: err.message || 'Speed API proxy server error' });
  }
}
