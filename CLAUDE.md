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

## Architecture Plan

### Authentication & Authorization
- **Vercel Auth**: Handles user authentication (supporting GitHub, Google, etc.)
- **Authorization Pattern**: User-scoped database access where each record has a `user_id` column
- All database operations must be performed server-side (API routes or Server Components)
- Client never directly accesses the database

### Database
- **Provider**: Neon (Serverless PostgreSQL)
- **Connection**: Database URL stored in Vercel environment variables as `DATABASE_URL`
- **Schema Pattern**: Tables include `user_id` column to associate records with authenticated users

### Technology Stack
- **Package Manager**: Bun
- **Framework**: Next.js
- **Database**: Neon PostgreSQL
- **Authentication**: Vercel Auth
- **Deployment**: Vercel

## Development Commands

Commands will be added here once the Next.js project is initialized with Bun.

## Key Implementation Principles

1. **Server-Side Data Access**: Never expose database credentials or allow direct database access from the client
2. **User-Scoped Queries**: All database queries must filter by the authenticated user's ID
3. **Environment Variables**: Use Vercel's environment variable management for database connection strings
4. **Session Management**: Leverage Vercel Auth's cookie-based session handling
