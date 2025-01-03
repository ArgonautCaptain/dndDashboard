import express from 'express';
import { createServer } from 'cors-anywhere';

const app = express();

// Create the proxy server
const proxy = createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: [], // Allow requests without specific headers
  removeHeaders: ['cookie', 'cookie2'], // Optional: Remove cookies from requests
});

// Middleware to handle proxy requests
app.use('/proxy', (req, res) => {
  req.url = req.url.replace(/^\/proxy/, ''); // Remove "/proxy" from the request URL
  proxy.emit('request', req, res);
});

const PORT = 4000; // The port for the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server is running at http://localhost:${PORT}/proxy`);
});
