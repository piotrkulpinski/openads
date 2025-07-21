# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenAds is an advertising marketplace platform built as a monorepo using Bun and Turbo. It enables workspaces to create advertising spots, manage bookings, and process payments through Stripe Connect.

## Architecture

### Monorepo Structure
- `apps/api` - Backend API server using Hono and tRPC
- `apps/app` - Main React application using Vite and TanStack Router
- `apps/website` - Marketing website built with Astro
- `packages/db` - Database layer using Prisma ORM with PostgreSQL
- `packages/ui` - Shared UI component library built on Radix UI
- `packages/events` - Event handling system
- `packages/utils` - Shared utilities

### Tech Stack
- **Runtime**: Bun
- **API**: Hono + tRPC for type-safe APIs
- **Frontend**: React 19 + Vite + TanStack Router/Query
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth
- **Payments**: Stripe (including Connect)
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome (linting & formatting)

## Essential Commands

### Development
```bash
# Start all apps in development
bun dev

# Start specific app
bun --filter @openads/api dev    # API server
bun --filter @openads/app dev    # Main app
bun --filter @openads/website dev # Website

# Build all apps
bun build
```

### Database
```bash
# Generate Prisma client (runs automatically on install)
bun db:generate

# Run migrations
bun db:migrate

# Open Prisma Studio GUI
bun db:studio

# Push schema changes without migration
bun db:push

# Reset database
bun db:reset
```

### Code Quality
```bash
# Lint and fix issues
bun lint

# Format code
bun format
```

## Database Schema

The core data model consists of:
- **Workspace**: Multi-tenant workspaces with Free/Pro plans
- **Spot**: Advertising spots with custom pricing
- **Booking**: Bookings with Stripe payment integration
- **Field/Meta**: Dynamic custom fields system
- **WorkspaceMember**: Role-based access (Owner/Manager/Advertiser)

## Key Implementation Details

### API Structure
The API uses tRPC routers organized by domain:
- Auth endpoints via Better Auth
- Workspace management
- Spot CRUD operations
- Booking system with calendar logic
- Stripe webhooks and Connect integration

### Frontend Routing
Uses TanStack Router with file-based routing:
- `$workspace_` prefix indicates workspace-scoped routes
- Embedded widget routes under `/embed`
- Authentication flows integrated with Better Auth

### Component Architecture
- Shared UI components in `packages/ui` using CVA for styling
- Form handling with React Hook Form and Zod validation
- Drag-and-drop functionality with @dnd-kit
- Toast notifications via Sonner

### Payment Integration
- Stripe Connect for marketplace functionality
- Workspace-level Stripe accounts
- Booking payments flow through platform
- Webhook handling for payment events

## Code Style

Biome configuration enforces:
- Double quotes
- No semicolons as needed
- 2-space indentation
- 100-character line width
- Organized imports

## Environment Setup

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `MAILERLITE_API_TOKEN` - Email service
- `PLAUSIBLE_DOMAIN/URL` - Analytics
- Stripe API keys and webhook secrets
- Better Auth configuration