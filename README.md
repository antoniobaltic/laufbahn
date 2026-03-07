# Laufbahn

Laufbahn is a premium job application tracker for the DACH market, built with Next.js 16 and Supabase. The product combines a kanban workflow, structured application detail pages, reminders, analytics, and a warm Anthropic-inspired UI.

## Stack

- Next.js 16 App Router
- TypeScript
- Supabase Auth + Postgres
- Tailwind CSS v4
- `@hello-pangea/dnd`

## Local Development

```bash
npm install
npm run dev
```

The app expects Supabase environment variables in `.env.local`. See [AGENTS.md](/Users/antoniobaltic/Desktop/apps/laufbahn/AGENTS.md) for project structure, product phases, design rules, and implementation patterns.

## Quality Checks

```bash
npm run lint
npm run build
```

## Current Product Surface

- Landing page and German auth flow
- Protected app shell
- Kanban board for applications
- Structured detail workspace with notes, contacts, documents, interviews, and deadlines
- In-app reminders and analytics
- Restrained celebration for offer-stage transitions
