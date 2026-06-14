# syntax=docker/dockerfile:1.7-labs
#
# OpenAds dashboard (Vite SPA → nginx). Build from the MONOREPO ROOT:
#   docker build -f apps/app/Dockerfile -t openads-app \
#     --build-arg VITE_API_URL=https://api.example.com \
#     --build-arg VITE_BASE_URL=https://app.example.com .
# VITE_* values are BAKED INTO THE BUNDLE at build time — rebuild to change them.
# Needs BuildKit (Docker 23+) for `COPY --parents`.

# ---- deps: install workspace + generate Prisma client ----
FROM oven/bun:1.3.14-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --parents package.json bun.lock apps/*/package.json packages/*/package.json ./
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/prisma.config.ts
RUN bun install --frozen-lockfile

# ---- build: produce the static bundle ----
FROM deps AS build
WORKDIR /app
COPY . .

# Public client config. Defaults target the docker-compose stack. The two
# analytics keys are optional — leave empty and both features no-op.
ARG VITE_API_URL=http://localhost:3001
ARG VITE_BASE_URL=http://localhost:8080
ARG VITE_WEB_URL=https://openads.co
ARG VITE_SUPPORT_EMAIL=hello@openads.co
ARG VITE_OPENPANEL_CLIENT_ID=
ARG VITE_COSSISTANT_PUBLIC_KEY=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_WEB_URL=$VITE_WEB_URL \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL \
    VITE_OPENPANEL_CLIENT_ID=$VITE_OPENPANEL_CLIENT_ID \
    VITE_COSSISTANT_PUBLIC_KEY=$VITE_COSSISTANT_PUBLIC_KEY

WORKDIR /app/apps/app
RUN bun run build

# ---- runtime: static server with SPA fallback ----
FROM nginx:1.27-alpine AS app
COPY apps/app/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
