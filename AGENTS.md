# Repository Guidelines

## Project Structure & Module Organization
This repository is currently empty. When initializing it, use a simple, predictable layout:
- `src/` for application or library code.
- `tests/` for automated tests, mirroring `src/` paths.
- `scripts/` for developer tooling and one-off tasks.
- `docs/` for design notes and ADRs.
- `assets/` for static files (images, fixtures).

Keep features isolated in their own folders and expose entry points via `src/index.*` (or a language-appropriate equivalent).

## Build, Test, and Development Commands
No build or test tooling is configured yet. Once tools are chosen, document the exact commands here and in `README.md`. Example patterns (replace with real commands):
- `npm run build` or `make build` for production builds.
- `npm test` or `pytest` for tests.
- `npm run lint` or `make lint` for style checks.

## Coding Style & Naming Conventions
Until a language-specific formatter is adopted, use consistent conventions:
- Indentation: 2 spaces for config/markup; follow language defaults for code.
- Files and directories: `kebab-case` (e.g., `user-profile/`, `api-client.ts`).
- Types/classes: `PascalCase`; functions/variables: `camelCase`; constants: `UPPER_SNAKE_CASE`.
Adopt an auto-formatter and linter early, and treat them as the source of truth.

## Testing Guidelines
Place tests in `tests/` and name them with a clear suffix such as `*.spec.*` or `*_test.*`. Cover new features and bug fixes with focused tests, and document any intentionally untested paths in the PR description.

## Commit & Pull Request Guidelines
There is no Git history yet, so use Conventional Commits (e.g., `feat: add parser`, `fix: handle empty input`). PRs should include:
- A short summary and rationale.
- Linked issues (if any).
- Test results or a note explaining why tests were not run.

## Configuration & Secrets
Store local configuration in `.env.local` or similar files and add them to `.gitignore`. Never commit secrets or credentials.
