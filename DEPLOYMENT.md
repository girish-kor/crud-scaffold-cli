# Deployment Guide

Complete guide to deploy CRUD Scaffold CLI to GitHub and npm.

## Prerequisites

- GitHub account with repository created
- npm account (https://www.npmjs.com/signup)
- Git installed and configured
- All tests passing (`npm run build`)

## Step 1: Setup GitHub Repository

### Initialize Repository

```bash
cd crud-scaffold-cli
git init
git add .
git commit -m "Initial commit: CRUD Scaffold CLI v1.0.0"
```

### Add Remote

```bash
# Using HTTPS
git remote add origin https://github.com/girish-kor/crud-scaffold-cli.git

# Or using SSH
git remote add origin git@github.com:girish-kor/crud-scaffold-cli.git
```

### Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Step 2: Configure GitHub

### Enable Workflows

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Actions** → **General**
3. Under "Actions permissions", select "Allow all actions and reusable workflows"
4. Save

### Create Personal Access Token (for npm publishing)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `NPM_TOKEN`
4. Select scopes: `write:packages`, `read:packages`
5. Generate and copy token

### Add Secrets to Repository

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add these secrets:

```
NPM_TOKEN=your-npm-token-here
GITHUB_TOKEN=automatically-provided
```

### Setup npm Token

1. Get your npm auth token:
   ```bash
   npm login
   cat ~/.npmrc  # Copy your token
   ```
2. Or generate one at https://www.npmjs.com/settings/~/tokens

## Step 3: Configure package.json

Ensure package.json is properly configured:

```json
{
  "name": "crud-scaffold-cli",
  "version": "1.0.0",
  "description": "Modular, pluggable CRUD scaffolding CLI",
  "keywords": [
    "crud",
    "scaffold",
    "cli",
    "generator",
    "nodejs",
    "python",
    "go"
  ],
  "homepage": "https://github.com/girish-kor/crud-scaffold-cli",
  "bugs": {
    "url": "https://github.com/girish-kor/crud-scaffold-cli/issues",
    "email": "support@example.com"
  },
  "license": "MIT",
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/girish-kor/crud-scaffold-cli.git"
  },
  "main": "src/cli.js",
  "bin": {
    "crud-scaffold": "./src/cli.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## Step 4: Prepare Release

### Update Version

Update version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

### Update CHANGELOG

Add entry to `CHANGELOG.md`:

```markdown
## [1.0.0] - 2026-04-17

### Added
- Initial public release
- Multi-language support
- Framework variants support
- Database integration
```

### Commit Changes

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

## Step 5: Create GitHub Release

### Manually Create Release

1. Go to your repository
2. Click **Releases** → **Draft a new release**
3. Fill in:
   - Tag: `v1.0.0`
   - Title: `Release v1.0.0`
   - Description: Copy from CHANGELOG
4. Click **Publish release**

### Or Using GitHub CLI

```bash
gh release create v1.0.0 \
  --title "Release v1.0.0" \
  --notes "See CHANGELOG.md for details"
```

## Step 6: Publish to npm

### Manual Publishing

```bash
# Login to npm
npm login

# Publish
npm publish

# Verify
npm info crud-scaffold-cli
```

### Automated Publishing (via GitHub Actions)

Publishing happens automatically when:
1. Release is published on GitHub
2. `publish.yml` workflow triggers
3. Package is built and tested
4. Published to npm registry

### Verify Publication

```bash
# Check npm registry
npm view crud-scaffold-cli

# Install globally
npm install -g crud-scaffold-cli

# Test
crud-scaffold --version
```

## Step 7: Post-Release

### Announce Release

1. **GitHub Discussions**: Create a post about the release
2. **Social Media**: Share the release link
3. **Project Wiki**: Update documentation links
4. **Email**: Notify subscribers (if applicable)

### Monitor Downloads

Track npm downloads:
```bash
npm view crud-scaffold-cli > /dev/null && npm view crud-scaffold-cli downloads
```

Or visit: https://www.npmjs.com/package/crud-scaffold-cli

## Automated Release Process

### Setup Auto-Release

The `auto-release.yml` workflow automatically:
1. Detects version changes in `package.json`
2. Creates a GitHub release
3. Publishes to npm

To trigger:
1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Create pull request
4. Merge to main
5. Release is created automatically

## GitHub Actions Workflows

### CI Workflow (`ci.yml`)
- Runs on push/PR to main/develop
- Tests on Node 18.x, 20.x
- Runs linter, formatter, tests
- Tests all scaffolding templates

**Status Badge:**
```markdown
![CI](https://github.com/girish-kor/crud-scaffold-cli/workflows/CI/badge.svg)
```

### Publish Workflow (`publish.yml`)
- Triggers on release
- Publishes to npm
- Sets `NPM_TOKEN` environment variable

### Security Scan (`codeql.yml`)
- Weekly security analysis
- npm audit checks
- CodeQL scanning

### Auto-Release Workflow (`auto-release.yml`)
- Monitors version changes
- Creates releases automatically
- Triggers publish workflow

## Troubleshooting

### npm Login Issues

```bash
# Check credentials
npm whoami

# Re-login
npm logout
npm login

# Verify token
cat ~/.npmrc
```

### Publishing Fails

```bash
# Check npm connectivity
npm ping

# Clear cache
npm cache clean --force

# Try again
npm publish
```

### GitHub Actions Failing

1. Check workflow logs: **Actions** tab → workflow → run
2. Verify secrets are set correctly
3. Ensure all tests pass locally
4. Review error messages in logs

### Version Already Published

```bash
# You must increment version to publish again
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

## Security Best Practices

1. **Protect Main Branch**
   - Settings → Branches → Add rule
   - Require status checks before merge
   - Require pull request reviews

2. **Dependabot Integration**
   - Enables automatic dependency updates
   - Creates security patches automatically
   - See `.github/dependabot.yml`

3. **Secret Management**
   - Never commit secrets
   - Use GitHub repository secrets
   - Rotate npm tokens regularly

4. **Code Signing** (Optional)
   ```bash
   git config user.signingkey YOUR_GPG_KEY
   git commit -S -m "message"
   ```

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor GitHub Issues
- Check security alerts
- Review pull requests

**Monthly:**
- Update dependencies (via Dependabot)
- Review metrics and downloads
- Update documentation if needed

**Quarterly:**
- Plan feature releases
- Security audit
- Performance review

## Documentation

- **README.md**: Project overview and quick start
- **INSTALL.md**: Installation instructions
- **CONTRIBUTING.md**: Contributing guidelines
- **SECURITY.md**: Security policy
- **AUTO-UPDATE.md**: Auto-update instructions
- **CHANGELOG.md**: Release history

## Support

- 📧 Email: support@example.com
- 💬 GitHub Issues: For bug reports
- 📖 Wiki: For documentation
- 🐛 Security: See SECURITY.md

---

**Your project is now ready for production! 🚀**
