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

## Deployment Status
- Production is deployed on Vercel under project `laufbahn`.
- Current production domain is `https://laufbahn.vercel.app`.
- GitHub repo is `https://github.com/antoniobaltic/laufbahn`.
- The repo is linked to Vercel and production deploys from `main`.
- Supabase remains the only backend; no separate worker or custom server is in front of Vercel.

## Architecture Summary
- This is a server-first Next.js App Router application with thin client interactivity on top.
- Authentication, primary reads, and all meaningful mutations are handled through Supabase SSR and Next server actions.
- The board, detail workspace, reminder center, and analytics page all consume the same `applications` table as the canonical source of truth.
- Timeline history is split across:
  - database trigger-driven `status_change` events
  - server action-created narrative events for notes, contacts, documents, deadlines, and interviews
- Reminders and analytics are not stored as separate records. They are derived at read time from the current application and activity data.
- The app currently has no separate background worker, queue, cron pipeline, or notification delivery service.

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
- Responsive speed is part of the premium feel. The app should react quickly, avoid obvious layout shifts, and feel composed on slower devices.

### Simplicity First
- The product should feel simple for an average user on first contact, even when the underlying model is powerful.
- Complexity should be revealed progressively, not dumped into the first viewport or first interaction.
- The default path through the app should answer three questions immediately:
  - what needs attention now
  - what can I do next
  - where do I go for more detail
- If a feature is useful mainly for power users, keep it available but visually secondary until the user asks for it.
- The app should feel joyful and calm, not operationally impressive.

### Information Hierarchy Rules
- One page, one obvious job.
- First viewports should favor orientation and the next useful action over dense system summaries.
- Prefer three meaningful metrics over four to six weak ones.
- Remove explanatory chrome that only describes the system rather than helping the user act.
- If a section needs a paragraph to explain why it exists, reconsider the section.
- Empty cards should not open forms by default unless the task is impossible without immediate input.

### Progressive Disclosure Rules
- Forms should start with the minimum required fields and move secondary fields into optional sections.
- Empty states should invite the first useful action with one clear CTA.
- Contacts, documents, workflow planning, and similar “deeper” tools should stay collapsed or summary-first until the user chooses to edit.
- Rich detail should open after intent, not before intent.

### Do Not Regress
- No flat white pages with unstructured blocks.
- No default-looking forms or buttons.
- No global smooth-scroll behavior: it conflicts with `@hello-pangea/dnd`.
- No oversized, bouncy, playful animations. Motion should stay subtle and professional.
- No hidden destructive actions on touch-only layouts.
- No new UI that ignores existing `surface-*` and motion conventions.
- No implementation-language leaking into user-facing copy.
- No “status for status’ sake” badges, helper pills, or metrics that do not change user behavior.
- No empty-state screens that look like admin tools waiting for configuration.
- No blanket auto-prefetching of dense dynamic detail links that creates invisible route churn.
- No excessive blur, layered transparency, or shadow weight on mobile that makes the UI feel sluggish.

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
| Im Gespräch | `#b8a038` | `status-gespraech` |
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
- Route-level loading states should roughly match the eventual layout density so the app feels stable while data resolves.

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
- Treat mobile blur, transparency, and shadow as a limited budget. Prefer lighter glass treatments on small screens.

### Responsive Validation Rules
- Meaningful UI changes should be checked at minimum on:
  - phone-width around `390px`
  - tablet-width around `834px`
  - desktop-width around `1280px` and up
- Validate at least these surfaces when layout or navigation changes:
  - landing page
  - Übersicht / board
  - Bewerbungen list
  - application detail
  - Auswertung / analytics
- Look for more than breakage:
  - first-view clarity
  - scroll comfort
  - tap-target size
  - sticky-header behavior
  - whether any section feels visually heavier on mobile than it needs to

## Forms & Data Entry
- Break long forms into named sections with short helper copy.
- Use inline duplicate hints instead of blocking too early.
- Textareas in detail workflows should default to a usable height (`4-7` rows depending on task).
- Placeholder text should be concrete and relevant to DACH job searching.
- Error text should be short, specific, and visually calm.
- New-entry flows should default to the shortest believable path.
- Optional detail fields should be grouped under a calm “more details” affordance instead of appearing all at once.
- When a record has no contacts or documents yet, show a short explanation and one clear add action before rendering a full editor.
- The add dialog should support both:
  - job-link import
  - pasted job text import
