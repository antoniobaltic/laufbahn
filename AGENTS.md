# Laufbahn — Project Guide

## Overview
Laufbahn is a SaaS job application tracker for the German/Austrian (DACH) market. All UI text is in German. The product should feel like a focused premium workspace: warm, calm, precise, and pleasant to use over long sessions.

## Tech Stack
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Backend/DB:** Supabase (auth + Postgres)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` config in `globals.css`)
- **Hosting:** Vercel
- **Drag & Drop:** `@hello-pangea/dnd`
- **Icons:** `lucide-react`
- **Utilities:** `clsx`, `tailwind-merge`, `date-fns`, `zod`

## Product Feel

### Core Aesthetic
- Anthropic-inspired warmth, but not sterile.
- Retro/classy rather than startup-generic.
- Premium means calm surfaces, precise hierarchy, restrained motion, and no visual clutter.
- The interface should feel intentionally designed on both desktop and mobile, never like a stretched admin panel.

### Premium UX Principles
- Every important screen needs a clear visual anchor in the first viewport.
- Actions should be obvious without being loud.
- Hover states must add confidence, not noise.
- Empty states should still feel finished and helpful.
- Detail surfaces should behave like workspaces, not static records.
- Mobile must preserve the same quality of hierarchy as desktop, not just stack everything mindlessly.

### Do Not Regress
- No flat white pages with unstructured blocks.
- No default-looking forms or buttons.
- No global smooth-scroll behavior: it conflicts with `@hello-pangea/dnd`.
- No oversized, bouncy, playful animations. Motion should stay subtle and professional.
- No hidden destructive actions on touch-only layouts.
- No new UI that ignores existing `surface-*` and motion conventions.

## Design System

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `dark` | `#141413` | Primary text, dark accents |
| `light` | `#faf9f5` | Page background |
| `mid-gray` | `#b0aea5` | Secondary/muted elements |
| `light-gray` | `#e8e6dc` | Borders, subtle backgrounds |
| `accent-orange` | `#d97757` | Primary accent, CTAs, links |
| `accent-blue` | `#6a9bcc` | Secondary accent |
| `accent-green` | `#788c5d` | Tertiary accent, success |

### Status Colors
| Status | Color | Token |
|---|---|---|
| Gemerkt | `#6a9bcc` | `status-gemerkt` |
| Beworben | `#d97757` | `status-beworben` |
| Im Gespraech | `#b8a038` | `status-gespraech` |
| Angebot | `#788c5d` | `status-angebot` |
| Abgelehnt | `#c45f3e` | `status-abgelehnt` |
| Ghosted | `#b0aea5` | `status-ghosted` |

### Typography
- **Headings:** Poppins via `--font-heading`
- **Body:** Lora via `--font-body`
- **Weights used:** Poppins 400/500/600/700, Lora 400/500 + italic

### Typography Hierarchy
| Element | Class |
|---|---|
| Hero / page title | `text-3xl sm:text-[2.1rem] font-heading font-semibold` |
| Section title | `text-lg font-heading font-medium` |
| Card title | `text-sm font-heading font-semibold` |
| Body text | `text-sm font-body leading-relaxed` |
| Meta / kicker | `text-[11px] font-heading uppercase tracking-[0.12em]` |

### Shared Surface Classes
Defined in [globals.css](/Users/antoniobaltic/Desktop/apps/laufbahn/src/app/globals.css).

| Class | Purpose |
|---|---|
| `app-frame` | Global shell/background wrapper |
| `surface-panel` | Frosted, elevated panel for shell/grouped sections |
| `surface-card` | Default premium card surface |
| `surface-muted` | Softer inset section for helper areas/forms |
| `interactive-lift` | Subtle hover lift + shadow refinement |
| `fade-in-up` | Gentle entry animation for major surfaces |
| `skeleton-sheen` | Premium loading skeleton treatment |

### Shadows
| Token | Usage |
|---|---|
| `shadow-card` | Default card shadow |
| `shadow-card-hover` | Hover/interactive elevation |
| `shadow-dialog` | Dialogs and menus |
| `shadow-floating` | Toasts and large elevated overlays |

