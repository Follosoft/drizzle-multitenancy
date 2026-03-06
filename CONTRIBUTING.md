# Contributing

Contributions are welcome and will be fully credited.

We accept contributions via pull requests on [GitHub](https://github.com/Follosoft/drizzle-multitenancy).

## Etiquette

This project is open source, and maintainers give their free time to build and maintain it. Please be respectful and constructive in all interactions.

## Viability

Before proposing a feature, consider whether it would be useful to other developers. Open source projects serve many users with different needs — not every feature belongs in the core package.

## Before Submitting

- Check existing [issues](https://github.com/Follosoft/drizzle-multitenancy/issues) and [pull requests](https://github.com/Follosoft/drizzle-multitenancy/pulls) to avoid duplicates
- For bugs, confirm you can reproduce the problem
- For features, open an issue first to discuss the approach

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Install dependencies: `npm install`
3. Make your changes
4. Write or update tests — **pull requests without tests will not be accepted**
5. Update the README if you're changing public API
6. Ensure everything passes:
   ```bash
   npm run build
   npm test
   ```
7. One feature or fix per pull request — send separate PRs for separate changes
8. Write meaningful commit messages following [conventional commits](https://www.conventionalcommits.org/)
9. Submit your pull request and fill in the PR template

## Coding Standards

- **TypeScript strict mode** — no `any` leaks, no implicit types at boundaries
- **Factory functions over classes** — use the `createXxx()` pattern
- **Explicit context** — pass `TenantContext` as argument, never use global state
- **Provider-agnostic** — core code uses `DrizzleDatabase`, never a specific driver type
- **All exports through `src/index.ts`** — no deep imports from internal paths
- **Semantic versioning** — follow [SemVer v2.0.0](https://semver.org/) and do not break the public API in patches

## Adding a Database Provider

Providers are the primary way the community can extend this package.

1. Create `src/providers/your-provider.ts`
2. Export a `DatabaseClientFactory` function following the existing `neonClientFactory` pattern
3. Add the export to `src/index.ts`
4. Add a test in `tests/`
5. Document it in the README under "Database Providers"
6. Add the driver as an optional peer dependency in `package.json`

## Adding a Tenant Finder

1. Create `src/finders/your-finder.ts`
2. Implement the `TenantFinder` interface
3. Export a `createXxxFinder()` factory
4. Add the export to `src/index.ts`
5. Add tests in `tests/`

## Testing

- All tests use [Vitest](https://vitest.dev/)
- Use the helpers in `tests/helpers.ts` (`makeTenant()`, `fakeLandlordDb()`, `spyTask()`, etc.)
- No real database needed for unit tests
- Run tests: `npm test`
- Watch mode: `npm run test:watch`

## Questions?

Open an issue on GitHub. We're happy to help.

Happy coding!