- Text import should stay honest about branding limits: if no reliable company domain is known, fall back to a monogram instead of inventing a logo.

## Copy Rules

### Tone
- All German copy should sound natural, calm, and human. Avoid translated-product-manager German.
- Prefer clear everyday wording over startup, SaaS, PM, or systems language.
- Copy should feel confident and warm, not clever, technical, or self-important.

### User-Facing Vocabulary
- Prefer:
  - `Übersicht` over `Board`
  - `Auswertung` over `Analytics`
  - `Verlauf` over `Timeline`
  - `Stand` or `Bewerbungsstand` over `Status-Editor` language
  - `Nächster Schritt`, `Wichtig`, `Offen`, `Frist`, `Gespräch` over jargon like `Trigger`, `Funnel`, or `Workflow`
- Avoid exposing terms the user does not need:
  - `Kanban`
  - `Funnel`
  - `Workspace`
  - `Detailraum`
  - `Live mit Supabase verbunden`
  - `Trigger`
  - `Pipeline`, unless the surrounding copy is very clearly human and the term is genuinely useful

### Copy Guardrails
- Do not mention implementation details, backend vendors, or internal architecture in product copy.
- Do not label surfaces with category names the user would never say out loud.
- Buttons should describe what happens next in plain language.
- Helper text should explain why the field matters to the user, not how the system stores it.
- Empty states should reassure, orient, and point to the next action in one short paragraph.
- If German copy sounds like it was translated from English, rewrite it.

## Current UI Patterns

### Landing
- The landing page should sell relief and clarity in the first viewport, not enumerate the whole product.
- Hero copy should explain the benefit in natural German within one headline and one supporting sentence.
- Keep the hero visually anchored by one strong art direction, not a pile of equal-weight cards.
- Remove secondary product details, feature grids, or badges if they dilute the main promise.
- The default CTA path should feel obvious and low-friction on both desktop and mobile.
- Marketing sections below the fold should deepen trust and understanding, not repeat the same claim in noisier layouts.
- The landing page should support a future large running-track hero image without structural rewrites; use the dedicated CSS variable/background layer rather than hard-coding image assumptions into markup.
- Public marketing pages should render fully and stably. Avoid `content-visibility` tricks on landing/pricing sections if they create blank captures, unstable full-page rendering, or delayed painting.
- Proof should stay honest. Prefer product truths, workflow clarity, and prepared pricing over invented testimonials or vanity numbers.

### Pricing
- `/preise` is a public marketing page, not an app dashboard.
- Pricing should feel calm and legible: two clear plans, one comparison area, one explanation of what Premium adds.
- If billing is not live yet, say so plainly. Do not fake urgency, countdowns, or purchase CTAs that do nothing useful.
- On mobile, pricing comparisons should remain readable without horizontal scrolling as the primary experience.
- Premium messaging should sound prepared and trustworthy, never like a hard sell bolted onto the product later.

### Auth
- Two-panel composition on desktop: brand/value panel left, auth card right.
- Mobile collapses to a centered premium card with preserved brand cues.
- Auth copy should promise clarity and relief, not product mechanics.

### App Shell
- Frosted sidebar on desktop.
- Glassy sticky topbar with route context, notification center, and compact account control.
- Route metadata in the topbar should explain the current surface in one sentence.
- Do not repeat the same title/subtitle in both the topbar and the page hero on the main app tabs. For `/board`, `/bewerbung`, and `/analytics`, prefer a quieter utility topbar and let the page body carry the headline.
- Notifications should feel like calm prioritization, not noisy alerts: concise copy, urgency chips, direct links back into detail pages.
- Positive milestones such as `angebot` should feel elevated through restrained celebration, not loud arcade-style effects.
- Navigation should expose only what is currently useful. Do not show dormant product areas just because routes exist.
- The top-right account control is the entry point to `Profil & Einstellungen`.
- Profile presentation is intentionally simple:
  - initials avatar, no photo upload
  - customizable background color
  - clear display name
- User-facing shell labels should stay simple:
  - `/board` route is shown as `Übersicht`
  - `/analytics` is shown as `Auswertung`
- The shell should never describe the app in internal product terms.

