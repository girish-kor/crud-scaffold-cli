# Auto-Update Guide

## Automatic Updates

CRUD Scaffold CLI can check for updates automatically or on-demand.

### Checking for Updates

#### Manual Check
```bash
npm outdated -g crud-scaffold-cli
```

#### Global Version Check
```bash
crud-scaffold --version
npm view crud-scaffold-cli version
```

### Automatic Updates

#### Using a Tool

**npm-check-updates**
```bash
npm install -g npm-check-updates
ncu -g --upgrade  # Updates all global packages

# Or just CRUD Scaffold CLI
npm update -g crud-scaffold-cli
```

**npm-up**
```bash
npm install -g npm-up
npm-up -g  # Interactive update tool
```

### Scheduled Updates (for local projects)

Add to package.json:
```json
{
  "scripts": {
    "update:check": "npm outdated",
    "update": "npm update",
    "update:crud-scaffold": "npm update crud-scaffold-cli"
  }
}
```

Add to cron (Linux/macOS):
```bash
# Update daily at 6 AM
0 6 * * * cd /path/to/project && npm update

# Or use a scheduled task
chmod +x update-deps.sh
# Add to crontab -e
```

### Docker-Based Auto-Update

Create a Dockerfile with auto-update capability:

```dockerfile
FROM node:20-alpine

# Install CRUD Scaffold CLI
RUN npm install -g crud-scaffold-cli

# Create version check script
RUN mkdir -p /app
WORKDIR /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["crud-scaffold", "--help"]
```

Create `entrypoint.sh`:
```bash
#!/bin/sh

# Check for updates on container start
npm update -g crud-scaffold-cli 2>/dev/null || true

# Run the CLI
exec "$@"
```

### GitHub Actions Auto-Update

Add workflow to automatically update dependencies:

```yaml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - run: npm update
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore(deps): update dependencies'
          title: 'Automated dependency updates'
          branch: 'auto-update-deps'
```

## Disabling Auto-Updates

### Freeze to Specific Version

```bash
# Install specific version
npm install -g crud-scaffold-cli@1.0.0

# Prevent updates
npm config set save-exact true
```

### Lock Version in package.json

```json
{
  "dependencies": {
    "crud-scaffold-cli": "1.0.0"  // Exact version, no ^ or ~
  }
}
```

## Update Notifications

### Enable npm Notifications

```bash
npm config set audit true
npm config set fund true
```

### Custom Update Check

Create a script to check for updates:

```javascript
// check-updates.js
import { exec } from 'child_process';
import pkg from './package.json' assert { type: 'json' };

const current = pkg.version;
exec('npm view crud-scaffold-cli version', (err, latest) => {
  if (err) {
    console.error('Failed to check for updates');
    return;
  }
  
  if (latest.trim() !== current) {
    console.log(`✨ New version available: ${latest.trim()}`);
    console.log(`   Update with: npm install -g crud-scaffold-cli`);
  } else {
    console.log('✅ You are using the latest version');
  }
});
```

Run: `node check-updates.js`

## Beta/Pre-release Updates

### Install Pre-release Versions

```bash
npm install -g crud-scaffold-cli@next  # Latest pre-release
npm install -g crud-scaffold-cli@beta   # Beta versions
npm install -g crud-scaffold-cli@1.1.0-rc.1  # Specific pre-release
```

### Install Development Version

```bash
npm install -g github:girish-kor/crud-scaffold-cli#main
```

## Rollback to Previous Version

If an update causes issues:

```bash
# View version history
npm view crud-scaffold-cli versions

# Install previous version
npm install -g crud-scaffold-cli@1.0.0

# Or uninstall and reinstall
npm uninstall -g crud-scaffold-cli
npm install -g crud-scaffold-cli@1.0.0
```

## Semantic Versioning

CRUD Scaffold CLI follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes - review before updating
- **Minor** (1.1.0): New features - safe to update
- **Patch** (1.0.1): Bug fixes - recommended to update

Update strategies:
```bash
# Auto-update patch versions only (safest)
npm install -g "crud-scaffold-cli@~1.0.0"

# Auto-update minor and patch (recommended)
npm install -g "crud-scaffold-cli@^1.0.0"

# Always latest (may include breaking changes)
npm install -g crud-scaffold-cli
```

## Troubleshooting Updates

### Update Fails

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install -g crud-scaffold-cli@latest
```

### Version Mismatch

```bash
# Verify installed version
crud-scaffold --version

# Reinstall
npm uninstall -g crud-scaffold-cli
npm install -g crud-scaffold-cli
```

### Global vs Local Conflicts

```bash
# Check where cli is installed
which crud-scaffold

# Uninstall local if global is intended
npm uninstall crud-scaffold-cli  # local
npm install -g crud-scaffold-cli  # global
```

---

**Stay updated for the latest features and security patches! 🚀**
