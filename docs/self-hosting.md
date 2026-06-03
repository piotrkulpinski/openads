# Self-hosting OpenAds

OpenAds ships as Docker images for the two runtime apps:

- **`apps/api`** — the Hono/Bun API (RPC at `/rpc`, public REST + OpenAPI at `/v1`, Stripe webhooks, auth). This is what the `@openads/sdk` / `@openads/react` clients call.
- **`apps/app`** — the publisher/advertiser dashboard (a Vite SPA served by nginx).

The `docker-compose.yml` at the repo root wires both together with Postgres and Redis so you can bring the whole platform up with one command.

> The marketing site (`apps/landing`) is a Cloudflare Workers app and is **not** part of the self-host stack.

## Prerequisites

- **Docker 23+** with BuildKit (the Dockerfiles use `COPY --parents`). BuildKit is the default in modern Docker; if you're on an old engine, set `DOCKER_BUILDKIT=1`.
- An **S3-compatible object store** (Cloudflare R2, AWS S3, or the bundled MinIO profile) — required for advertiser image uploads and favicons.
- **Stripe** account (Connect enabled), **Google OAuth** credentials (publisher login), and an **AutoSend** API key (transactional email).

## Quick start

```bash
cp .env.example .env
# fill in the secrets — BETTER_AUTH_SECRET, Google OAuth, Stripe, AutoSend, S3.
# Postgres and Redis are wired by compose, so you can ignore the DB/Redis vars.
docker compose up -d --build
```

- Dashboard → http://localhost:8080
- API → http://localhost:3001 (OpenAPI docs at http://localhost:3001/v1/docs)

The `migrate` service runs `prisma db push` once on startup to sync the schema, then the `api` service boots.

## Configuration

All runtime configuration is via environment variables in a single `.env` (copied from `.env.example`). Compose wires the bundled Postgres and Redis automatically — it overrides `DATABASE_URL`/`REDIS_URL` regardless of what `.env` says — so for the bundled stack you only fill in secrets. Two important nuances:

### The dashboard's config is baked at build time

`apps/app` is a client-side SPA, so its `VITE_*` values (`VITE_API_URL`, `VITE_BASE_URL`, …) are **compiled into the JS bundle** when the image is built. Compose passes them as build args from your `.env`. If you change any `VITE_*` value, rebuild the image:

```bash
docker compose build app && docker compose up -d app
```

For a custom build outside compose:

```bash
docker build -f apps/app/Dockerfile -t openads-app \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_BASE_URL=https://app.example.com .
```

`VITE_OPENPANEL_CLIENT_ID` and `VITE_COSSISTANT_PUBLIC_KEY` are optional third-party integrations (product analytics / support widget). Leave them empty for a self-hosted instance — both features no-op when unset (OpenPanel isn't mounted; the Cossistant support widget stays dormant).

### Redis

The API connects to Redis over a standard connection string (`ioredis`). Compose runs a plain Redis container and wires the API to it via `REDIS_URL=redis://redis:6379`. To use an external/managed Redis instead, point `REDIS_URL` at it and remove the bundled `redis` service.

## Object storage

Set the `S3_*` vars to any S3-compatible store. For **Cloudflare R2**:

```
S3_REGION=auto
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://<your-public-bucket-domain>
S3_ACCESS_KEY_ID=<r2 token id>
S3_SECRET_ACCESS_KEY=<r2 token secret>
S3_BUCKET=openads
```

### Bundled MinIO (optional)

```bash
docker compose --profile storage up -d --build
```

This starts MinIO + creates the bucket with public-download access. **Presigned-upload caveat:** the browser uploads directly to `S3_ENDPOINT`, so that URL must be reachable by *both* the browser and the API with the *same* host (otherwise the signature host won't match). On a single host this means putting MinIO behind your public domain/reverse proxy and setting `S3_ENDPOINT` + `S3_PUBLIC_URL` to that one URL. Pure-`localhost` setups work for the API but the browser-side upload can fail the signature check — MinIO is best used when deployed behind a real domain. For zero-fuss storage, R2 is the simplest option.

## Migrations

The project currently syncs schema with `prisma db push` (no migrations folder yet). The `migrate` service does this on every `up`. Once migrations are adopted, change that service's command to `bunx prisma migrate deploy`.

## Production notes

- Put a TLS-terminating reverse proxy (Caddy, nginx, Traefik, Cloudflare Tunnel) in front of `app` (:80) and `api` (:3001). Set `APP_URL`/`API_URL`/`BETTER_AUTH_URL` and the `VITE_*` build args to your https domains.
- Register the Stripe **Connect** webhook at `https://<api-domain>/webhooks/stripe` and put the signing secret in `STRIPE_CONNECT_WEBHOOK_SECRET`.
- Set the Google OAuth redirect URI to `https://<api-domain>/api/auth/callback/google`.
- The images run the full Bun workspace (including the Prisma CLI), so the same `api` image is reused for the `migrate` step.

## Pointing the SDK at your instance

Publisher sites integrating via `@openads/sdk` / `@openads/react` pass your API URL explicitly:

```ts
createOpenAdsClient({ workspaceSlug: "your-slug", apiUrl: "https://api.example.com" })
```

## Building images individually

```bash
# from the repo root (build context must be the root)
docker build -f apps/api/Dockerfile -t openads-api .
docker build -f apps/app/Dockerfile -t openads-app --build-arg VITE_API_URL=... --build-arg VITE_BASE_URL=... .
```
