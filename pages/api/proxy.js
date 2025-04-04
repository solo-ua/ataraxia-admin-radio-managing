import { URL } from 'url';

export default async function handler(req, res) {
    try {
        // Parse the incoming URL to extract the "path" query parameter
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const targetPath = parsedUrl.searchParams.get('path'); // Get the "path" parameter

        if (!targetPath) {
            return res.status(400).json({ error: 'Missing "path" query parameter' });
        }

        // Construct the full URL for the target API
        const targetUrl = `http://obesecat.atwebpages.com${targetPath}`;
        console.log('Target URL:', targetUrl); // Debugging log

        // Forward the request to the target API
        const apiResponse = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
        });

        const data = await apiResponse.text();

        // Send the response back to the client
        res.status(apiResponse.status).send(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