## Motion & Interaction

### Motion Rules
- Standard transitions: `180ms` to `220ms`.
- Card hover lift: around `-2px`, never more.
- Dialogs and toasts use soft fade / rise, not springy motion.
- Respect `prefers-reduced-motion`.
- Motion should communicate hierarchy or state change, not decorate every element.

### Interaction Rules
- Primary actions use filled buttons; secondary actions use bordered or ghost styles.
- Desktop hover affordances must remain legible on touch devices without hover.
- Interactive rows/cards should feel clickable through contrast, shadow, and icon movement.
- Inline editors must show explicit save/cancel affordances.
- Every mutation that changes meaningful user context should confirm via toast.

## Responsiveness

### Layout Rules
- App shell content max width: `1520px`.
- Marketing/auth container max width: `6xl`.
- Grid layouts should collapse intentionally: no awkward half-empty columns on tablet.
- Detail pages move from split layout to a clean single-column stack below `xl`.
- Board keeps intentional horizontal scroll; this is one of the few acceptable horizontal-overflow areas.

### Board Rules
- Column width is responsive: `w-[min(84vw,320px)]` on small screens, `300-320px` on larger screens.
- Board scroll area should use snap behavior for mobile comfort.
- Drop targets must visibly react on drag-over.
- Avoid CSS that interferes with DnD behavior, especially global smooth scrolling.

### Mobile Rules
- Sticky topbar remains minimal and readable.
- Mobile nav is a designed overlay panel, not a raw off-canvas list.
- Buttons should stay finger-friendly and rounded.
- Form sections stay single-column by default on small screens.
- Critical navigation actions such as “Zur Übersicht” and “Zum Board” should remain near the top.

## Forms & Data Entry
- Break long forms into named sections with short helper copy.
- Use inline duplicate hints instead of blocking too early.
- Textareas in detail workflows should default to a usable height (`4-7` rows depending on task).
- Placeholder text should be concrete and relevant to DACH job searching.
- Error text should be short, specific, and visually calm.

## Current UI Patterns

### Auth
- Two-panel composition on desktop: brand/value panel left, auth card right.
- Mobile collapses to a centered premium card with preserved brand cues.

### App Shell
- Frosted sidebar on desktop.
- Glassy sticky topbar with route context, notification center, and compact account control.
- Route metadata in the topbar should explain the current surface in one sentence.
- Notifications should feel like calm prioritization, not noisy alerts: concise copy, urgency chips, direct links back into detail pages.
- Positive milestones such as `angebot` should feel elevated through restrained celebration, not loud arcade-style effects.

### Board
- Header with kicker, title, helper copy, and clear CTA.
- Metric cards above the board.
- Board area wrapped in `surface-panel`.
- Empty board still shows the structure of the workflow.

### Application Detail Workspace
- Hero section with company, role, context, and quick metrics.
- Dedicated status editor card.
- Dedicated workflow card for interviews and deadlines.
- Timeline as the narrative spine.
- Notes, contacts, and documents are first-class, editable cards.
- Contacts should support a clear primary-contact workflow and preserve quick mail/phone/profile actions.
- Documents should expose an at-a-glance readiness check so the workspace feels actionable, not archival.
- Deadlines and interview planning should feel reminder-ready: dates, context, and prep notes live in structured fields, not only in free text.
- Any user-visible detail mutation should revalidate board + list + detail and log activity where relevant.

### Reminder Rules
- Reminders are derived from structured application fields, not manually created notification records.
- The topbar bell is the global entry point for reminders.
- Current reminder sources are:
  - upcoming deadlines
  - upcoming interviews
  - stale applications in `beworben` that likely need a follow-up
- Reminders should link straight into the affected application detail page.
- When board interactions change server-derived reminder state, the shell must refresh so counts stay honest.

