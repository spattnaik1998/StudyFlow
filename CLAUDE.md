# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build and start
npm run build
npm run start

# Lint check
npm lint

# No test suite configured yet
```

## Architecture Overview

**StudyFlow** is a superhuman student productivity app built on **Next.js 14** with a full-stack architecture combining task management, AI-powered planning, Pomodoro focus sessions, and spaced repetition learning.

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**:
  - Zustand (UI state: sidebar, view mode, command palette)
  - TanStack Query v5 (server state caching and synchronization)
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **AI**: OpenAI GPT-4o for task parsing, study planning, and daily briefs
- **Authentication**: Supabase Auth (email + Google OAuth)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit/core (Kanban board)

---

## Project Structure

```
app/
├── (auth)/                    # Auth routes (login, signup, password reset)
├── (app)/                     # Protected routes with sidebar layout
│   ├── dashboard/
│   ├── projects/              # Project CRUD, detail view
│   ├── tasks/                 # Task views (list, board, timeline, calendar)
│   ├── schedule/              # Weekly calendar with drag-drop blocks
│   ├── focus/                 # Pomodoro timer with analytics
│   ├── topics/                # Spaced repetition flashcards (SM-2 algorithm)
│   ├── analytics/             # Charts & stats dashboard
│   ├── settings/              # User preferences & profile
│   └── layout.tsx             # Wraps with sidebar + command palette
├── api/
│   └── ai/                    # OpenAI endpoints (parse tasks, generate plans, daily briefs)
└── layout.tsx & globals.css   # Root layout + design tokens (dark theme)

components/
├── ui/                        # shadcn components (button, card, dialog, input, etc.)
├── layout/                    # Sidebar, CommandPalette, AppLayoutClient
├── tasks/                     # Task form, list, board, kanban columns
├── projects/                  # Project form, grid, cards
├── focus/                     # FocusTimer, AmbientSounds, SessionComplete
├── topics/                    # TopicForm, TopicCard, MasteryBadge, ReviewSession
├── analytics/                 # StatCard, StudyHoursChart, MasteryRadar, etc.
├── schedule/                  # WeekCalendar, BlockForm
├── ai/                        # AITaskInput, DailyBrief, StudyPlanModal
└── landing/                   # Landing page components

hooks/
├── useCommandPalette.ts       # Cmd+K global listener
├── useTimer.ts                # 1-second interval timer for Pomodoro
└── useAmbientSound.ts         # Web Audio API for background sounds

lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client (@supabase/ssr)
│   ├── server.ts              # Server-side Supabase client (async)
│   └── middleware.ts          # Session refresh utility
├── openai.ts                  # OpenAI client singleton
├── sm2.ts                     # SM-2 spaced repetition algorithm (pure functions)
└── utils.ts                   # cn(), color constants, date formatting

stores/
├── useUIStore.ts              # Zustand: sidebarOpen, currentView, selectedProjectId, etc.
└── useFocusStore.ts           # Zustand: timer state, session data, localStorage sync

types/
├── database.ts                # Database entity types (Profile, Task, Project, etc.)
├── api.ts                     # API request/response types
└── ui.ts                      # UI-specific types

supabase/
└── schema.sql                 # PostgreSQL schema with RLS policies & triggers

