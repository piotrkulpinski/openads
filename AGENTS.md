# Agent Guidelines for OpenAds

## What OpenAds is

OpenAds is a **self-serve subscription advertising platform for content publishers**. Publishers configure ad tiers and custom creative fields in the OpenAds dashboard; advertisers find the publisher's site, click a "Subscribe to advertise" widget, pay through Stripe, fill in a creative form, and wait for approval. Once approved, their ad is available via the OpenAds API for the publisher to render on their own site however they want.

**OpenAds does not render ads.** It owns: subscription billing (Stripe Connect with destination charges), advertiser onboarding, the approval queue, the weighted-rotation selection algorithm, impression/click tracking, and the embeddable tier selector. Publishers render ads themselves using a future SDK (which is **out of scope** at v1 — see deferred list below). The only embeddable surface OpenAds ships today is `/embed` (the tier selector iframe for advertiser acquisition).

The model is based on OpenAlternative's existing setup ($5k+ MRR), generalized to multi-tenant SaaS.

## Architecture at a glance

Monorepo, Bun + Turbo. Three apps and twelve packages.

**Apps**
- `apps/api` — Hono server hosting tRPC + Stripe webhooks + presigned-upload endpoints
- `apps/app` — Publisher/advertiser dashboard (TanStack Router + tRPC)
- `apps/landing` — Marketing site (TanStack Start, Cloudflare Workers)

**Packages**
- `@openads/db` — Prisma schema (`relationMode = "prisma"`, no migrations folder — uses `db:push`)
- `@openads/trpc` — Routers, procedures (`authProcedure`, `workspaceProcedure`, `connectEnabledWorkspaceProcedure`, `adProcedure`), shared serving algorithm
- `@openads/auth` — better-auth (Google OAuth)
- `@openads/stripe` — Stripe client + product/checkout/subscription helpers
- `@openads/emails` — AutoSend client + React Email v6 templates
- `@openads/s3` — S3/R2 client + favicon scraping
- `@openads/redis` — Upstash client (rate limiting, onboarding state)
- `@openads/logger` — Unified logger (see Logging section)
- `@openads/ui` — Shared component library
- `@openads/events` — Analytics (OpenPanel)
- `@openads/utils` — Onboarding constants, etc.
- `@openads/tsconfig` — Shared TS configs

## Core product decisions and rationale

These were locked in across the strategic-pivot conversations and reflect the *current* product shape. Don't deviate without checking the plan file first.

### 1. Subscription tiers, not time-based bookings
Earlier the product had time-based campaign bookings (a `Campaign` model with `startsAt`/`endsAt`). That model is **deleted**. The replacement is recurring monthly subscriptions:
- **Why**: Time-based meant chasing renewals, inventory gaps, conflicting bookings, mispricing high-traffic windows. Subscriptions give predictable MRR, no manual ops, and tiers are fungible across publishers — prerequisite for a future ad network.
- **Proof**: OpenAlternative runs this model successfully ($5k MRR, ~1mo–1yr+ retention per advertiser).

### 2. Tiers are workspace-global, not zone-scoped
There is no `Zone` model. Earlier iterations tied Tiers to Zones; that was simplified.
- **Why**: Publishers think in "what tier am I selling?" not "what zone am I selling in?" Mirrors OpenAlternative. Easier to standardize across the network later (`Silver`/`Gold`/`Platinum` weight bands become portable).
- **Where placement lives**: Entirely on the publisher's side. They call the (future) SDK with `weight >= 2.5` for premium positions, anything for regular cards. OpenAds doesn't have a placement concept.