### Board
- Header with kicker, title, helper copy, and clear CTA.
- Metric cards above the board.
- Small next-step prompts may sit above the board if they help the user decide what to do next.
- Board area wrapped in `surface-panel`.
- Empty board still shows the structure of the workflow.
- Treat the board as the calm “home” view, not as a methodology lesson.
- The user should understand it without seeing the word `Kanban`.
- Remove low-value badges like sync/vendor-state indicators.
- Keep the headline focused on “what’s happening with my applications now”.
- If drag-and-drop causes SSR hydration issues, prefer a client-only mount guard over noisy console/runtime regressions.

### Application Detail Workspace
- Hero section with company, role, context, and quick metrics.
- Dedicated status editor card.
- Dedicated workflow card for interviews and deadlines.
- Timeline as the narrative spine.
- Notes, contacts, and documents are first-class, editable cards.
- Imported job-posting content should be visible inside the detail view, not discarded after creation.
- Contacts should support a clear primary-contact workflow and preserve quick mail/phone/profile actions.
- Documents should expose an at-a-glance readiness check so the workspace feels actionable, not archival.
- Deadlines and interview planning should feel reminder-ready: dates, context, and prep notes live in structured fields, not only in free text.
- Any user-visible detail mutation should revalidate board + list + detail and log activity where relevant.
- Empty detail modules should stay summary-first. Do not auto-open editors for notes, contacts, documents, deadlines, or interviews just because there is no data yet.
- Contacts and documents should feel optional until the user needs them, not mandatory upfront complexity.
- Quick metrics in the hero should be immediately useful, not vanity counters.
- If requirements, benefits, or full posting text were imported, present them in a calm dedicated card such as `Aus der Ausschreibung`.

### Documents
- `/dokumente` is a first-class app surface for `Lebenslauf` and `Anschreiben`.
- User-facing language should stay plain:
  - `Dokument`
  - `Variante`
  - `Version`
  - `Verwendet in`
- Do not expose Git terms such as `branch`, `commit`, or `merge` in the UI.
- The default view should feel like a calm document library, not a developer tool.
- The default overview is flat and simple. Tree/hierarchy belongs behind an explicit `Erweiterte Ansicht`.
- The canonical stored source is Markdown.
- The default editing experience should feel like a writing workspace with live preview.
- Raw Markdown is an advanced mode, not the default.
- Version history should be easy to understand:
  - newest version first
  - clear `Aktuell` badge
  - restore creates a new current version instead of mutating old history
- Variant creation should start from an existing basis document and feel like `from this basis, make a tailored copy`.
- Overview cards must show practical signals:
  - latest version
  - tags
  - how often the document is already used
  - whether it has child variants
- The app should make it obvious that linking a document to a job freezes that exact version for that application.
- Preserve simplicity:
  - only `Lebenslauf` and `Anschreiben` in this global document system for now
  - keep portfolios, certificates, and work samples in the lighter per-application link section until a broader document model is intentionally designed

### Document Import Rules
- Supported imports are currently `PDF` and `DOCX`.
- The app converts uploads into Markdown immediately and stores only Markdown plus metadata.
- Do not persist original `PDF` or `DOCX` files in Supabase Storage or elsewhere on the server.
- Import must always remain review-first:
  - convert
  - show warnings when appropriate
  - let the user edit before saving
- DOCX import should prefer semantic conversion (`mammoth`-style HTML -> Markdown), not layout cloning.
- PDF import is text-first and inherently lossy. The copy and UX should be honest about that.
- Because import quality varies by source file, the user should always be able to correct the result in the editor before it becomes a saved version.

### Reminder Rules
- Reminders are derived from structured application fields, not manually created notification records.
- The topbar bell is the global entry point for reminders.
- Reminder windows respect profile defaults from `profiles.deadline_reminder_days` and `profiles.interview_reminder_hours`.
- Current reminder sources are:
  - upcoming deadlines
  - upcoming interviews
  - stale applications in `beworben` that likely need a follow-up
- Reminders should link straight into the affected application detail page.
- When board interactions change server-derived reminder state, the shell must refresh so counts stay honest.

### Next-Step Prompt Rules
- Smart next-step prompts are assistive, not noisy.
- They should answer: `What is the most sensible next action right now?`
- Keep them to a small capped set on the board.
- Good prompt triggers:
  - `Vor X Tagen beworben. Nachfassen einplanen?`
  - `Gespräch morgen. Vorbereitung ergänzen?`
  - `Frist in 2 Tagen. Nächsten Schritt festhalten?`
- The copy should sound natural in German and never like system alerts or CRM automation.
- Prompts should link directly into the affected application detail page.
- Prompt timing should stay aligned with reminder defaults where that makes sense.

