import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                Accept: 'application/json',
            },
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Error occurred while proxying the request' });
    }
}
