# Agent Guidelines for OpenAds

## Build/Test Commands
- **Install**: `bun install`
- **Dev**: `bun run dev` (runs all apps) or `bunx turbo dev --filter=@openads/app` (single app)
- **Build**: `bun run build`
- **Lint**: `bun run lint` (oxlint via @dirstack/kodeks)
- **Format**: `bun run format` (oxfmt via @dirstack/kodeks)
- **Test**: No tests exist yet; when added, use Vitest with `*.test.ts` files colocated with source
- **Database**: `bun run db:generate`, `db:migrate`, `db:push`, `db:reset`, `db:studio`

## Code Style Guidelines
- **TypeScript**: Required everywhere; strict mode enabled
- **Formatting**: oxfmt (2 spaces, 100 line width, double quotes, no semicolons, trailing commas, arrow parens avoided)
- **Imports**: Sorted by oxfmt; use absolute paths (`~/` for app src, `@openads/*` for packages)
- **Naming**: PascalCase for React components, `use-` prefix for hooks, camelCase for utilities
- **Types**: Use `@t3-oss/env-core` for env vars; prefer explicit types over `any`
- **Error Handling**: Use try/catch for async operations; throw descriptive errors
- **React**: Functional components with hooks; avoid default exports; use TypeScript FC types
- **API**: tRPC procedures with Zod schemas; workspace/zone procedures for auth checks
- **Commits**: Conventional commits enforced by commitlint (e.g. `feat:`, `fix:`, `chore:`)

## Development Workflow
- Lefthook git hooks run automatically on commit: oxlint, oxfmt (pre-commit), commitlint (commit-msg)
- Test changes with `bun run dev` or `bunx turbo dev --filter=<package>`
- For schema changes: `bun run db:generate` then `db:migrate`
