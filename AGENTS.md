# Repository Guidelines

## Project Structure & Module Organization
- `apps/app` houses the Vite React client; routes live in `src/routes`, with shared hooks and utilities under `src/lib` and `src/hooks`.
- `apps/api` exposes the Hono + tRPC server; middleware is in `src/middleware`, routers are sourced from `packages/trpc`, and environment constraints come from `src/env.ts`.
- Shared libraries sit in `packages/*` (`auth`, `db`, `redis`, `stripe`, `trpc`, `ui`, `utils`). Export APIs through each package’s `src/index.ts` and keep Prisma schema work inside `packages/db/prisma`.
- Configuration and reusable TypeScript settings live in `packages/tsconfig`. Static assets reside under the relevant app `public/` directories.

## Build, Test, and Development Commands
- Install dependencies once with `bun install` (workspace-wide Bun 1.2.19, Node ≥18).
- Run both frontend and API locally via `bun run dev` (Turbo spawns package `dev` scripts). Scope with `bun run dev --filter=@openads/app` or `--filter=@openads/api` for single services.
- Produce production bundles with `bun run build`. Use `bun run lint` and `bun run format` to apply Biome fixes before submitting changes.
- Database helpers: `bun run db:migrate`, `db:push`, `db:reset`, and `db:studio` (all proxied to Prisma from `packages/db`).

## Coding Style & Naming Conventions
- Prefer TypeScript across the monorepo; React components use PascalCase files, hooks use `use-` prefixes, and utility modules stay camelCase.
- Follow Biome’s formatting and linting decisions; do not hand-format beyond what `bun biome` produces.
- Keep environment variable access typed through the `@t3-oss/env-core` wrappers (see `apps/app/src/env.ts` and `apps/api/src/env.ts`).

## Testing Guidelines
- Automated tests are not yet centralized; when adding coverage, colocate `*.test.ts` files beside the code and run them with the package’s preferred runner (Vitest is recommended; wire a `test` script if you introduce it).
- For API flows, lean on tRPC callers from `apps/app/src/lib/trpc.ts` plus integration checks against the Hono server. Document manual verification steps inside the PR when tests are absent.

## Commit & Pull Request Guidelines
- Commits in this repo use short, imperative subjects (e.g., `fix the auth type issues`, `update packages`). Mirror that tone and keep bodies concise but informative.
- PRs should describe the problem, the solution, and how to validate it. Link to tracking issues, list environment or database prerequisites, and attach screenshots or terminal output for UI-facing or schema-changing work.
- Ensure CI-critical commands (`bun run lint`, relevant builds, and migrations) succeed locally and mention any follow-up tasks explicitly.

## Security & Configuration Tips
- Copy environment templates (`apps/*/.env.example`) into `.env.local` files and never commit secrets. Align URLs so that `APP_URL`, `VITE_API_URL`, and `BETTER_AUTH_URL` agree across services.
- When editing Prisma schemas, regenerate clients with `bun run db:generate` and review resulting migrations into version control.
