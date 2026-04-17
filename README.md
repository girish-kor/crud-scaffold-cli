# CRUD Scaffold CLI

> 🚀 Production-grade CRUD application scaffolder. Generate fully structured, database-ready projects in seconds.

[![npm version](https://img.shields.io/npm/v/crud-scaffold-cli.svg?style=flat)](https://www.npmjs.com/package/crud-scaffold-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Build Status](https://github.com/girish-kor/crud-scaffold-cli/workflows/CI/badge.svg)](https://github.com/girish-kor/crud-scaffold-cli/actions)

## Features

✨ **Multi-Language Support**
- Node.js (Express, Fastify)
- Python (FastAPI)
- Go (Gin)

🗄️ **Database Integration**
- PostgreSQL
- MongoDB
- SQLite

🔐 **Optional Modules**
- JWT Authentication with register/login routes
- Docker & docker-compose setup
- Test scaffolding (Jest for Node.js)

🎯 **Interactive & Flag-Based**
- Interactive prompts for guided setup
- Command-line flags for CI/CD automation
- Skip dependency installation for Docker builds

📦 **Production-Ready**
- Clean, layered architecture
- Environment configuration templates
- README generation per project
- Code formatting with Prettier
- ESLint configuration included

## Installation

### Global Installation
```bash
npm install -g crud-scaffold-cli
crud-scaffold --help
```

### Local Installation
```bash
npm install crud-scaffold-cli
npx crud-scaffold --help
```

### From Source
```bash
git clone https://github.com/girish-kor/crud-scaffold-cli.git
cd crud-scaffold-cli
npm install
npm start -- --help
```

## Quick Start

### Interactive Mode
```bash
crud-scaffold
# Follow the prompts to select language, framework, database, and optional features
```

### Automated Mode (CI/CD)
```bash
crud-scaffold \
  --name my-api \
  --lang nodejs \
  --variant express \
  --db postgresql \
  --auth \
  --docker \
  --test
```

### Flags Reference

| Flag | Description | Values |
|------|-------------|--------|
| `-n, --name` | Project directory name | string |
| `-l, --lang` | Programming language | `nodejs`, `python`, `go` |
| `-v, --variant` | Framework variant | `express`, `fastify` (Node.js); `fastapi` (Python); `gin` (Go) |
| `-d, --db` | Database | `postgresql`, `mongodb`, `sqlite` |
| `--auth` | Add JWT authentication | boolean (flag) |
| `--docker` | Add Docker & docker-compose | boolean (flag) |
| `--test` | Add test scaffolding | boolean (flag) |
| `--no-install` | Skip npm/pip/go install | boolean (flag) |

## Project Structure

The generated project includes:

### Node.js / Express
```
my-api/
├── src/
│   ├── index.js           # App entry point
│   ├── config/
│   │   └── index.js       # Configuration & environment
│   ├── routes/
│   │   └── items.js       # API routes
│   ├── controllers/
│   │   └── itemController.js
│   ├── services/
│   │   └── itemService.js
│   ├── models/
│   │   └── itemModel.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── authenticate.js (if --auth)
│   └── utils/
│       ├── response.js
│       └── logger.js
├── tests/                 # Jest test suite (if --test)
├── .env.example
├── .dockerignore           # (if --docker)
├── Dockerfile             # (if --docker)
├── docker-compose.yml     # (if --docker)
├── package.json
├── jest.config.js         # (if --test)
└── README.md
```

### Python / FastAPI
```
my-api/
├── app/
│   ├── main.py           # App entry point
│   ├── config.py         # Configuration
│   ├── database.py       # Database setup
│   ├── models/           # SQLAlchemy models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── schemas/          # Pydantic schemas
│   └── middleware/       # Request/response processing
├── .env.example
├── Dockerfile             # (if --docker)
├── docker-compose.yml     # (if --docker)
├── requirements.txt       # Python dependencies
└── README.md
```

### Go / Gin
```
my-api/
├── cmd/
│   └── server/
│       └── main.go       # App entry point
├── internal/
│   ├── config/           # Configuration
│   ├── database/         # Database setup
│   ├── handlers/         # Route handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   └── middleware/       # Gin middleware
├── .env.example
├── Dockerfile             # (if --docker)
├── docker-compose.yml     # (if --docker)
├── go.mod
├── go.sum
└── README.md
```

## After Scaffolding

1. **Navigate to your new project**
   ```bash
   cd my-api
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start development**
   ```bash
   # Node.js
   npm run dev

   # Python
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload

   # Go
   go run cmd/server/main.go
   ```

4. **With Docker**
   ```bash
   docker-compose up --build
   ```

5. **Run tests** (Node.js)
   ```bash
   npm test
   ```

## Architecture

This CLI follows a **layered architecture** with zero coupling:

### Layer 1: CLI Interface (`src/cli.js`)
- Collects user intent via flags or interactive prompts
- Validates configuration against the registry

### Layer 2: Template Resolution (`src/layers/resolver.js`)
- Maps (language, variant) → adapter
- Loads the correct template module
- Returns a manifest of files to generate

### Layer 3: File Generation (`src/layers/generator.js`)
- Applies EJS variable interpolation
- Writes files to disk with proper directory structure
- Reports progress to user

### Layer 4: Dependency Installation (`src/layers/installer.js`)
- Runs language-appropriate installers (npm, pip, go mod)
- Executes post-install setup commands

### Registry (`src/templates/registry.js`)
- Single source of truth for supported languages/frameworks
- Maps CLI selections to template adapters
- Add new frameworks without modifying core layers

## Development

### Setup
```bash
npm install
```

### Scripts
```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier formatting
npm run format:check  # Verify formatting
npm run build         # Lint + format check
npm run validate      # Fix + format (pre-commit)
npm test              # Run tests (placeholder)
```

### Running Locally
```bash
npm run dev -- --name test-project --lang nodejs --variant express --db postgresql --no-install
```

### Adding a New Framework

1. Create adapter file: `src/templates/[lang]/[framework].js`
2. Export async function matching the template interface
3. Register in `src/templates/registry.js`

Example:
```javascript
// src/templates/nodejs/hapi.js
export async function hapiAdapter(config) {
  return {
    files: {
      'package.json': { /* ... */ },
      'src/index.js': `/* Hapi server code */`,
    },
    installCommand: 'npm install',
    defaultPort: 3000,
  };
}
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md).

## Roadmap

- [ ] TypeScript template support
- [ ] GraphQL scaffolding option
- [ ] Automated API documentation generation
- [ ] Template customization/plugins system
- [ ] Multi-database relationship support
- [ ] Microservices template
- [ ] WebSocket support

## License

MIT © 2026 - See [LICENSE](LICENSE) for details

## Support

- 📖 [Full Documentation](https://github.com/girish-kor/crud-scaffold-cli/wiki)
- 🐛 [Report Issues](https://github.com/girish-kor/crud-scaffold-cli/issues)
- 💬 [Discussions](https://github.com/girish-kor/crud-scaffold-cli/discussions)
- 📧 [Email Support](mailto:support@example.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Made with ❤️ by the CRUD Scaffold Team**
