# syntax=docker/dockerfile:1.7-labs
#
# OpenAds API (Hono on Bun). Build from the MONOREPO ROOT (workspace deps):
#   docker build -f apps/api/Dockerfile -t openads-api .
# Needs BuildKit (Docker 23+) for `COPY --parents`.

# ---- deps: install workspace + generate Prisma client ----
FROM oven/bun:1.3.14-slim AS deps
WORKDIR /app

# Prisma's schema engine needs openssl at generate time.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Manifests first so `bun install` caches until a manifest/lockfile changes.
COPY --parents package.json bun.lock apps/*/package.json packages/*/package.json ./
# Schema + config for the @openads/db postinstall (`prisma generate`).
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/prisma.config.ts

# Frozen: fail rather than silently mutate bun.lock (supply-chain safety).
# The pinned bun base must match the version that wrote the lockfile.
RUN bun install --frozen-lockfile

# ---- api: overlay source and run ----
FROM deps AS api
WORKDIR /app
# node_modules + generated client inherited from deps; source can't clobber them.
COPY . .

ENV NODE_ENV=production \
    PORT=3001
EXPOSE 3001

# Bun auto-serves a default export of `{ port, fetch }`. Run from apps/api so
# the `~/*` tsconfig alias resolves.
WORKDIR /app/apps/api

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "src/index.ts"]