### 3. Custom fields are the creative model
The `Ad` model has **two fixed fields** (`name`, `websiteUrl`) plus a `Meta` array. Everything else — taglines, banner images, button labels, discount codes — is publisher-defined via the workspace's `Field` table.
- **Why fixed `name`**: Needed for emails ("Your ad 'Acme' was approved"), admin queue display, internal identification.
- **Why fixed `websiteUrl`**: Click destination is universal. Also used by the auto-favicon scraper. Without it, every publisher would have to teach their advertisers what a "URL field" is.
- **Why everything else is custom**: Different publishers need different creative shapes. OpenAds doesn't know whether you need a banner image, a tagline, a discount code, or all three. Publishers define it.
- **Field types**: `Text`, `Textarea`, `Url`, `Number`, `Switch`, `Image` (S3-backed upload).

### 4. Stripe Connect with destination charges (not direct charges)
Subscriptions live on the **platform** Stripe account; funds transfer to the publisher's Connect account via `transfer_data.destination`; OpenAds takes `application_fee_percent`.
- **Why**: Best fit for the future ad network (advertisers see "OpenAds" as merchant of record, consistent across publishers). Single config knob for the platform fee. OpenAds handles disputes — acceptable at low volume.

### 5. Approval gating is decoupled from Stripe status
An ad serves only if **both** `Ad.status = Approved` AND `Subscription.status ∈ (Active, Trialing)`.
- **Why**: A paid subscription with violating creative shouldn't serve. An admin-approved creative shouldn't serve if payment lapses. Two concerns, two flags.

### 6. Tier deletion is soft, not hard
`tier.delete` archives the Stripe Product, flips `Tier.isActive = false`, and archives every active `TierPrice` (Stripe Price + `isActive = false`). Live subscriptions stay billable.
- **Why**: Hard-deleting a Tier would orphan in-flight subscriptions. Publishers should be able to retire a tier without breaking existing advertisers.

### 7. Only one embeddable iframe: `/embed` (the tier selector)
- **Why**: Publishers render ads themselves. We don't want to maintain a rendering iframe in parallel with the future SDK. The tier selector stays because it's a self-contained "Subscribe to advertise" widget that publishers can drop on any page.

### 8. House ads are out of scope
When there are no eligible approved ads, the API returns an empty list. The publisher's renderer handles the empty state.
- **Why**: Keeps OpenAds focused on the marketplace side. Publishers who want self-promotion can serve their own thing from their own code.

### 9. Workspace-defined pricing, no platform-imposed tiers
Publishers create as many Tiers as they like, with any weight and any price.
- **Why**: Each publisher's audience is different. Forcing Silver/Gold/Platinum at the platform level would be premature. Network standardization can come later via an opt-in mapping.

### 10. `TierPrice` rows are immutable
Each Tier has many `TierPrice`s (one Stripe Product, many Stripe Prices). Adding a new amount, interval, or currency creates a new `TierPrice` + Stripe Price. There's no "edit price" — only "archive + create new". Archiving flips `isActive = false` on the `TierPrice` and archives the Stripe Price.
- **Why**: Stripe Prices are immutable on `unit_amount` / `interval` / `currency`. Mirroring that on our side gives us an audit trail of price changes and lets old subscribers keep their grandfathered price even after the publisher raises rates. `Subscription` references a specific `TierPrice` via `Subscription.tierPriceId`, so archive ≠ break.
- **Intervals supported**: `Day` / `Week` / `Month` / `Year` (matches `Stripe.recurring.interval`). `intervalCount` is on the schema with `default(1)` but isn't yet exposed in the form.
- **Form input**: publishers type integer whole units (`19`); the form multiplies by 100 before submitting. DB and Stripe always see cents.

## Out of scope at v1 (don't gold-plate)

The following are explicit deferrals. Don't build them without confirming a scope expansion:
- **SDK package** (`@openads/sdk-js`) — defer until internal API surface stabilizes. Publishers integrate against tRPC public endpoints directly in the meantime if needed.
- **API versioning** (`/v1` prefix etc.) — defer with the SDK.
- **House ads / publisher self-promotion** — empty response is the v1 fallback.
- **Banner-vs-card placement differentiation** — publishers handle on their side via weight thresholds.
- **Advertiser dashboards / accounts** — advertisers are anonymous, email-only at v1.
- **Stripe billing portal link** for advertiser self-cancellation — manual via reply-to-email for now.
- **Auctions / RTB** — explicitly out, forever (per Part A strategic decision).
- **Per-workspace branded sender domains** — single shared sender via `AUTOSEND_FROM_EMAIL`.
- **SaaS plan gating** (Free/Pro for the publisher SaaS) — `Workspace.plan` was dropped; re-add when SaaS billing is a real concern.
- **Cross-workspace ad network** — tiers stay workspace-defined; standardization is a future opt-in.

