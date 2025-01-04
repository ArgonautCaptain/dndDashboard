import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Debugging step to confirm the function handler works
  if (!req.query.url) {
    console.log('Proxy endpoint reached but no URL provided');
    return res.status(200).json({ message: 'Proxy endpoint is working, but no URL parameter provided.' });
  }

  // Ensure only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = req.query.url;

  // Debugging to confirm the target URL is being received
  console.log('Target URL:', targetUrl);

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    // Make the proxy request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

    // Debugging to log the response status
    console.log('Proxy Response Status:', response.status);

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    // Log errors for debugging
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Error occurred while proxying the request' });
  }
}
