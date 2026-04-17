# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CRUD Scaffold CLI, please **do not** open a public GitHub issue. Instead, please email security@example.com with the following information:

1. **Title** - A clear, concise title for the vulnerability
2. **Description** - Detailed description of the vulnerability
3. **Steps to Reproduce** - How to reproduce the vulnerability
4. **Affected Versions** - Which versions of CRUD Scaffold CLI are affected
5. **Impact** - What is the potential impact of this vulnerability
6. **Suggested Fix** (if any) - Any recommendations for fixing the issue

We will acknowledge receipt of your vulnerability report within 48 hours and will send a more detailed response within 5 business days indicating the next steps in handling your report.

## Vulnerability Disclosure

We are committed to responsible vulnerability disclosure. Once a vulnerability is confirmed and fixed, we will:

1. Release a patch version with the fix
2. Publish a security advisory
3. Credit the reporter (unless they prefer to remain anonymous)

## Security Updates

- Subscribe to security alerts in the repository
- Enable GitHub security features to receive notifications
- Monitor the [Changelog](CHANGELOG.md) for security fixes

## Best Practices

When using CRUD Scaffold CLI:

1. **Keep Updated** - Always use the latest stable version
2. **Validate Input** - When using generated templates, validate user input on both client and server
3. **Environment Variables** - Never commit `.env` files; use `.env.example` instead
4. **Dependencies** - Regularly update project dependencies with `npm audit fix`
5. **Access Control** - Implement proper authentication and authorization in generated projects

## Supported Versions

| Version | Status | Support Until |
|---------|--------|----------------|
| 1.x     | Active | 2027-04-17    |
| 0.x     | Legacy | 2026-06-17    |

Security updates will be provided for the current major version and the previous major version for 6 months after release.

## Acknowledgments

We appreciate the security research community's efforts to keep our project secure.