## Build / test commands

- **Install**: `bun install` (postinstall runs `db:generate`)
- **Dev**: `bun run dev` (runs all apps) or `bunx turbo dev --filter=@openads/app` (single)
- **Build**: `bun run build`
- **Lint**: `bun run lint` (oxlint via @dirstack/kodeks)
- **Format**: `bun run format` (oxfmt via @dirstack/kodeks)
- **Test**: No tests yet; when added, use Vitest with `*.test.ts` files colocated with source
- **Database**: `bun run db:generate`, `db:push`, `db:reset`, `db:studio`

## Code style guidelines

- **TypeScript**: required everywhere, strict mode
- **Formatting**: oxfmt (2 spaces, 100 line width, double quotes, no semicolons, trailing commas, arrow parens avoided)
- **Imports**: sorted by oxfmt; absolute paths (`~/` for app src, `@openads/*` for packages)
- **Naming**: PascalCase for React components, `use-` prefix for hooks, camelCase for utilities, kebab-case filenames
- **Types**: use `@t3-oss/env-core` for env vars; prefer explicit types over `any`
- **Error handling**: try/catch for async operations; throw descriptive `TRPCError` from procedures; pass errors to the logger as `{ err }` (see Logging)
- **React**: functional components with hooks; named exports preferred; avoid default exports
- **tRPC**: procedures use Zod schemas; auth via `authProcedure` / `workspaceProcedure` / `connectEnabledWorkspaceProcedure` / `adProcedure`; public surface lives under `<router>.public.<procedure>`
- **Email templates** (`packages/emails/src/templates/*.tsx`): **every new template must start with `/** @jsxImportSource react */`** — the apps/api Hono JSX config otherwise tries to compile React JSX as Hono JSX and fails (see Operational gotchas)
- **Commits**: Conventional Commits enforced by commitlint (`feat:`, `fix:`, `refactor:`, `chore:`)

## Development workflow

- Lefthook git hooks run on commit: oxlint, oxfmt (pre-commit), commitlint (commit-msg).
- Single dev command across the workspace: `bun run dev`.
- **For schema changes**: edit `packages/db/prisma/models/*.prisma` → `bun run db:generate` → `bun run db:push` (or `db:push --accept-data-loss` for destructive changes). There is intentionally **no migrations directory** — the dev DB is treated as ephemeral and `db:push` is the canonical sync. Migrations should be adopted before the first production deploy, not before.
- **After any schema change**: regenerate the Prisma client (`bun run db:generate`) AND **restart `bun run dev`** — `bun --hot` caches module-level singletons (notably the Prisma client in `globalThis.prismaGlobal`), so the new tables won't be reachable from the running process until restart.

## Logging

- **Package**: `@openads/logger` (`packages/logger/`) — unified logger with two entrypoints behind one `Logger` interface (`trace` / `debug` / `info` / `warn` / `error` / `fatal` + `child`)
  - `@openads/logger/server` — pino-backed; pretty stdout in dev + structured JSON to `logs/openads.log`
  - `@openads/logger/browser` — batches entries and POSTs them to the API's `/log` endpoint (with `sendBeacon` fallback on `pagehide`)