### Date Handling Rules
- Do not parse stored app dates with bare `new Date(value)` in UI or reminder logic.
- Use shared helpers from [dates.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/dates.ts).
- `deadline` is a date-only field and must be treated as a local calendar day, not a UTC timestamp.
- Relative labels such as `heute`, `morgen`, and `in 2 Tagen` should come from the shared date helper layer so reminder and workflow states stay consistent.
- Analytics and reminder calculations should share the same date helper layer so dashboards and workspaces never disagree about urgency.

### Analytics Rules
- `/analytics` is a real app surface, not a placeholder.
- The analytics page should stay readable without chart libraries; use native layout, bars, ratios, and card composition first.
- Insights should prioritize actionability over novelty: funnel progression, response rate, reminder pressure, and workspace hygiene are more valuable than vanity metrics.
- Empty analytics states should still explain what data will appear later and link back to the board.
- Monthly momentum views should compress well to tablet/mobile without becoming illegible.

### Celebration Rules
- `angebot` is the one status transition that deserves explicit celebration.
- Celebration should be warm and premium: subtle particles, glow, and copy, never loud confetti spam.
- The same celebration treatment should trigger from both detail status edits and board drag-and-drop.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── anmelden/page.tsx
│   │   ├── registrieren/page.tsx
│   │   └── auth/callback/route.ts
│   └── (app)/
│       ├── layout.tsx
│       ├── app-shell.tsx
│       ├── analytics/
│       │   ├── page.tsx
│       │   └── loading.tsx
│       ├── board/
│       │   ├── page.tsx
│       │   └── loading.tsx
│       └── bewerbung/
│           ├── page.tsx
│           ├── loading.tsx
│           └── [id]/
│               ├── page.tsx
│               └── not-found.tsx
├── components/
│   ├── analytics/
│   │   └── analytics-dashboard.tsx
│   ├── application/
│   │   ├── activity-timeline.tsx
│   │   ├── application-contacts-card.tsx
│   │   ├── application-detail-view.tsx
│   │   ├── application-documents-card.tsx
│   │   ├── application-list-card.tsx
│   │   ├── application-notes-card.tsx
│   │   ├── application-status-editor.tsx
│   │   └── status-pill.tsx
│   ├── board/
│   │   ├── add-application-dialog.tsx
│   │   ├── column-header.tsx
│   │   ├── kanban-board.tsx
│   │   ├── kanban-card.tsx
│   │   └── kanban-column.tsx
│   ├── company/
│   │   └── company-logo.tsx
│   ├── celebration/
│   │   └── offer-celebration-provider.tsx
│   ├── layout/
│   │   ├── notification-center.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── empty-state.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── textarea.tsx
│       └── toast.tsx
├── actions/
│   └── applications.ts
├── hooks/
│   └── use-kanban.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils/
│       ├── applications.ts
│       ├── analytics.ts
│       ├── cn.ts
│       ├── constants.ts
│       ├── dates.ts
│       ├── reminders.ts
│       └── url.ts
└── types/
    ├── analytics.ts
    ├── activity.ts
    ├── application-detail.ts
    ├── application.ts
    ├── kanban.ts
    └── reminder.ts