### Undo Rules
- Destructive or trust-sensitive actions should offer a calm `Rückgängig` affordance when technically feasible.
- Current undo surfaces include:
  - deleting an application
  - deleting a contact
  - deleting a document
  - changing application status
  - accepting an imported contact during application creation
- If an undo toast is shown, do not immediately force a route refresh that wipes out the toast before the user can react.
- Undo should restore real data integrity, not only optimistic UI state. If timeline or milestone side effects were created, clean them up as part of the undo path where practical.

### Profile & Settings Rules
- `Profil & Einstellungen` is a real app surface under `/einstellungen`.
- The page currently owns:
  - display name
  - email display
  - initials-avatar background color
  - deadline reminder lead time
  - interview reminder lead time
- Settings copy should stay calm and personal, not technical.
- Profile settings should update both the page itself and the compact shell account control.

### Date Handling Rules
- Do not parse stored app dates with bare `new Date(value)` in UI or reminder logic.
- Use shared helpers from [dates.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/dates.ts).
- `deadline` is a date-only field and must be treated as a local calendar day, not a UTC timestamp.
- Relative labels such as `heute`, `morgen`, and `in 2 Tagen` should come from the shared date helper layer so reminder and workflow states stay consistent.
- Analytics and reminder calculations should share the same date helper layer so dashboards and workspaces never disagree about urgency.
- `next_interview_at` must be formatted and normalized through the shared date helper layer with a fixed DACH timezone so local dev, Vercel SSR, and browser hydration never disagree about wall-clock interview times.

### Analytics Rules
- `/analytics` is a real app surface, not a placeholder.
- The analytics page should stay readable without chart libraries; use native layout, bars, ratios, and card composition first.
- Insights should prioritize actionability over novelty: funnel progression, response rate, reminder pressure, and workspace hygiene are more valuable than vanity metrics.
- Empty analytics states should still explain what data will appear later and link back to the board.
- Monthly momentum views should compress well to tablet/mobile without becoming illegible.
- Analytics should read like guidance, not an internal ops dashboard.
- The first screen of analytics should answer:
  - how many applications are active
  - where responses are happening
  - what needs attention next
- Prefer plain labels like `Auswertung`, `Rückmeldungen`, `Offene Aufgaben`, and `Fortschritt`.
- Avoid overloading the first fold with too many metrics, percentages, or framework-like terminology.
- If a chart-like section requires too much reading effort, simplify the labels before adding more visuals.

### Celebration Rules
- `angebot` is the one status transition that deserves explicit celebration.
- Celebration should be warm and premium: subtle particles, glow, and copy, never loud confetti spam.
- The same celebration treatment should trigger from both detail status edits and board drag-and-drop.
- Celebration copy should acknowledge the moment without sounding gimmicky or self-aware.

### Monetization Direction
- Monetization should layer onto the existing premium workspace, not feel like a bolted-on paywall.
- Pricing and upgrade moments should appear as polished product surfaces with calm rationale and clear plan differences.
- Free-tier limits should be understandable inside the flow where they matter, not only on a billing page.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── preise/page.tsx
│   ├── globals.css
│   ├── api/
│   │   ├── documents/import/route.ts
│   │   └── scraper/route.ts
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
│       ├── dokumente/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       ├── loading.tsx
│       │       └── not-found.tsx
│       ├── einstellungen/
│       │   └── page.tsx
│       └── bewerbung/
│           ├── page.tsx
│           ├── loading.tsx
│           └── [id]/
│               ├── page.tsx
│               ├── loading.tsx
│               └── not-found.tsx
├── components/
│   ├── marketing/
│   │   ├── faq-list.tsx
│   │   ├── marketing-footer.tsx
│   │   ├── marketing-header.tsx
│   │   ├── pricing-cards.tsx
│   │   └── track-showcase.tsx
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
│   │   ├── application-workflow-card.tsx
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
│   ├── documents/
│   │   ├── document-create-dialog.tsx
│   │   ├── document-editor.tsx
│   │   ├── documents-dashboard.tsx
│   │   ├── document-workspace.tsx
│   │   └── markdown-preview.tsx
│   ├── layout/
│   │   ├── notification-center.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── next-step/
│   │   └── next-step-prompts-card.tsx
│   ├── settings/
│   │   └── profile-settings-form.tsx
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
│   ├── applications.ts
│   ├── documents.ts
│   └── profile.ts
├── hooks/
│   └── use-kanban.ts
├── lib/
│   ├── documents/
│   │   └── import.ts
│   ├── scraper/
│   │   └── index.ts
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
│       ├── documents.ts
│       ├── next-steps.ts
│       ├── profile.ts
│       ├── reminders.ts
│       └── url.ts
├── middleware.ts
├── vercel.json
├── package.json
└── types/
    ├── analytics.ts
    ├── activity.ts
    ├── application-detail.ts
    ├── application.ts
    ├── kanban.ts
    ├── next-step.ts
    ├── document.ts
    ├── profile.ts
    └── reminder.ts
