name: Bug Report
description: Report a bug in CRUD Scaffold CLI
labels: [bug]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide as much detail as possible.

  - type: input
    id: title
    attributes:
      label: Title
      description: Brief description of the bug
      placeholder: CLI crashes when using --auth flag
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Detailed description of the bug
      placeholder: |
        The CLI seems to crash with the following error...
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Exact steps to reproduce the issue
      placeholder: |
        1. Run `npm install -g crud-scaffold-cli`
        2. Execute `crud-scaffold --name test --lang nodejs --variant express --db postgresql --auth`
        3. Observe the error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should have happened?
      placeholder: The project should be scaffolded with authentication enabled
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened?
      placeholder: The CLI crashed with error message...
    validations:
      required: true

  - type: textarea
    id: error
    attributes:
      label: Error Output
      description: Full error message or stack trace (if available)
      render: bash
      placeholder: |
        Error: Cannot find module...
        at Function.Module._resolveFilename...

  - type: dropdown
    id: os
    attributes:
      label: Operating System
      options:
        - Windows
        - macOS
        - Linux
        - Other
    validations:
      required: true

  - type: input
    id: node-version
    attributes:
      label: Node.js Version
      description: Output of `node --version`
      placeholder: v20.0.0
    validations:
      required: true

  - type: input
    id: npm-version
    attributes:
      label: npm Version
      description: Output of `npm --version`
      placeholder: 10.0.0
    validations:
      required: true

  - type: input
    id: cli-version
    attributes:
      label: CRUD Scaffold CLI Version
      description: Output of `crud-scaffold --version`
      placeholder: 1.0.0
    validations:
      required: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other context that might help
      placeholder: This happens when using Docker...