```

## Key Patterns

### Authentication Flow
1. Supabase SSR with cookie-based sessions.
2. `middleware.ts` refreshes the session cookie.
3. Protected routes live under `/(app)`.
4. Server components always call `supabase.auth.getUser()`.
5. Signup still uses email confirmation via Supabase auth callback.

### Server Actions
All application-related reads and mutations live in [applications.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/actions/applications.ts).

Current responsibilities:
- `getApplications()`
- `getAnalyticsSnapshot()`
- `getNotificationReminders()`
- `getApplicationById()`
- `getApplicationActivities()`
- `getApplicationContacts()`
- `getApplicationDocuments()`
- `createApplication()`
- `updateApplicationStatus()`
- `updateApplicationStatusFromDetail()`
- `updateApplicationNotes()`
- `updateApplicationDeadline()`
- `updateApplicationInterview()`
- `reorderApplications()`
- `createApplicationContact()`
- `updateApplicationContact()`
- `deleteApplicationContact()`
- `createApplicationDocument()`
- `updateApplicationDocument()`
- `deleteApplicationDocument()`
- `deleteApplication()`

Every meaningful detail mutation should:
- validate auth ownership
- mutate Supabase
- insert timeline activity when the user would expect a narrative record
- `revalidatePath` for `/board`, `/bewerbung`, and `/bewerbung/[id]`

Board-specific rule:
- Because the shell reminders are server-derived, board mutations should trigger a refresh after persistence so topbar reminder state stays aligned.
- Board moves into `angebot` should also trigger the shared celebration treatment after a successful server write.

### Timeline Rules
- `status_change` still comes from the database trigger.
- `note_added`, `deadline_set`, `interview_scheduled`, `contact_added`, `contact_updated`, `document_uploaded`, and `document_updated` are created in server actions.
- The UI also synthesizes a first “Eintrag erstellt” timeline item from the application row.

### Reminder Pattern
- `buildReminderNotifications()` in [reminders.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/reminders.ts) is the single source of truth for in-app reminders.
- Reminder urgency is intentionally coarse: `high`, `medium`, `low`.
- The notification center currently displays a capped visible list but counts all derived reminders.
- Reminder queries should only select fields that the derivation logic actually needs.

### Analytics Pattern
- `buildAnalyticsSnapshot()` in [analytics.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/analytics.ts) is the single source of truth for analytics aggregation.
- Analytics currently depend on `applications`, `activities`, `application_contacts`, and `application_documents`; no separate analytics table exists.
- Keep analytics derivation server-side so the page arrives rendered and the UI layer only concerns itself with presentation.

## Database Schema (Supabase)

### Project
- **Project ID:** `wqsndsezguuiryxgqcaj`
- **Region:** eu-west-1 (Frankfurt)
- **Plan:** Free tier
- **Status:** Active & healthy

### Migrations
- `00001_create_profiles.sql`
- `00002_create_applications.sql`
- `00003_create_activities.sql`
- `00004_create_application_detail_entities.sql`
- `00005_extend_activity_types_for_detail_workflows.sql`
- `00006_add_workflow_fields_to_applications.sql`

### Key Tables
- `profiles`
- `applications`
- `activities`
- `application_contacts`
- `application_documents`

### Table Roles
- `profiles` extends `auth.users`.
- `applications` stores the kanban item and detail record.
  - Includes structured workflow fields for deadline notes and upcoming interview planning.
- `activities` stores timeline events.
- `application_contacts` stores people tied to a specific application.
- `application_documents` stores linked document references per application.

### RLS Pattern
All app tables use `user_id = auth.uid()` ownership policies.

### Trigger Pattern
- `on_auth_user_created` auto-creates profiles.
- `on_application_status_change` logs status changes and stamps milestone dates.
- Contacts/documents/notes activity logging is currently handled in server actions, not triggers.

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://wqsndsezguuiryxgqcaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set in .env.local>
SUPABASE_SERVICE_ROLE_KEY=<set in .env.local>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commands
- `npm run dev`
- `npm run build`
- `npm run lint`

## Phase Status
- **Phase 1 ✅ COMPLETE** — foundation, auth, board, landing
- **Phase 2 ✅ COMPLETE** — scraper wiring, logos, duplicate detection
- **Phase 3 ✅ COMPLETE** — detail workspace, timeline, inline notes/status, contact/document workflows, interview/deadline planning
- **Phase 4 ✅ COMPLETE** — reminders, analytics, and restrained `angebot` celebration are now in place
- **Phase 5** — Stripe monetization
- **Phase 6** — Gmail integration
- **Phase 7** — final polish, legal pages, landing refinement

## Implementation Guardrails For Future Work
- Reuse the premium shell and surface classes before inventing new containers.
- New pages should start with a kicker, a clear title, and one line of explanatory copy.
- Prefer stacked, high-quality cards to crowded dashboards.
- If a new feature introduces mutation, decide whether it belongs in the timeline immediately.
- If a screen feels “fine” but visually bare, it is not finished.