```

## Key Patterns

### Authentication Flow
1. Supabase SSR with cookie-based sessions.
2. `middleware.ts` refreshes the session cookie.
3. Protected routes live under `/(app)`.
4. Server components always call `supabase.auth.getUser()`.
5. Signup still uses email confirmation via Supabase auth callback.
- Public-facing routes that should react to an existing session, especially `/`, `/anmelden`, and `/registrieren`, must also check auth server-side instead of relying only on middleware. If a signed-in user lands there, send them straight to `/board`.

### Client / Server Boundary
- Server components own data loading for app routes wherever possible.
- Client components are used for drag-and-drop, dialogs, inline editing, notifications, and celebratory UI.
- `src/actions/applications.ts` is the main mutation boundary and should stay the central place for application-domain writes.
- Shared derivation logic belongs in `src/lib/utils`, not duplicated inside components.
- If a new feature needs privileged backend behavior beyond the authenticated user session, it should use `SUPABASE_SECRET_KEY` server-side only.

### Performance & Perceived Speed
- Premium here means not only visual polish but also low-friction rendering, stable layout, and fast-feeling route transitions.
- Overview routes should fetch overview-shaped data only. Do not `select("*")` for board/list surfaces when the UI renders a much smaller field set.
- Dense repeated links to dynamic detail routes should usually use `prefetch={false}` to avoid unnecessary RSC/network churn.
- Detail workspaces should prefer a shared server-side fetch path that authenticates once and loads related entities in parallel.
- Major app surfaces should have `loading.tsx` coverage when the route can take a noticeable moment to render.
- Skeleton states should mirror the final layout closely enough to reduce perceived jumpiness and CLS.
- Use deferred rendering patterns only for below-the-fold or clearly secondary sections. Do not apply them to primary interactive surfaces such as the board itself.
- Keep visual effects performant:
  - lighter backdrop blur on mobile
  - restrained shadow stacking
  - no decorative motion that delays interaction or first paint

### Vercel Deployment Pattern
- Vercel is the canonical hosting target for this app.
- `main` is the production deployment branch.
- Keep `middleware.ts` compatible with Vercel production builds.
- The project currently uses `npm run vercel-build`, which maps to `next build --webpack`.
- Do not remove that Webpack build override casually. It was added to stabilize a real production `MIDDLEWARE_INVOCATION_FAILED` issue on Vercel.
- `vercel.json` currently stays intentionally small; avoid speculative config churn there.

### Server Actions
All application-related reads and mutations live in [applications.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/actions/applications.ts).

Current responsibilities:
- `getApplications()`
- `getAnalyticsSnapshot()`
- `getNextStepPrompts()`
- `getNotificationReminders()`
- `getApplicationById()`
- `getApplicationWorkspace()`
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
- `restoreApplicationSnapshots()`
- `undoImportedContactCreation()`
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

Import rule:
- `createApplication()` may persist imported recruiter/contact context during creation when the scraper found a clear human contact. Do not ask the user to re-enter information the scraper already extracted reliably.
- If an imported contact is created automatically, the user should get a short-lived `Rückgängig` path instead of being forced to edit manually afterward.

Board-specific rule:
- Because the shell reminders are server-derived, board mutations should trigger a refresh after persistence so topbar reminder state stays aligned.
- If a board mutation offers undo via toast, it is acceptable to delay that refresh until the undo window closes so the toast stays actionable.
- Board moves into `angebot` should also trigger the shared celebration treatment after a successful server write.

Read-path rule:
- If the detail page needs the application plus related activity, contacts, and documents together, prefer the combined workspace loader over separate auth/client setup per query.

### Document Actions
Global document-library reads and mutations live in [documents.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/actions/documents.ts).

Current responsibilities:
- `getDocumentsOverview()`
- `getDocumentWorkspace()`
- `getDocumentPickerOptions()`
- `getApplicationSourceDocuments()`
- `createSourceDocument()`
- `saveSourceDocumentVersion()`
- `restoreSourceDocumentVersion()`
- `linkSourceDocumentToApplication()`
- `unlinkSourceDocumentFromApplication()`

Document-action rules:
- every document write must validate auth ownership
- document metadata (`title`, `tags`) and immutable versions are separate concerns
- creating or restoring a version must update the document’s `current_version_id`
- linking a document to an application must snapshot the exact version content into the application link row
- document/application linking should revalidate both `/dokumente` and the affected application detail route
- if a document link affects application-level context, it should create timeline activity in the application flow

### Timeline Rules
- `status_change` still comes from the database trigger.
- `note_added`, `deadline_set`, `interview_scheduled`, `contact_added`, `contact_updated`, `document_uploaded`, and `document_updated` are created in server actions.
- Fixed-document removals from `Dokumente` should currently reuse `document_updated` with metadata that marks the removal, unless and until the database schema introduces a dedicated activity type.
- The UI also synthesizes a first “Eintrag erstellt” timeline item from the application row.

### Reminder Pattern
- `buildReminderNotifications()` in [reminders.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/reminders.ts) is the single source of truth for in-app reminders.
- Reminder urgency is intentionally coarse: `high`, `medium`, `low`.
- The notification center currently displays a capped visible list but counts all derived reminders.
- Reminder queries should only select fields that the derivation logic actually needs.
- There is currently no persisted notification table and no email/push delivery path.
- Reminder derivation should respect user-level lead-time defaults from the profile row.

### Next-Step Pattern
- `buildNextStepPrompts()` in [next-steps.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/next-steps.ts) is the single source of truth for board-level next-step prompts.
- Prompt generation is derived from the same structured application data as reminders; do not invent separate prompt tables.
- Prompts should remain capped and relevance-sorted so the board never turns into a notification feed.

### Analytics Pattern
- `buildAnalyticsSnapshot()` in [analytics.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/lib/utils/analytics.ts) is the single source of truth for analytics aggregation.
- Analytics currently depend on `applications`, `activities`, `application_contacts`, `application_documents`, and `application_source_documents`; no separate analytics table exists.
- Keep analytics derivation server-side so the page arrives rendered and the UI layer only concerns itself with presentation.
- Keep analytics lightweight and explainable; no chart library has been introduced yet.

### Document Library Pattern
- The logical document and its immutable versions are stored separately:
  - `source_documents` = the user-facing document entry / basis / variant node
  - `source_document_versions` = immutable Markdown snapshots
  - `application_source_documents` = exact version snapshots used in a specific application
- `source_documents.parent_document_id` expresses variant hierarchy.
- `source_documents.current_version_id` points to the current active version.
- `source_document_versions.source_version_id` records lineage for restores and variants.
- Application links must snapshot:
  - document title
  - version number / label
  - markdown content
- Application detail should show two document concepts side by side:
  - fixed CV / cover-letter snapshots from `Dokumente`
  - lighter additional links in `application_documents`
- The document workspace must explain the current relationship clearly above the fold:
  - basis vs variant
  - current version
  - where it came from
  - where it is already used
- The default document editing surface is guided writing plus live preview.
- Raw Markdown is an advanced mode, not the default first impression.
- Switching guided vs raw editing is a persisted preference for the current document and should not require a new content version on its own.
- Import mode must not let the user save accidentally before the selected file has actually been converted.
- If a selected basis becomes invalid because the user changes document type, clear the basis selection in the UI before submit instead of surfacing a server error.
- The import route at `/api/documents/import` is authenticated and Node-runtime only.
- The import pipeline is intentionally lightweight and local to the request:
  - accept file
  - convert to Markdown
  - return result to the UI
  - do not persist original upload

### Scraper Pattern
- The job scraper lives behind [route.ts](/Users/antoniobaltic/Desktop/apps/laufbahn/src/app/api/scraper/route.ts) and requires an authenticated user session.
- The scraper is best-effort and intentionally lightweight:
  - supports both URL import and pasted-text import
  - tries `JobPosting` JSON-LD first
  - then domain-specific DOM extraction where that meaningfully improves results
  - then Open Graph/meta tags
  - then a generic HTML/text fallback
- It uses `fetch` plus `cheerio`, not a headless browser.
- Expect some job sites to fail because of anti-bot measures, JS-only rendering, or unusual markup.
- Scraped data is assistive input for the add dialog, not a guaranteed normalized ingestion pipeline.
- Scraper priorities:
  - company name
  - role title
  - location
  - salary note / range
  - recruiter/contact if clearly named
  - company branding
  - requirements
  - benefits
  - full posting text
- Prefer company branding from structured company data or company-specific assets, not the job-board favicon.
- If the source is a job board and the company site is known, prefer the company site for branding fallback.
- For salary:
  - keep annual min/max when the source clearly exposes a yearly range
  - otherwise store a human-readable `salary_note` such as `ab 3.500 € / Monat`
  - do not pretend a monthly collective-agreement minimum is an annual range
- For recruiter extraction:
  - create a contact only when a real person is clearly present
  - ignore vague HR labels or unrelated page chrome
- LinkedIn guest pages currently need DOM heuristics because public pages do not consistently expose usable `JobPosting` JSON-LD.
- Pasted text can recover salary, contact, benefits, and full text reasonably well, but logo quality depends on whether a trustworthy company domain or website is available.
- For pasted text, infer role, company, and location from the first meaningful lines before scanning the body:
  - line 1 is usually the role
  - line 2 is often the company
  - line 3 may be a plain location such as `Graz` or `Wien`, even without a `Standort:` prefix

### Deployment Guardrails
- If Vercel prod breaks while local dev still works, check middleware and build-runtime differences first.
- Treat `laufbahn.vercel.app` as the production smoke-test URL after every deployment-sensitive change.
- Keep server-only Supabase credentials in non-public env vars only.
- Prefer the modern `SUPABASE_SECRET_KEY` naming. Do not reintroduce `SUPABASE_SERVICE_ROLE_KEY` unless there is a concrete compatibility reason.
- Supabase security-definer functions must set an explicit immutable `search_path`.
- Database extensions should live in `extensions`, not `public`, unless there is a concrete exception.
- Leaked-password protection is a Supabase Auth project setting, not app code. If the advisor flags it, enable it in Supabase project auth settings or via a management API path with proper project auth; repo changes alone do not clear that warning.

## Release Validation
- After meaningful UI, copy, or routing changes, run:
  - `npm run lint`
  - `npm run build`
  - `npm run vercel-build`
- Validate important surfaces in a real browser, not only by reading code:
  - landing page
  - board / Übersicht
  - Bewerbungen list
  - Dokumente overview
  - document workspace
  - application detail
  - analytics / Auswertung
- Use Playwright for smoke tests and keep screenshots for at least one desktop and one mobile pass when the UI changes materially.
- After performance-sensitive changes, inspect browser console and network behavior on dense routes such as the board to catch avoidable prefetch/request floods.
- After pushing `main`, confirm the production deployment on `https://laufbahn.vercel.app` shows the new copy and layout, not only that the URL loads.
- Clean up any disposable test users or seed data created for browser validation once checks are complete.

