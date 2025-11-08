# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a laboratory project for exploring Vercel and Next.js (November 2025). The goal is to build a Todo application with authentication using Vercel Auth and Neon PostgreSQL as the database.

## Project Objectives

Based on documents/進め方.md:

1. **Application Development**
   - Build a Next.js Todo application using Bun as the package manager
   - Implement API endpoints for Todo operations
   - Set up local development with Docker for database
   - Implement authentication and authorization using Vercel Auth

2. **Deployment**
   - Create database on Neon
   - Deploy to Vercel
   - Verify authentication functionality in production

## Prerequisites & CLI Tools

Install and authenticate with these CLI tools before starting (from documents/事前準備.md):

### Vercel CLI
```bash
npm install -g vercel
vercel login
```

Useful commands:
- `vercel --version` - Check version
- `vercel whoami` - Check authentication status

### Neon CLI
```bash
npm install -g neonctl
neonctl auth
```

Useful commands:
- `neonctl projects list` - List all projects
- `neonctl databases list --project-id=[PROJECT_ID]` - List databases
- `neonctl branches create --project-id=[PROJECT_ID]` - Create branch
- `neonctl connection-string [BRANCH_NAME]` - Get connection string

## Architecture

### Current Implementation
The application is located in the `app/` directory.

- **Framework**: Next.js 16 with App Router
- **Package Manager**: Bun
- **Database**: PostgreSQL (local via Docker, production via Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4

### Database Schema
- **Todo Table**: id, title, description, completed, assigneeId (FK), createdAt, updatedAt
- **Assignee Table**: id, name, email (unique), createdAt, updatedAt
- **Relationship**: Todo → Assignee (many-to-one, optional)

### Project Structure
```
app/
├── actions/          # Server Actions for CRUD operations
│   ├── todo.ts
│   └── assignee.ts
├── app/              # App Router pages
│   ├── page.tsx      # Todo list page
│   ├── assignees/
│   │   └── page.tsx  # Assignee list page
│   ├── layout.tsx    # Root layout with navigation
│   └── globals.css
├── components/       # React components
│   ├── Navigation.tsx
│   ├── TodoList.tsx
│   ├── TodoItem.tsx
│   ├── TodoForm.tsx
│   ├── AssigneeList.tsx
│   ├── AssigneeItem.tsx
│   └── AssigneeForm.tsx
├── lib/
│   └── prisma.ts     # Prisma Client singleton
└── prisma/
    └── schema.prisma # Database schema
```

## Development Commands

All commands should be run from the `app/` directory:

```bash
cd app

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint
```

### Database Commands

```bash
# Start PostgreSQL with Docker (from project root)
docker compose up -d

# Stop PostgreSQL
docker compose down

# Generate Prisma Client
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name <migration_name>

# Apply migrations
bunx prisma migrate deploy

# Seed database with sample data
bun run db:seed

# Open Prisma Studio (database GUI)
bunx prisma studio
```

## Deployment to Vercel

### 1. Prepare Neon Database

Create a PostgreSQL database on Neon:

```bash
# List your projects
neonctl projects list

# Get connection string (copy this for Vercel)
neonctl connection-string <branch-name> --project-id=<project-id>
```

Or get it from the Neon Console: https://console.neon.tech

### 2. Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** > **Environment Variables**
2. Add the following variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string (from step 1)
   - **Environments**: Production, Preview, Development (select all)

Example Neon connection string format:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
cd app
vercel deploy --prod
```

#### Option B: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your repository in Vercel Dashboard
3. Vercel will automatically deploy on every push to main branch

### 4. Run Migrations on Production

After first deployment:

```bash
# SSH into Vercel or use their CLI
vercel env pull .env.production
bunx prisma migrate deploy
```

Or add to your build command in `package.json`:
```json
"build": "prisma migrate deploy && next build"
```

### Important Notes

- **Local Development**: Uses Docker PostgreSQL at `localhost:5432`
- **Production (Vercel)**: Uses Neon PostgreSQL (connection string from environment variable)
- The application automatically uses the `DATABASE_URL` environment variable
- Never commit `.env` file to git (it's in `.gitignore`)

### Technology Stack
- **Package Manager**: Bun
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Docker for local, Neon for production)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **Authentication**: Vercel Auth (planned)
- **Deployment**: Vercel (planned)

## Key Implementation Principles

1. **Server-Side Data Access**: Never expose database credentials or allow direct database access from the client
2. **User-Scoped Queries**: All database queries must filter by the authenticated user's ID
3. **Environment Variables**: Use Vercel's environment variable management for database connection strings
4. **Session Management**: Leverage Vercel Auth's cookie-based session handling
