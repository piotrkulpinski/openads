# Agent Guidelines for OpenAds

## Build/Test Commands
- **Install**: `npm install`
- **Dev**: `npm run dev` (runs all apps) or `npm run dev --filter=@openads/app` (single app)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (Biome check + fix)
- **Format**: `npm run format` (Biome format)
- **Test**: No tests exist yet; when added, use Vitest with `*.test.ts` files colocated with source
- **Database**: `npm run db:generate`, `db:migrate`, `db:push`, `db:reset`, `db:studio`

## Code Style Guidelines
- **TypeScript**: Required everywhere; strict mode enabled
- **Formatting**: Biome (2 spaces, 100 line width, double quotes, trailing commas, semicolons as needed)
- **Imports**: Organize with Biome; use absolute paths (`~/` for app src, `@openads/*` for packages)
- **Naming**: PascalCase for React components, `use-` prefix for hooks, camelCase for utilities
- **Types**: Use `@t3-oss/env-core` for env vars; prefer explicit types over `any`
- **Error Handling**: Use try/catch for async operations; throw descriptive errors
- **React**: Functional components with hooks; avoid default exports; use TypeScript FC types
- **API**: tRPC procedures with Zod schemas; workspace/zone procedures for auth checks

## Development Workflow
- Run `npm run lint` before commits
- Test changes with `npm run dev --filter=<package>`
- For schema changes: `npm run db:generate` then `db:migrate`
- No Cursor rules or Copilot instructions found
