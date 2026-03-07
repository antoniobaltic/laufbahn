# Laufbahn — Project Guide

## Overview
Laufbahn is a SaaS job application tracker for the German/Austrian (DACH) market. All UI text is in German. The aesthetic is directly inspired by Anthropic's design language: warm off-whites, generous whitespace, subtle typography, high information density without visual noise.

## Tech Stack
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Backend/DB:** Supabase (auth + Postgres)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` config in `globals.css`)
- **Hosting:** Vercel
- **Drag & Drop:** `@hello-pangea/dnd`
- **Icons:** `lucide-react`
- **Utilities:** `clsx`, `tailwind-merge`, `date-fns`, `zod`

## Design System

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `dark` | `#141413` | Primary text, dark backgrounds |
| `light` | `#faf9f5` | Page background |
| `mid-gray` | `#b0aea5` | Secondary/muted elements |
| `light-gray` | `#e8e6dc` | Borders, subtle backgrounds |
| `accent-orange` | `#d97757` | Primary accent, CTAs, links |
| `accent-blue` | `#6a9bcc` | Secondary accent |
| `accent-green` | `#788c5d` | Tertiary accent, success |

### Status Colors (Kanban columns)
| Status | Color | Token |
|---|---|---|
| Gemerkt | `#6a9bcc` (blue) | `status-gemerkt` |
| Beworben | `#d97757` (orange) | `status-beworben` |
| Im Gespraech | `#b8a038` (gold) | `status-gespraech` |
| Angebot | `#788c5d` (green) | `status-angebot` |
| Abgelehnt | `#c45f3e` (red) | `status-abgelehnt` |
| Ghosted | `#b0aea5` (gray) | `status-ghosted` |

### Typography
- **Headings:** Poppins (via `next/font/google`), CSS var `--font-heading`, Tailwind class `font-heading`
- **Body text:** Lora (via `next/font/google`), CSS var `--font-body`, Tailwind class `font-body`
- **Weights used:** Poppins 400/500/600/700, Lora 400/500 + italic

### Typography Hierarchy
| Element | Font | Weight | Size | Class |
|---|---|---|---|---|
| Page title | Poppins | 600 | 24-30px | `text-2xl font-heading font-semibold` |
| Section heading | Poppins | 500 | 18-20px | `text-lg font-heading font-medium` |
| Card title (company) | Poppins | 500 | 14-15px | `text-sm font-heading font-medium` |
| Body text | Lora | 400 | 14-15px | `text-sm font-body` |
| Labels/metadata | Poppins | 400 | 12-13px | `text-xs font-heading text-muted-foreground` |
| Buttons | Poppins | 500 | 14px | `font-heading font-medium` |

### Spacing
- Card padding: `p-3` to `p-4` (12-16px)
- Column gap: `gap-4` (16px)
- Section spacing: `space-y-6` to `space-y-8` (24-32px)
- Page padding: `p-4` mobile, `p-8` desktop (`p-4 lg:p-8`)

### Shadows
| Token | Usage |
|---|---|
| `shadow-card` | Default card shadow (subtle, warm) |
| `shadow-card-hover` | Hover state, dragging |
| `shadow-dialog` | Modals, dropdowns |

### Card Design
- Background: `bg-white`
- Border: `border border-border` (light-gray)
- Shadow: `shadow-card`, hover: `shadow-card-hover`
- Rounded: `rounded-lg`
- Transition: `transition-shadow duration-150`

### Column Design
- Background: `bg-dark-50` (off-white)
- Top accent: 3px colored bar per status color
- Width: `min-w-[280px] max-w-[320px] w-[280px]`
- Vertical scroll for card overflow

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root: fonts, metadata, lang="de"
│   ├── page.tsx                # Landing page (marketing)
│   ├── globals.css             # @theme block — single source of truth for design tokens
│   ├── (auth)/
│   │   ├── layout.tsx          # Centered card layout
│   │   ├── anmelden/page.tsx   # Login (wrapped in Suspense for useSearchParams)
│   │   ├── registrieren/page.tsx
│   │   └── auth/callback/route.ts
│   └── (app)/
│       ├── layout.tsx          # Server component: auth check, redirects
│       ├── app-shell.tsx       # Client component: sidebar + topbar + toast provider
│       └── board/
│           ├── page.tsx        # Server component: fetches applications
│           └── loading.tsx     # Skeleton loading state
├── components/
│   ├── ui/                     # Primitives (button, card, badge, input, textarea, select, dialog, toast, skeleton, empty-state)
│   ├── board/                  # Kanban (kanban-board, kanban-column, kanban-card, column-header, add-application-dialog)
│   └── layout/                 # Shell (sidebar, topbar, mobile-nav)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient — for client components
│   │   ├── server.ts           # createServerClient — for server components/actions
│   │   └── middleware.ts       # updateSession — refreshes auth cookie, protects routes
│   └── utils/
│       ├── cn.ts               # clsx + tailwind-merge
│       ├── constants.ts        # COLUMN_ORDER, COLUMN_CONFIG, ApplicationStatus type
│       └── dates.ts            # German date formatting (date-fns + de locale)
├── actions/
│   └── applications.ts         # Server Actions: CRUD + reorder + status updates
├── hooks/
│   └── use-kanban.ts           # Drag-end handler with optimistic updates
└── types/
    ├── application.ts          # Application + CreateApplicationInput interfaces
    └── kanban.ts               # DragResult, ColumnData interfaces
