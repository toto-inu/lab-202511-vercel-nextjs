# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a laboratory project for exploring Vercel and Next.js (November 2025). A Todo application with authentication using Clerk and Neon PostgreSQL as the database.

## Architecture

The application is located in the `app/` directory.

- **Framework**: Next.js 16 with App Router
- **Package Manager**: Bun
- **Database**: PostgreSQL (local via Docker, production via Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk with Google OAuth and Email/Password

### Authentication & Authorization

- **Clerk Integration**: `@clerk/nextjs` - Authentication provider with built-in UI
- **Auth Utilities**: `lib/auth-utils.ts` - Helper functions (`getCurrentUser`, `requireAuth`, `requireAdmin`, `canEditTodo`, `isAdmin`)
- **Middleware**: `middleware.ts` - Protects routes using `clerkMiddleware`, redirects unauthenticated users
- **User Sync**: Clerk users automatically synced with DB on first sign-in

**Roles**: `USER` (default), `ADMIN` (full access to all Todos)

**Protected Routes**: All routes except `/sign-in`, `/sign-up`, and `/api/webhooks`

**Key Features**:
- Clerk users are automatically synced with the local DB (`User` model)
- On first sign-in, a DB user record is created with Clerk's `userId` as `clerkId`
- Admin users can view/edit all Todos
- Regular users can only view/edit their own Todos

### Database Schema

**User Management**:
- **User**: id, clerkId (unique, from Clerk), email (unique), name, role (USER/ADMIN), timestamps
- **Role** enum: USER, ADMIN

**Application Models**:
- **Todo**: id, title, description, completed, assigneeId (FK to Assignee), createdById (FK to User), timestamps
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

Required in `.env.local` (local) or Vercel dashboard (production):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (get from https://dashboard.clerk.com/)
- `CLERK_SECRET_KEY` - Clerk secret key (get from https://dashboard.clerk.com/)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` (optional)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` (optional)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/` (optional)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/` (optional)

## Key Implementation Principles

1. **Server Actions Pattern**: All CRUD operations use Server Actions in `actions/` directory
2. **Auth Guard Pattern**: Use `requireAuth()` at the start of protected server actions, `canEditTodo()` before mutations
3. **User-Scoped Queries**: Regular users only see/edit their own Todos (`createdById = user.id`), Admins see all
4. **Clerk Sessions**: Clerk handles session management automatically
5. **DB User Sync**: Clerk users are automatically synced with the local DB User model on first sign-in

## Authentication Flow

1. User signs in via Clerk (Google OAuth or Email/Password)
2. `getCurrentUser()` is called in server actions
3. If user doesn't exist in DB, create new User record with `clerkId`
4. Return DB user with role information
5. Use role to determine access permissions (Admin sees all Todos, User sees only their own)
