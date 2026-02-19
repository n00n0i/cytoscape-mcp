# cytoscape-mcp

Cytoscape.js MCP server with HTTP Streamable transport. Generates interactive graph HTML files and serves them via a built-in web server.

- MCP Server: **http://localhost:3100/mcp**
- Web Server: **http://localhost:3001**

## Quick Start

```bash
# Install deps (copies Cytoscape libs to ./lib)
npm install

# Start MCP server
npm run start

# In another terminal, start web server
npm run web
```

Open the web server:
- Health check: `http://localhost:3001/health`
- View a graph: `http://localhost:3001/view/<graphId>`

## MCP Tools

### `create-graph-html`
Create an interactive Cytoscape graph as HTML and save to `/app/output` (or `OUTPUT_DIR`).

**Input**
```json
{
  "graph": {
    "nodes": [
      {"id": "a", "label": "Node A", "color": "#ff6b6b", "size": 40, "position": {"x": 100, "y": 100}},
      {"id": "b", "label": "Node B", "color": "#4dabf7", "size": 30}
    ],
    "edges": [
      {"id": "ab", "source": "a", "target": "b", "label": "A → B", "color": "#333", "width": 2}
    ]
  },
  "layout": "cose",
  "title": "My Graph",
  "width": 900,
  "height": 600,
  "style": [
    {"selector": "node", "style": {"font-size": "14px"}},
    {"selector": "edge", "style": {"curve-style": "bezier"}}
  ]
}
```

**Output**
```json
{
  "graphId": "graph-<uuid>",
  "viewUrl": "http://localhost:3001/view/graph-<uuid>",
  "htmlUrl": "http://localhost:3001/output/graph-<uuid>.html"
}
```

## Data Format Specifications

You can provide graph data as:

1. **Nodes/edges object** (recommended)
```json
{
  "nodes": [
    {"id": "n1", "label": "Node 1", "color": "#00a" , "size": 32, "position": {"x": 50, "y": 50}},
    {"id": "n2", "label": "Node 2"}
  ],
  "edges": [
    {"id": "e1", "source": "n1", "target": "n2", "label": "links to", "width": 3}
  ]
}
```

2. **Cytoscape elements** (native)
```json
{
  "elements": {
    "nodes": [{"data": {"id": "n1", "label": "Node 1"}}],
    "edges": [{"data": {"id": "e1", "source": "n1", "target": "n2"}}]
  }
}
```

### Supported Node Properties
- `id` (string, required)
- `label` (string)
- `color` (string hex/rgba)
- `size` (number, px)
- `position` ({x, y}) when using `preset` layout
- `style` (object) to override per-node styles
- Any additional properties are included in `data` for styling or label mapping

### Supported Edge Properties
- `id` (string)
- `source` / `target` (node ids)
- `label` (string)
- `color` (string)
- `width` (number)
- `arrowShape` (string, default `triangle`)
- `style` (object) to override per-edge styles
- Any additional properties are included in `data`

## Supported Graph Layouts
Cytoscape built-in layouts:
- `circle`
- `grid`
- `breadthfirst`
- `concentric`
- `cose`
- `random`
- `preset`

Additional layouts included:
- `dagre` (via **cytoscape-dagre**)

You can also pass a full layout config object instead of a string.

## Example Prompts for AI

- "Create a Cytoscape graph with 10 nodes in a circle layout and label each node."
- "Generate a DAG using dagre layout for these nodes and edges, and save as HTML."
- "Build a network graph with custom colors and sizes, then return the view URL."

## Docker Usage

Build and run with docker-compose:

```bash
docker-compose up --build
```

Ports:
- MCP Server: `http://localhost:3100/mcp`
- Web Server: `http://localhost:3001`

Volumes:
- `./output` → `/app/output` (generated HTML files)

### Local Cytoscape Library
This project **does not use CDN**. Cytoscape.js and dagre libraries are copied into `./lib` on `npm install` (see `scripts/copy-libs.js`).

### Thai Font Support
The Docker image installs `fonts-thai-tlwg` for proper Thai rendering.
