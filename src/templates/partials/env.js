/**
 * ENV PARTIAL  (src/templates/partials/env.js)
 * Generates .env.example and .gitignore for all adapters.
 */
export function envFiles(config) {
  const dbUrlMap = {
    mongodb: 'mongodb://localhost:27017/<%= projectName %>',
    postgresql: 'postgresql://user:password@localhost:5432/<%= projectName %>',
    sqlite: './<%= projectName %>.db',
  };

  const envContent = `# ── Application ──────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Database ──────────────────────────────────────────────────────
DATABASE_URL=${dbUrlMap[config.db] || ''}
DB_NAME=<%= projectName %>
DB_USER=user
DB_PASSWORD=password
<% if (includeAuth) { %>
# ── JWT ───────────────────────────────────────────────────────────
JWT_SECRET=change-this-to-a-long-random-secret-in-production
JWT_EXPIRES_IN=7d
<% } %>
`;

  return {
    '.env.example': envContent,
    '.gitignore': gitignore(),
  };
}

function gitignore() {
  return `# Runtime / build artefacts
node_modules/
__pycache__/
*.pyc
vendor/
dist/
build/

# Environment (never commit)
.env
.env.local
.env.*.local

# Editors
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/
`;
}
