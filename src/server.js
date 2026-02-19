// Cytoscape MCP Server - HTTP Streamable Transport
// Port: 3100

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/output';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const DEFAULT_NODE_COLOR = '#2E86AB';
const DEFAULT_EDGE_COLOR = '#555';

function parseJsonMaybe(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function buildElementsFromGraph(graphInput) {
  const graph = parseJsonMaybe(graphInput) || {};

  // If already in Cytoscape format
  if (graph.elements) {
    return graph.elements;
  }

  const nodes = (graph.nodes || []).map((node, idx) => {
    const id = node.id || `node-${idx}`;
    const label = node.label ?? id;
    const color = node.color ?? DEFAULT_NODE_COLOR;
    const size = node.size ?? 36;

    const data = {
      id,
      label,
      color,
      size,
      ...(node.data || {})
    };

    // Include extra props into data
    for (const [key, value] of Object.entries(node)) {
      if (!['id', 'label', 'color', 'size', 'position', 'data', 'classes'].includes(key)) {
        data[key] = value;
      }
    }

    const element = {
      data,
      position: node.position,
      classes: node.classes
    };

    // Per-node style override
    if (node.style) {
      element.style = node.style;
    }

    return element;
  });

  const edges = (graph.edges || []).map((edge, idx) => {
    const id = edge.id || `edge-${idx}`;
    const color = edge.color ?? DEFAULT_EDGE_COLOR;
    const width = edge.width ?? 2;
    const label = edge.label ?? '';
    const arrowShape = edge.arrowShape ?? 'triangle';

    const data = {
      id,
      source: edge.source,
      target: edge.target,
      label,
      color,
      width,
      arrowShape,
      ...(edge.data || {})
    };

    for (const [key, value] of Object.entries(edge)) {
      if (!['id', 'source', 'target', 'label', 'color', 'width', 'arrowShape', 'data', 'classes'].includes(key)) {
        data[key] = value;
      }
    }

    const element = {
      data,
      classes: edge.classes
    };

    if (edge.style) {
      element.style = edge.style;
    }

    return element;
  });

  return { nodes, edges };
}

function buildStyles(userStyles) {
  const base = [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'width': 'data(size)',
        'height': 'data(size)',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#1f2937',
        'font-size': '12px',
        'font-family': '"TH Sarabun New", "Sarabun", "Tahoma", sans-serif'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(width)',
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'data(arrowShape)',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '11px',
        'font-family': '"TH Sarabun New", "Sarabun", "Tahoma", sans-serif'
      }
    }
  ];

  if (Array.isArray(userStyles)) {
    return base.concat(userStyles);
  }
  return base;
}

function generateGraphHTML({ title, elements, layout, style, width, height, options }) {
  const graphId = `graph-${uuidv4()}`;
  const layoutConfig = typeof layout === 'string' ? { name: layout } : (layout || { name: 'cose' });
  const finalStyle = buildStyles(style);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title || 'Cytoscape Graph'}</title>
  <script src="/lib/dagre.min.js"></script>
  <script src="/lib/cytoscape.min.js"></script>
  <script src="/lib/cytoscape-dagre.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: "TH Sarabun New", "Sarabun", "Tahoma", sans-serif; }
    #cy { width: ${width}px; height: ${height}px; display: block; }
  </style>
</head>
<body>
  <div id="cy"></div>
  <script>
    const elements = ${JSON.stringify(elements)};
    const style = ${JSON.stringify(finalStyle)};
    const layout = ${JSON.stringify(layoutConfig)};
    const options = ${JSON.stringify(options || {})};

    const cy = cytoscape(Object.assign({
      container: document.getElementById('cy'),
      elements,
      style,
      layout
    }, options));

    window.cy = cy;
  </script>
</body>
</html>`;

  return { graphId, html };
}

function createMcpServer() {
  const server = new McpServer({
    name: 'cytoscape-mcp',
    version: '1.0.0'
  });

  server.registerTool('create-graph-html', {
    description: 'Create an interactive Cytoscape graph as HTML',
    inputSchema: {
      graph: z.any().describe('Graph data (object or JSON string) with nodes/edges or Cytoscape elements'),
      layout: z.any().optional().describe('Layout name or layout config object (circle, grid, breadthfirst, concentric, cose, dagre, preset, etc.)'),
      title: z.string().optional().describe('HTML page title'),
      style: z.array(z.record(z.any())).optional().describe('Cytoscape style overrides'),
      width: z.number().optional().default(900).describe('Canvas width in pixels'),
      height: z.number().optional().default(600).describe('Canvas height in pixels'),
      options: z.record(z.any()).optional().describe('Additional Cytoscape init options')
    }
  }, async ({ graph, layout, title, style, width, height, options }) => {
    const parsedGraph = parseJsonMaybe(graph);
    const elements = buildElementsFromGraph(parsedGraph);
    const { graphId, html } = generateGraphHTML({
      title,
      elements,
      layout: layout || parsedGraph.layout,
      style,
      width,
      height,
      options
    });

    const filePath = path.join(OUTPUT_DIR, `${graphId}.html`);
    fs.writeFileSync(filePath, html);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            graphId,
            viewUrl: `${PUBLIC_URL}/view/${graphId}`,
            htmlUrl: `${PUBLIC_URL}/output/${graphId}.html`
          })
        }
      ]
    };
  });

  return server;
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '4mb', type: ['application/json', 'application/*+json'] }));
app.use(express.text({ limit: '4mb', type: ['text/*', 'application/xml', 'application/octet-stream'] }));

app.post('/mcp', async (req, res) => {
  const server = createMcpServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    await server.connect(transport);

    const body = typeof req.body === 'string' ? parseJsonMaybe(req.body) : req.body;
    await transport.handleRequest(req, res, body);

    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error('MCP error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'cytoscape-mcp', version: '1.0.0' });
});

const PORT = parseInt(process.env.MCP_PORT || '3100', 10);
app.listen(PORT, () => {
  console.log(`Cytoscape MCP Server on port ${PORT}`);
});
