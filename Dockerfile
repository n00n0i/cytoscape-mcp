FROM node:22-slim

# Install Thai fonts and minimal runtime deps
RUN apt-get update && apt-get install -y \
    fonts-thai-tlwg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and scripts
COPY package*.json ./
COPY scripts/ ./scripts/

# Install dependencies (runs postinstall to copy Cytoscape libs)
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Ensure output directory
RUN mkdir -p /app/output

ENV WEB_PORT=3001
ENV MCP_PORT=3100
ENV NODE_ENV=production

EXPOSE 3001 3100

# Start both servers
CMD ["sh", "-c", "node src/web-server.js & node src/server.js"]
