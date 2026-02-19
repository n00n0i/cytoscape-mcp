import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const libDir = path.join(projectRoot, 'lib');

const filesToCopy = [
  {
    from: path.join(projectRoot, 'node_modules', 'cytoscape', 'dist', 'cytoscape.min.js'),
    to: path.join(libDir, 'cytoscape.min.js')
  },
  {
    from: path.join(projectRoot, 'node_modules', 'dagre', 'dist', 'dagre.min.js'),
    to: path.join(libDir, 'dagre.min.js')
  },
  {
    from: path.join(projectRoot, 'node_modules', 'cytoscape-dagre', 'cytoscape-dagre.js'),
    to: path.join(libDir, 'cytoscape-dagre.js')
  }
];

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

for (const file of filesToCopy) {
  if (!fs.existsSync(file.from)) {
    console.warn(`[copy-libs] Missing: ${file.from}`);
    continue;
  }
  fs.copyFileSync(file.from, file.to);
  console.log(`[copy-libs] Copied ${file.from} -> ${file.to}`);
}
