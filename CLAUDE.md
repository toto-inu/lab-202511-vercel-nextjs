# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a laboratory project for exploring Vercel and Next.js (November 2025). A Todo application with authentication (currently using Clerk, planned migration to Better Auth) and Neon PostgreSQL as the database.

**Note**: The project is undergoing a migration to a multi-tenant SaaS architecture with Better Auth. See `documents/saas化/` for detailed plans.

## Architecture

The application is located in the `app/` directory.

- **Framework**: Next.js 16 with App Router
- **Package Manager**: Bun
- **Database**: PostgreSQL (local via Docker, production via Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **Authentication**: Currently Clerk, planned migration to Better Auth (see `documents/saas化/`)

### Authentication & Authorization (Current Implementation)

- **Clerk Integration** (current): `@clerk/nextjs` - Authentication provider with built-in UI
- **Better Auth** (planned): Next-generation auth library with better TypeScript support
- **Auth Utilities**: `lib/auth-utils.ts` - Helper functions (`getCurrentUser`, `requireAuth`, `requireAdmin`, `canEditTodo`, `isAdmin`)
- **Middleware**: `middleware.ts` - Protects routes, redirects unauthenticated users
- **User Sync**: Auth users automatically synced with DB on first sign-in

**Current Roles**: `USER` (default), `ADMIN` (full access to all Todos)

**Planned Multi-Tenant Roles** (see `documents/saas化/03_権限設計.md`):
- **Tenant Roles**: OWNER, ADMIN, MEMBER
- **Project Roles**: ADMIN, EDITOR, VIEWER
- **Global Admin**: `User.isGlobalAdmin` flag

**Protected Routes**: All routes except `/sign-in`, `/sign-up`, and `/api/webhooks`

**Key Features**:
- Auth users are automatically synced with the local DB (`User` model)
- On first sign-in, a DB user record is created
- Admin users can view/edit all Todos
- Regular users can only view/edit their own Todos

### Database Schema

**User Management (Current)**:
- **User**: id, clerkId (unique, from Clerk), email (unique), name, role (USER/ADMIN), timestamps
- **Role** enum: USER, ADMIN

**User Management (Planned)** - See `documents/saas化/02_データモデル設計.md`:
- **User**: id, email, name, isGlobalAdmin
- **Tenant**: Organization/workspace
- **TenantMember**: User-Tenant relationship with roles (OWNER/ADMIN/MEMBER)
- **Project**: Project within a tenant
- **ProjectMember**: User-Project relationship with roles (ADMIN/EDITOR/VIEWER)
- **Plan**: Subscription plan (FREE/PRO/ENTERPRISE)

**Application Models**:
- **Todo**: id, title, description, completed, assigneeId (FK to Assignee), createdById (FK to User), timestamps
  - Planned additions: tenantId, projectId, priority, dueDate
- **Assignee**: id, name, email (unique), timestamps

**Key Relationships**:
- Todo → User (createdBy, many-to-one, CASCADE delete) - Owner of the todo
- Todo → Assignee (many-to-one, SET NULL on delete, optional) - Who the todo is assigned to

## Development Commands

All commands should be run from the `app/` directory:

```bash
cd app
bun install           # Install dependencies
bun run dev           # Start development server
bun run build         # Build for production
bun run lint          # Run linter
```

### Database Commands

```bash
# Start/stop PostgreSQL with Docker (from project root)
docker compose up -d
docker compose down

# Prisma commands (from app/ directory)
bunx prisma generate                    # Generate Prisma Client
bunx prisma migrate dev --name <name>   # Create migration
bunx prisma migrate deploy              # Apply migrations
bunx prisma studio                      # Database GUI
```

### Environment Variables

**Current** - Required in `.env.local` (local) or Vercel dashboard (production):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (get from https://dashboard.clerk.com/)
- `CLERK_SECRET_KEY` - Clerk secret key (get from https://dashboard.clerk.com/)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` (optional)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` (optional)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/` (optional)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/` (optional)

**Planned** (Better Auth migration):
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `BETTER_AUTH_SECRET` - Random secret key for Better Auth
- `BETTER_AUTH_URL` - Application URL (http://localhost:3000 for local)

## Key Implementation Principles

1. **Server Actions Pattern**: All CRUD operations use Server Actions in `actions/` directory
2. **Auth Guard Pattern**: Use `requireAuth()` at the start of protected server actions, `canEditTodo()` before mutations
3. **User-Scoped Queries**: Regular users only see/edit their own Todos (`createdById = user.id`), Admins see all
4. **Session Management**: Currently Clerk, planned Better Auth with JWT tokens
5. **DB User Sync**: Auth users are automatically synced with the local DB User model on first sign-in

**Planned Additional Principles** (Multi-Tenant SaaS):
6. **Tenant Isolation**: All queries filtered by `tenantId` to prevent data leakage
7. **Plan-Based Limits**: Resource limits enforced based on subscription plan
8. **Permission Hierarchy**: Plan limits → Tenant Role → Project Role checks

## Authentication Flow (Current)

1. User signs in via Clerk (Google OAuth or Email/Password)
2. `getCurrentUser()` is called in server actions
3. If user doesn't exist in DB, create new User record with `clerkId`
4. Return DB user with role information
5. Use role to determine access permissions (Admin sees all Todos, User sees only their own)

## Authentication Flow (Planned - Better Auth)

1. User signs in via Better Auth (Google OAuth or Email/Password)
2. `getCurrentUser()` is called in server actions
3. Session validated via `auth.api.getSession()`
4. If user doesn't exist in DB, create User + default Tenant
5. Tenant context determined via cookie
6. Permissions checked: Plan limits → Tenant Role → Project Role
