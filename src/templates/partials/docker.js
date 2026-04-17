/**
 * DOCKER PARTIAL  (src/templates/partials/docker.js)
 * Generates Dockerfile + docker-compose.yml per lang/variant.
 * docker-compose spins up the app + a matching DB service.
 */
export function dockerFiles(lang, _variant) {
  return {
    Dockerfile: dockerfile(lang, _variant),
    'docker-compose.yml': dockerCompose(lang),
    '.dockerignore': dockerIgnore(lang),
  };
}

function dockerfile(lang, _variant) {
  if (lang === 'nodejs') {
    return `# ── Build stage ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Dev stage (hot-reload) ────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE <%= port %>
CMD ["npm", "run", "dev"]

# ── Production stage (minimal image) ─────────────────────────────
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE <%= port %>
USER node
CMD ["node", "src/index.js"]
`;
  }
  if (lang === 'python') {
    return `FROM python:3.12-slim
WORKDIR /app

# Install deps first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE <%= port %>
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "<%= port %>"]
`;
  }
  if (lang === 'go') {
    return `# ── Build stage ──────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# ── Runtime stage (distroless) ────────────────────────────────────
FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE <%= port %>
ENTRYPOINT ["./server"]
`;
  }
  return '';
}

function dockerCompose(lang) {
  return `version: "3.9"

services:
  app:
    build:
      context: .
      target: ${lang === 'nodejs' ? 'dev' : 'prod'}
    restart: unless-stopped
    ports:
      - "\${PORT:-3000}:\${PORT:-3000}"
    env_file: .env
    depends_on:
      - db
    volumes:
      - .:/app
      ${lang === 'nodejs' ? '- /app/node_modules' : ''}
<% /* db service injected per selection — see docker.js partial */ %>
`;
}

function dockerIgnore(lang) {
  const extras =
    {
      nodejs: '\nnode_modules/',
      python: '\n__pycache__/\n*.pyc\nvenv/',
    }[lang] || '\n*.exe';
  return `.env${extras}
dist/
build/
*.log
.git/
.DS_Store
`;
}