```

## Key Patterns

### Authentication Flow
1. Supabase SSR with cookie-based sessions
2. `middleware.ts` at root refreshes session on every request
3. Protected routes: `/board`, `/bewerbung`, `/analytics`, `/einstellungen`
4. Server Components always call `supabase.auth.getUser()` (never trust middleware alone)
5. Auth callback at `/(auth)/auth/callback/route.ts` for OAuth code exchange

### Kanban Board Architecture
- **Board page** (Server Component) fetches applications via `getApplications()`
- **KanbanBoard** (Client) wraps `DragDropContext` from `@hello-pangea/dnd`
- **KanbanColumn** wraps `Droppable` per status
- **KanbanCard** wraps `Draggable` per application
- **useKanban hook** manages optimistic drag-and-drop state + server persistence
- Column order: `gemerkt → beworben → im_gespraech → angebot → abgelehnt → ghosted`

### Server Actions
All mutations go through `src/actions/applications.ts`:
- `getApplications()` — fetch all user applications
- `createApplication(input)` — create with auto position
- `updateApplicationStatus(id, status, position)` — move card
- `reorderApplications(updates[])` — batch position updates
- `deleteApplication(id)` — hard delete

### UI Component Convention
- All primitives in `src/components/ui/`
- Use `cn()` from `@/lib/utils/cn` for className merging
- Headings: `font-heading` (Poppins)
- Body: `font-body` (Lora)
- Colors reference design tokens: `text-dark`, `bg-light`, `text-accent-orange`, etc.
- Interactive states: `hover:bg-light-gray`, `shadow-card-hover`

## Database Schema (Supabase)

### Project
- **Project ID:** `wqsndsezguuiryxgqcaj`
- **Region:** eu-west-1 (Frankfurt)
- **Plan:** Free tier
- **Status:** Active & healthy
- **Free tier note:** Project pauses after 1 week of inactivity (30s cold start on next request)

SQL migrations applied via Supabase MCP (also stored in `supabase/migrations/`):
- `create_profiles` — profiles table + auto-create trigger on auth.users
- `create_applications` — applications table with status enum + free tier limit trigger (max 10)
- `create_activities` — activities table + auto-log status changes trigger + pg_trgm extension

### Key Tables
- **profiles** — extends auth.users (subscription info, locale). Auto-created on signup via trigger.
- **applications** — core table with `application_status` enum, `position_in_column` for ordering
- **activities** — timeline events per application (auto-logged on status change)

### RLS Pattern
All tables use `user_id = auth.uid()` for row-level security. Every query is automatically scoped to the authenticated user.

### Key Triggers
- `on_auth_user_created` — auto-creates a profile row when a user signs up
- `on_application_status_change` — logs status changes to activities + sets date fields automatically
- `check_app_limit_before_insert` — blocks insert if free user has ≥ 10 applications

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://wqsndsezguuiryxgqcaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set in .env.local>
SUPABASE_SERVICE_ROLE_KEY=<set in .env.local — needed for Phase 5+ webhooks>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Phase Status
- **Phase 1 ✅ COMPLETE** — Foundation: Next.js scaffold, design system, auth, Kanban board, DB schema, landing page
- **Phase 2** — URL scraper + company logos + duplicate detection
- **Phase 3** — Application detail view + documents + contacts
- **Phase 4** — Analytics + notifications + celebration animation (Angebot confetti)
- **Phase 5** — Stripe monetization (free: 10 apps / premium: EUR 8/mo)
- **Phase 6** — Gmail integration (OAuth, email matching, contact extraction)
- **Phase 7** — Polish + legal pages (Impressum, Datenschutz, AGB) + landing page