### Known Quirks And Constraints
- `@hello-pangea/dnd` is sensitive to scroll behavior. Do not reintroduce global smooth scrolling or nested droppable scroll containers.
- Date-only values such as `deadline` must stay on the shared date helper path. Bare `new Date(string)` calls in UI logic are a regression risk.
- Board state is optimistic in the client, then reconciled via server write plus `router.refresh()`.
- When an undo toast is active, prefer delaying the reconciliation refresh rather than erasing the undo affordance immediately.
- The reminder count in the shell is server-derived, so board mutations must refresh the shell after persistence.
- Documents are currently metadata records with URLs. There is no Supabase Storage upload pipeline yet.
- The new global document library stores Markdown only. Original uploaded files are intentionally not retained.
- PDF and DOCX import quality depends on the source file structure; the review/edit step is mandatory product behavior, not optional polish.
- Markdown preview must style tables, code blocks, and long imported content cleanly. Imported documents should never feel like raw developer output.
- Contacts and documents are first-class detail entities, but they are still relational records inside the same core app flow, not separate modules.
- `/einstellungen` is now implemented. Keep it behind the authenticated app shell.
- The Supabase secret key is configured for future privileged backend work, but the current MVP primarily runs on user-session auth and RLS.
- Production stability on Vercel currently depends on `npm run vercel-build` using Webpack.
- In development, `@hello-pangea/dnd` can produce hydration/setup noise if drag-and-drop SSR markup differs. Keep the board’s DnD layer behind a client-only mount guard if needed.

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
- `00007_add_company_branding_to_applications.sql`
- `00008_add_profile_preferences.sql`
- `00009_add_profile_insert_policy.sql`
- `00010_create_source_documents.sql`
- `00011_harden_database_security.sql`

