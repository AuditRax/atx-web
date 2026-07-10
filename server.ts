import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './src/api.js'; // Use compiled or direct type stripping resolution
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Mount the API sub-app
app.use(apiApp);

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// For all other requests, send the index.html (supporting SPA client routing if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 AuditRax Production Server running on port ${PORT}`);
  console.log(`📁 Serving client bundle from: ${distPath}`);
  console.log(`===================================================`);
});
