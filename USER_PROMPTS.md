# Cytoscape MCP - User Prompts ตัวอย่าง

## 🔗 Endpoint สำหรับ n8n
```
http://100.68.228.6:3103/mcp
```

## 🌐 URLs
- Web Server: http://100.68.228.6:3004
- MCP Endpoint: http://100.68.228.6:3103/mcp

## 📊 1. Graph ธรรมดา (Grid Layout)
```
สร้าง graph แสดงองค์กร:
- nodes: CEO, Manager A, Manager B, Staff 1, Staff 2, Staff 3
- edges: CEO -> Manager A, CEO -> Manager B, Manager A -> Staff 1, Manager A -> Staff 2, Manager B -> Staff 3
- layout: grid
```

## 📊 2. Hierarchy Tree (Breadthfirst Layout)
```
สร้าง org chart:
- Root: "Company"
- Level 1: "Sales", "Engineering", "HR"
- Level 2: 
  - Sales: "Lead A", "Lead B"
  - Engineering: "Dev 1", "Dev 2", "Dev 3"
  - HR: "Recruiter", "Admin"
- layout: breadthfirst (ลงจากบนลงล่าง)
```

## 📊 3. Network Graph (Circle Layout)
```
สร้าง network graph:
- nodes: A, B, C, D, E
- edges: A-B, A-C, B-D, C-D, D-E, C-E
- layout: circle
```

## 📊 4. Flow Chart (Dagre Layout)
```
สร้าง flowchart กระบวนการสั่งซื้อ:
- Start -> Check Stock
- Check Stock -> [มี] -> Process Payment
- Check Stock -> [ไม่มี] -> Backorder
- Process Payment -> Ship
- Backorder -> Notify Customer
- Ship -> End
- layout: dagre (left-to-right)
```

## 📊 5. Cluster Graph (Concentric Layout)
```
สร้าง cluster graph:
- Cluster 1: Node A1, A2, A3 (edges ภายใน)
- Cluster 2: Node B1, B2 (edges ภายใน)
- Edges ระหว่าง cluster: A2-B1
- layout: concentric
```

---
## 🐳 วิธีรัน Container

```bash
cd /root/.openclaw/workspace/project/cytoscape-mcp

# Build image
docker build -t cytoscape-mcp:latest .

# Run container
docker run -d \
  --name cytoscape-mcp \
  -p 3004:3001 \
  -p 3103:3100 \
  -v $(pwd)/output:/app/output \
  cytoscape-mcp:latest

# View logs
docker logs -f cytoscape-mcp
```

## 📁 Data Format สำหรับ create-graph-html
```json
{
  "nodes": [
    {"id": "a", "label": "Node A"},
    {"id": "b", "label": "Node B"}
  ],
  "edges": [
    {"from": "a", "to": "b"}
  ],
  "layout": "circle"
}
```

## 🎨 Supported Layouts
- circle
- grid
- breadthfirst
- concentric
- cose (Compound Spring Embedder)
- dagre (hierarchical)
- preset
- random