### Key Tables
- `profiles`
- `applications`
- `activities`
- `application_contacts`
- `application_documents`
- `source_documents`
- `source_document_versions`
- `application_source_documents`

### Table Roles
- `profiles` extends `auth.users`.
- `applications` stores the kanban item and detail record.
  - Includes structured workflow fields for deadline notes and upcoming interview planning.
  - Also stores imported company-branding and posting-content metadata such as company website/logo plus requirements/benefits text.
- `activities` stores timeline events.
- `application_contacts` stores people tied to a specific application.
- `application_documents` stores linked document references per application.
- `source_documents` stores the logical CV / cover-letter entries, including basis vs variant relationships.
- `source_document_versions` stores immutable Markdown versions for those entries.
- `application_source_documents` stores the exact document-version snapshot used in an application.

### Data Model Conventions
- `applications.status` is the workflow source of truth for board columns and most high-level product states.
- `position_in_column` controls board ordering inside each status.
- Milestone dates such as `date_applied`, `date_interview`, and `date_offer` are part workflow history, part analytics input.
- `deadline` is a date-only value.
- `next_interview_at` is a date-time value and should be treated differently from `deadline`.
- `application_documents` currently represents links and metadata, not binary file uploads.
- `source_documents` is the canonical document library source for `Lebenslauf` and `Anschreiben`.
- `source_document_versions` is append-only in spirit: restoring history creates a new current version instead of rewriting old rows.
- `application_source_documents` freezes the exact document version used for a job application, even if the source document evolves later.

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
SUPABASE_SECRET_KEY=<set in .env.local>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` is configured in `production`, `preview`, and `development`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is configured in `production`, `preview`, and `development`.
- `NEXT_PUBLIC_APP_URL` is configured in `production`, `preview`, and `development`.
- `SUPABASE_SECRET_KEY` is configured in `production`, `preview`, and `development`.
- `SUPABASE_SECRET_KEY` is server-only. Never expose it via a `NEXT_PUBLIC_*` variable.

## Commands
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run vercel-build`

