# Installation Guide

Complete installation instructions for CRUD Scaffold CLI.

## System Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Operating System**: Windows, macOS, Linux
- **Disk Space**: ~100MB for installation + generated projects

## Installation Methods

### 1. Global Installation (Recommended)

Install globally to use the `crud-scaffold` command anywhere:

```bash
npm install -g crud-scaffold-cli
```

Verify installation:
```bash
crud-scaffold --version
# Output: 1.0.0
```

### 2. Local/Project Installation

Install as a project dependency:

```bash
cd your-project
npm install crud-scaffold-cli
```

Run with npx:
```bash
npx crud-scaffold --help
```

Or add to package.json scripts:
```json
{
  "scripts": {
    "scaffold": "crud-scaffold"
  }
}
```

Then run:
```bash
npm run scaffold
```

### 3. Development Installation

For development or contributing:

```bash
git clone https://github.com/girish-kor/crud-scaffold-cli.git
cd crud-scaffold-cli
npm install
npm run dev -- --help
```

## Upgrading

### From npm

Check for updates:
```bash
npm outdated -g crud-scaffold-cli
```

Update to latest version:
```bash
npm update -g crud-scaffold-cli
```

Update to a specific version:
```bash
npm install -g crud-scaffold-cli@2.0.0
```

### From Source

Pull latest changes and reinstall:
```bash
cd crud-scaffold-cli
git pull origin main
npm install
npm run build
```

## Uninstall

### Global Uninstall
```bash
npm uninstall -g crud-scaffold-cli
```

### Local Uninstall
```bash
npm uninstall crud-scaffold-cli
```

## Troubleshooting

### Command not found

If you get "command not found: crud-scaffold":

1. Verify npm is in your PATH:
   ```bash
   npm --version
   ```

2. Check npm global directory:
   ```bash
   npm config get prefix
   ```

3. Add npm's bin directory to PATH (if needed)

### Permission denied

On Linux/macOS, if you get "Permission denied":

```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g crud-scaffold-cli

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g crud-scaffold-cli
```

### Module not found

Clear npm cache and reinstall:
```bash
npm cache clean --force
npm install -g crud-scaffold-cli
```

### Version conflicts

If you have multiple Node.js versions installed, use nvm:

```bash
# Install nvm (https://github.com/nvm-sh/nvm)
nvm install 20
nvm use 20
npm install -g crud-scaffold-cli
```

## Platform-Specific Notes

### Windows

- Use PowerShell or Git Bash (not cmd.exe if possible)
- May need to run as Administrator for global installation
- Use `-g` flag for global installation

### macOS

- Homebrew users can install Node.js:
  ```bash
  brew install node
  ```
- Intel and Apple Silicon (M1/M2) both supported

### Linux

- Use your package manager:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install nodejs npm

  # Fedora/Red Hat
  sudo dnf install nodejs npm

  # Arch
  sudo pacman -S nodejs npm
  ```

## Docker Installation

Use Docker to avoid local Node.js installation:

```bash
docker pull node:20-alpine
docker run -it --rm -v $(pwd):/app node:20-alpine npm install -g crud-scaffold-cli
docker run -it --rm -v $(pwd):/app node:20-alpine crud-scaffold --help
```

## Verification

After installation, verify everything works:

```bash
# Check version
crud-scaffold --version

# View help
crud-scaffold --help

# Test scaffolding (non-interactive mode)
crud-scaffold \
  --name test-project \
  --lang nodejs \
  --variant express \
  --db postgresql \
  --no-install

# Navigate and verify
cd test-project
ls -la
```

## Next Steps

After successful installation:

1. Read the [README.md](../README.md) for overview
2. Try the [Quick Start guide](../README.md#quick-start)
3. Check out [examples](../examples) if available
4. Review [Contributing guidelines](../CONTRIBUTING.md) if you want to contribute

## Support

Having issues? 

- 📖 Check the [README](../README.md)
- 🐛 Search [existing issues](https://github.com/girish-kor/crud-scaffold-cli/issues)
- 💬 Open a [new issue](https://github.com/girish-kor/crud-scaffold-cli/issues/new)
- 📧 Email: support@example.com

---

**Happy scaffolding! 🚀**
