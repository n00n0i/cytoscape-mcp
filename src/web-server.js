// Cytoscape Web Server
// Serves generated graphs and Cytoscape library
// Port: 3001

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/output';
const LIB_DIR = process.env.LIB_DIR || path.join(__dirname, '..', 'lib');

const app = express();

app.use(cors());

app.use('/lib', express.static(LIB_DIR));
app.use('/output', express.static(OUTPUT_DIR));

app.get('/view/:id', (req, res) => {
  const filePath = path.join(OUTPUT_DIR, `${req.params.id}.html`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(filePath);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'cytoscape-web', version: '1.0.0' });
});

const PORT = parseInt(process.env.WEB_PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Cytoscape Web Server on port ${PORT}`);
});