## Testing Reality
- There is currently no dedicated unit or integration test suite in the repo.
- The practical verification stack right now is:
  - `npm run lint`
  - `npm run build`
  - `npm run vercel-build` for deployment-sensitive checks
  - Playwright/manual browser verification for product flows and responsive UI
  - Supabase MCP checks when validating persisted data or activity logging
- When changing UI/UX, prefer Playwright plus screenshots on desktop and mobile over assuming layout quality.
- When changing server actions or status transitions, verify both UI behavior and the resulting Supabase rows/activities.

## Phase Status
- **Phase 1 ✅ COMPLETE** — foundation, auth, board, landing
- **Phase 2 ✅ COMPLETE** — scraper wiring, logos, duplicate detection
- **Phase 3 ✅ COMPLETE** — detail workspace, timeline, inline notes/status, contact/document workflows, interview/deadline planning
- **Phase 4 ✅ COMPLETE** — reminders, analytics, and restrained `angebot` celebration are now in place
- **Phase 5** — Stripe monetization
- **Phase 6** — Gmail integration
- **Phase 7** — final polish, legal pages, landing refinement

## Current Next Step
- The current product-development priority is **Phase 5: Stripe monetization**.
- Start with pricing, plan limits, and upgrade surfaces that fit the existing premium product language before wiring full billing flows.
- Keep free-tier behavior legible in-product: limit messaging should feel calm and high-end, not naggy.
- Any monetization UI must match the existing Anthropic-inspired premium system and work cleanly on mobile.
- After monetization, the next planned platform step is **Phase 6: Gmail integration**.

## Implementation Guardrails For Future Work
- Reuse the premium shell and surface classes before inventing new containers.
- New pages should start with a kicker, a clear title, and one line of explanatory copy.
- Prefer stacked, high-quality cards to crowded dashboards.
- If a new feature introduces mutation, decide whether it belongs in the timeline immediately.
- If a screen feels “fine” but visually bare, it is not finished.
- If a screen feels “rich” but cognitively heavy, it is also not finished.
- Before adding UI, ask whether the same capability can be presented in a calmer default state with more detail hidden behind intent.
- Future monetization surfaces must respect the simplicity-first rules above: clear value, low pressure, no nagging language, no clutter.
