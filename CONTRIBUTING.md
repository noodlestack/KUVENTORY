# Contributing to Kuventory

Thank you for your interest in contributing to Kuventory! This document outlines the development workflow and coding standards to ensure a clean, maintainable, and robust codebase.

## 1. Branching Strategy
We follow a standard Git Flow branching model:
- `main`: The production-ready state. Commits here automatically deploy to GitHub Pages.
- `develop`: The primary integration branch.
- Feature branches should stem from `develop` and follow the naming convention `feature/your-feature-name`.
- Bugfix branches should follow `bugfix/issue-description`.

## 2. Coding Standards
### TypeScript
- **Strict Typing**: Avoid the use of `any`. Define interfaces or types for all data structures in `src/types/`.
- **Enums vs Unions**: Prefer union types (`type Status = "Pending" | "Completed"`) over Enums for simplicity, unless iterating is necessary.

### React & Components
- **Functional Components**: Use functional components with hooks. Do not use class components.
- **Single Responsibility**: Components should do one thing well. If a component grows beyond 200 lines, consider breaking it into smaller sub-components.
- **Memoization**: If developing a rendering-heavy component (like a large data table), wrap the export in `React.memo` to prevent unnecessary re-renders.

### Styling
- Use **Tailwind CSS** utility classes for styling.
- Avoid writing custom CSS in `.css` files unless defining root CSS variables.
- Use the `shadcn/ui` provided `cn()` utility function (via `tailwind-merge` and `clsx`) for dynamic class merging.

## 3. Pull Request Process
1. Ensure you have run `npm run typecheck` and `npm run lint` locally, and that no errors are present.
2. Build the project locally (`npm run build`) to ensure the production bundler succeeds.
3. Open a Pull Request targeting the `develop` branch.
4. Request a review from a senior maintainer.

## 4. Documentation
If your feature introduces new workflows, architectural changes, or UI paradigms, you **must** update the relevant documentation in the `/docs` directory as part of your PR.
