name: Feature Request
description: Suggest a new feature for CRUD Scaffold CLI
labels: [enhancement]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting a feature! We appreciate your ideas to make CRUD Scaffold CLI better.

  - type: input
    id: title
    attributes:
      label: Title
      description: Brief description of the feature
      placeholder: Add TypeScript support
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Detailed description of the proposed feature
      placeholder: |
        It would be great if CRUD Scaffold CLI could generate TypeScript projects
        instead of just JavaScript...
    validations:
      required: true

  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why would this feature be useful?
      placeholder: |
        Many modern projects use TypeScript for better type safety and developer
        experience. This would help developers quickly scaffold TypeScript projects...
    validations:
      required: true

  - type: textarea
    id: examples
    attributes:
      label: Examples
      description: Show examples of how this feature would be used
      placeholder: |
        ```bash
        crud-scaffold --name my-api --lang nodejs --typescript --variant express
        ```
        
        This would generate a TypeScript-based Express project with proper
        tsconfig.json and build scripts...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      description: Are there any alternative approaches?
      placeholder: Users could manually set up TypeScript, but having it built-in would be more convenient...

  - type: input
    id: similar
    attributes:
      label: Related Issues
      description: Are there any existing issues related to this?
      placeholder: Closes #123

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other context
      placeholder: This would complement the existing JavaScript/Python/Go support...