- **Server usage** (`apps/api`): `import { logger } from "~/services/logger"` — singleton, process error handlers already installed
- **Browser usage** (`apps/app`): `import { logger } from "~/lib/logger"` — singleton, `window.onerror` / `unhandledrejection` / React 19 `onCaughtError` handlers already installed
- **Call convention**: `logger.error("short message", { err, ...context })` — pass `Error`/unknown via the `err` key so it's serialized (name/message/stack/cause). Use `logger.child({ requestId, workspaceId })` for scoped sub-loggers.
- **Where logs live**: `apps/api/logs/openads.log` is the single source of truth — both server entries and forwarded browser entries land there. Browser entries are tagged `source: "client"` and prefixed with `[client.<service>]`.
- **Tail logs**:
  - Raw JSON: `tail -f apps/api/logs/openads.log`
  - Pretty: `tail -f apps/api/logs/openads.log | bunx pino-pretty`
  - Errors only: `tail -f apps/api/logs/openads.log | jq 'select(.level=="error" or .level=="fatal")'`
  - Browser-only: `tail -f apps/api/logs/openads.log | jq 'select(.source=="client")'`
- **Never** use `console.log` / `console.error` / `console.warn` for diagnostics in app or server code — use the logger so the entry survives into the file and stays Sentry-swappable.
- **Future Sentry**: server-side, push `@sentry/pino-transport` into the multistream in `packages/logger/src/server.ts`; browser-side, add `Sentry.captureException` inside `createBrowserLogger`'s emit. No call sites change.

## Operational gotchas (learned the hard way)

These all bit during earlier iterations; they will bite the next agent the same way unless they're aware.

- **Prisma client + hot reload**: After `db:push`, the *generated* client (`packages/db/src/generated/prisma/`) is updated on disk, but the running `bun --hot` process holds the old `PrismaClient` instance in `globalThis.prismaGlobal`. Regenerated types alone aren't enough — kill and restart `bun run dev`.
- **`db:push` and destructive changes**: When dropping columns or models, Prisma refuses without `--accept-data-loss`. The dev DB has been treated as ephemeral throughout — confirm empty rows with `SELECT count(*) FROM "TableName"` before pushing, then pass the flag.
- **Stripe API version**: Pinned at `2026-04-22.dahlia` in `packages/stripe/src/index.ts`. At this version `current_period_start` / `current_period_end` are **not** on `Subscription` directly — they live on `subscription.items.data[0].current_period_*`. Both the webhook handler and the AdForm submission path read them via items.
- **JSX cross-package leakage**: `apps/api` sets `jsxImportSource: "hono/jsx"`. When it type-checks transitively through `@openads/emails`, the email templates (React JSX) get compiled with Hono's runtime and fail. Workarounds in place:
  - Pragma `/** @jsxImportSource react */` at the top of every email template `.tsx` file
  - `"jsx": "react-jsx"` in `packages/trpc/tsconfig.json`
  - `"types": ["node"]` in `packages/emails/tsconfig.json` and `packages/s3/tsconfig.json`
  - **Apply the pragma to every new email template.** Real fix is dropping `hono/jsx` from apps/api (we don't render Hono JSX) — a future cleanup.
- **SSH push to GitHub timing out**: Common on restrictive networks. Workaround is SSH-over-443 (`Host github.com / Hostname ssh.github.com / Port 443 / User git` in `~/.ssh/config`) or temporarily switch to HTTPS remote.
- **React Email v6**: imports come from `"react-email"` (single package), **not** `@react-email/components` (v5 legacy). Preview server is `@react-email/ui`, invoked via `email dev --dir src/templates` (the `--dir` flag is required because templates aren't in the default `./emails` folder).
- **AutoSend** is the email provider (not Resend). Used by `apps/landing` for the waitlist and by `@openads/emails` for all transactional. Env vars: `AUTOSEND_API_KEY`, `AUTOSEND_FROM_EMAIL`, `AUTOSEND_FROM_NAME`, plus `AUTOSEND_WAITLIST_LIST_ID` in landing only.
- **Public tRPC procedures**: must use `publicProcedure` and tolerate cross-origin requests. CORS is wired in `apps/api/src/index.ts`. No API key auth required for read endpoints (ads are public) or for impression/click tracking.