middleware.ts                  # Route protection for /app/* paths
```

---

## Core Architectural Patterns

### 1. **Authentication & Route Protection**
- **Middleware** (`middleware.ts`): Protects `/app/*` routes by checking Supabase session
- **Supabase Auth**: Email + Google OAuth, JWT stored in cookies
- Auth pages: login, signup, forgot-password, update-password
- Unauthenticated users redirected to `/login`

### 2. **Data Fetching & State Management**

**Server-Side Data:**
- Use `createServerClient_()` (from `lib/supabase/server.ts`) in Server Components to fetch user data
- TanStack Query v5 wraps queries on Client Components via `QueryClientProvider`
- Example: Sidebar fetches profile with `useQuery` in AppLayoutClient

**Client-Side State:**
- **UI State** (Zustand): sidebarOpen, currentView (list/board/timeline/calendar), selectedProjectId, commandPaletteOpen
- **Optimistic Updates**: Task status changes use optimistic updates with immediate UI feedback before mutation completes

### 3. **Component Patterns**

**Server vs Client Components:**
- Root layout (`app/layout.tsx`) is Server Component
- `app/(app)/layout.tsx` is Server Component → renders AppLayoutClient (Client)
- AppLayoutClient wraps with QueryClientProvider, Sidebar, CommandPalette
- Most data-fetching pages are Server Components; interactive components are Client Components

**Form Handling:**
- React Hook Form + Zod validation
- Examples: TaskForm, ProjectForm, TopicForm, BlockForm in components/
- Forms read query params for AI suggestions (e.g., `?ai_query=...`)

**UI Components:**
- All shadcn components live in `components/ui/` (button, card, dialog, input, select, tabs, etc.)
- Use `cn()` utility (from `lib/utils.ts`) to merge Tailwind classes safely

### 4. **Database & RLS**
- All tables have **Row-Level Security (RLS)** enabled
- Users can only access their own data (policies check `auth.uid()`)
- Tables: profiles, user_preferences, projects, tasks, task_sessions, topics, topic_reviews, schedule_blocks, ai_insights
- Triggers: auto-create profile on signup, update timestamps, calculate session durations

### 5. **AI Integration**
- API routes in `app/api/ai/`:
  - `/ai/parse-task`: NL text → structured task JSON
  - `/ai/generate-plan`: topics + exam date → schedule_blocks
  - `/ai/daily-brief`: cached motivational brief + stats
- OpenAI client singleton in `lib/openai.ts`
- AITaskInput, StudyPlanModal components trigger these endpoints

### 6. **Focus Sessions & Pomodoro**
- `useFocusStore` manages timer state (work/break, remaining seconds)
- `useTimer` hook provides 1-second intervals with cleanup
- Sessions saved to `task_sessions` table + localStorage (max 50)
- AmbientSounds component provides background audio (rain, cafe, forest)
- SessionComplete captures quality rating (0-5) and optional journal entry

### 7. **Spaced Repetition (Topics)**
- SM-2 algorithm implementation in `lib/sm2.ts` (pure functions)
- Mastery levels: not_started → learning → familiar → proficient → mastered
- Topics review flow: view due items → answer (quality 0-5) → next interval calculated
- Review history stored in `topic_reviews` table with ease factor & interval tracking

### 8. **View Modes & Calendar**
- Tasks support multiple views: List (table), Board (Kanban), Timeline (roadmap), Calendar
- View state stored in Zustand (`useUIStore.currentView`)
- Schedule has WeekCalendar with drag-drop blocks (flex layout, not CSS grid)
- Time blocking: blocks positioned by start_time, height by duration

---

## Key Implementation Details

### Styling
- **Design Tokens**: CSS variables in `app/globals.css` for dark theme colors (background, foreground, card, etc.)
- **Tailwind**: Configured in `tailwind.config.ts` with custom animations (fade-up, fade-in, float, shimmer, gradient)
- **Components**: shadcn components use `cn()` utility to merge classes without conflicts

### Type Safety
- TypeScript strict mode enabled
- Database types auto-generated in `types/database.ts` (mirrors Supabase schema)
- API request/response types in `types/api.ts`
- UI-specific types (form inputs, modal states) in `types/ui.ts`

### Utilities
- `formatDate()`, `formatTime()`, `formatDateTime()`, `daysUntil()`, `formatDuration()` in `lib/utils.ts`
- Color constants: indigo, purple, pink, blue, cyan, emerald, amber, red, slate
- `cn()` function merges Tailwind classes safely using clsx + tailwind-merge

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

---

## Common Development Tasks

### Adding a New Feature Page
1. Create `app/(app)/feature/page.tsx` (Server Component)
2. If interactive, wrap with `"use client"` at component level
3. Use TanStack Query for data fetching: `useQuery()`
4. Import types from `types/database.ts`
5. Add Sidebar navigation link in `components/layout/Sidebar.tsx`
6. Add command palette item in `components/layout/CommandPalette.tsx`

### Creating a Form
1. Use React Hook Form + Zod for validation
2. See `components/tasks/TaskForm.tsx` or `components/projects/ProjectForm.tsx` as examples
3. Use shadcn form components from `components/ui/`
4. Handle submit with Supabase mutation using `useMutation()` from TanStack Query
5. Show toast feedback (consider using Supabase Realtime for immediate UI updates)

### Adding Database Table
1. Create table in `supabase/schema.sql` with proper RLS policies
2. Add TypeScript type in `types/database.ts`
3. Write TanStack Query hooks for fetch/create/update/delete operations
4. Add Supabase Row-Level Security policy ensuring users only see their own data

### Fetching Data in Server Components
```typescript
import { createServerClient_ } from "@/lib/supabase/server";
const supabase = await createServerClient_();
const { data, error } = await supabase.from("table_name").select("*");
```

### Fetching Data in Client Components
```typescript
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const { data, isLoading } = useQuery({
  queryKey: ["table_name"],
  queryFn: async () => {
    const supabase = createClient();
    const { data } = await supabase.from("table_name").select("*");
    return data;
  },
});
```

### Using Zustand Store
```typescript
import { useUIStore } from "@/stores/useUIStore";
const { sidebarOpen, toggleSidebar } = useUIStore();
```

---

## Important Notes

### Timezone Handling
- All dates stored in UTC in Supabase
- Use `new Date()` for local time calculations
- Be careful with `.toISOString()` when filtering (converts to UTC)
- Schedule blocks filter by local start_time, not UTC

### Performance
- TanStack Query handles caching and deduplication
- Optimistic updates improve UX for mutations
- Framer Motion animations use `will-change` sparingly
- Command palette (Cmd+K) uses `cmdk` library for fast search

### Auth Flow
- Middleware checks session on every request to `/app/*` routes
- Session refresh happens in middleware automatically
- Logout clears cookies via Supabase signOut()
- Password reset uses Supabase email link + token validation

### SM-2 Algorithm
- Ease factor: starts at 2.5, adjusts based on quality (0-5)
- Intervals: 1 day → 6 days → (previous_interval × ease_factor)
- Quality 4-5: interval increases; Quality 0-3: reset to 1 day
- Next review date = today + interval

---

## Testing & Deployment

**No test suite configured** — add Jest + React Testing Library if needed.

**Deployment**:
- Vercel: auto-deploys from main branch
- Environment variables must be set in Vercel project settings
- Build command: `npm run build`
- Start command: `npm run start`

---

## Debugging Tips

1. **Supabase Auth Issues**: Check browser DevTools → Application → Cookies for auth session
2. **RLS Errors**: Ensure RLS policies allow current user (auth.uid() matches user_id)
3. **TanStack Query**: React Query DevTools can help debug cache state
4. **Timezones**: Use browser console: `new Date().getTimezoneOffset()` to verify local TZ
5. **Build Issues**: Run `npm run lint` first, check Next.js `.next/` directory for cached errors

---

## File Organization Principles

- **Components**: Self-contained, reusable UI pieces with clear prop contracts
- **Hooks**: Custom React hooks for cross-cutting concerns (timers, command palette, etc.)
- **Utils**: Pure functions, no side effects (date formatting, color constants, etc.)
- **Stores**: Minimal Zustand stores (only UI state, not derived state)
- **Types**: Centralized in `types/` directory, mirrored from database schema
- **API**: Route handlers in `app/api/`, organized by feature (ai/, auth/, etc.)
