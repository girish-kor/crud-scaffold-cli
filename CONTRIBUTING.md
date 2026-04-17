# Contributing to CRUD Scaffold CLI

First off, thank you for considering contributing to CRUD Scaffold CLI! It's people like you that make CRUD Scaffold such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**
* **Include your environment details** (OS, Node.js version, npm version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the JavaScript/Node.js styleguides
* Document new code based on the Documentation Styleguide
* End all files with a newline
* Avoid platform-dependent code

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
  * 🎨 `:art:` - Improve structure/format
  * 🐛 `:bug:` - Fix bug
  * 📚 `:books:` - Documentation
  * ✨ `:sparkles:` - New feature
  * 🔄 `:recycle:` - Refactor
  * ✅ `:white_check_mark:` - Tests
  * 📦 `:package:` - Dependencies
  * 🚀 `:rocket:` - Performance
  * 🔒 `:lock:` - Security

### JavaScript Styleguide

All JavaScript must adhere to the [Airbnb Style Guide](https://github.com/airbnb/javascript).

* Use `const` for all of your references; avoid using `var`
* Use ES6 modules (`import`/`export`)
* Use template strings instead of string concatenation
* Use arrow functions for callbacks

### Documentation Styleguide

* Use [Markdown](https://daringfireball.net/projects/markdown)
* Reference methods and classes in markdown with the custom `{}` notation:
  * Reference classes with `{ClassName}`
  * Reference methods with `{ClassName.methodName}`

## Development Setup

### Prerequisites

* Node.js >= 18.0.0
* npm >= 9.0.0
* Git

### Local Development

1. **Fork the repository**
   ```bash
   git clone https://github.com/girish-kor/crud-scaffold-cli.git
   cd crud-scaffold-cli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

4. **Make your changes**
   ```bash
   # Edit files...
   ```

5. **Check code quality**
   ```bash
   npm run lint          # Run ESLint
   npm run format:check  # Check Prettier formatting
   ```

6. **Fix issues automatically**
   ```bash
   npm run validate      # Fixes ESLint and formats code
   ```

7. **Run the build**
   ```bash
   npm run build         # Final check
   ```

8. **Test your changes**
   ```bash
   npm run dev -- --name test-project --lang nodejs --variant express --db postgresql --no-install
   ```

9. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feat/your-feature-name
   ```

10. **Create a Pull Request**
    - Go to the repository on GitHub
    - Click "New Pull Request"
    - Select your branch and fill in the template

## Testing

When adding features that affect template generation:

1. Test with all supported languages
   ```bash
   npm run dev -- --name test-node --lang nodejs --variant express --db postgresql --no-install
   npm run dev -- --name test-python --lang python --variant fastapi --db postgresql --no-install
   npm run dev -- --name test-go --lang go --variant gin --db postgresql --no-install
   ```

2. Test with different options
   ```bash
   npm run dev -- --name test-auth --lang nodejs --variant express --db postgresql --auth --no-install
   npm run dev -- --name test-docker --lang nodejs --variant express --db postgresql --docker --no-install
   ```

3. Verify generated projects work
   ```bash
   cd test-node
   npm install
   npm run dev  # Should start without errors
   ```

## Adding a New Template

To add support for a new framework or language:

1. **Create the adapter file**
   ```bash
   touch src/templates/[lang]/[framework].js
   ```

2. **Implement the adapter**
   ```javascript
   // Export an async function that returns a manifest
   export async function adapterName(config) {
     return {
       files: {
         // Map of file paths to content
       },
       installCommand: 'npm install', // or pip install, go mod download
       defaultPort: 3000,
     };
   }
   ```

3. **Register in registry**
   ```javascript
   // src/templates/registry.js
   import { adapterName } from './[lang]/[framework].js';

   export const TEMPLATE_ADAPTERS = {
     [lang]: {
       [framework]: adapterName,
     },
   };
   ```

4. **Add to SUPPORTED_LANGUAGES**
   ```javascript
   export const SUPPORTED_LANGUAGES = {
     [lang]: {
       label: 'Language Name',
       variants: ['framework1', 'framework2'],
       defaultVariant: 'framework1',
       defaultDb: 'postgresql',
     },
   };
   ```

5. **Test thoroughly**
   ```bash
   npm run build  # Should pass
   npm run dev -- --name test --lang [lang] --variant [framework] --db postgresql --no-install
   ```

## Questions?

Feel free to open an issue or reach out to maintainers. We're here to help!

---

Thank you for contributing! 🎉
