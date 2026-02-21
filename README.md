# StudyFlow 📚

> **Superhuman Student Productivity Platform**

An AI-powered task management and study planning application designed to help students master their courses through intelligent scheduling, spaced repetition learning, and focus sessions.

## Features (In Development)

### Phase 1: Foundation ✅
- User authentication (Email + Google OAuth)
- Supabase database with PostgreSQL
- Row-level security for data privacy
- TypeScript type safety

### Phase 2: Projects Management ✅
- Create and manage courses/subjects
- Customizable colors and emojis
- Track exam dates, instructors, credit hours
- Project detail pages with statistics

### Phase 3: Task Management ✅
- List view with sorting and filtering
- Kanban board with drag-and-drop
- Full CRUD operations
- Priority and status tracking
- Task templates and recurring tasks
- *(Timeline and Calendar views coming in Phase 5)*

### Phase 4: Focus Sessions (In Progress)
- Pomodoro timer with customizable intervals
- Ambient sounds (rain, cafe, forest)
- Distraction counter
- Post-session journal with quality ratings
- Session history and analytics

### Planned Features
- **Phase 5**: Weekly calendar with schedule blocks
- **Phase 6**: Spaced repetition & topic mastery tracking
- **Phase 7**: AI-powered study plan generation
- **Phase 8**: Analytics dashboard with study heatmaps
- **Phase 9**: Command palette & keyboard shortcuts
- **Phase 10**: Settings, notifications, and polish

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + React 18 + TypeScript | Fast, server-rendered UI |
| Styling | Tailwind CSS + shadcn/ui | Beautiful, responsive design |
| Database | Supabase (PostgreSQL) | Real-time data with RLS |
| Auth | Supabase Auth | Email + OAuth sign-in |
| State | Zustand + TanStack Query | Client & server state |
| AI | OpenAI GPT-4o | Study planning intelligence |
| Deployment | Vercel | Edge-optimized hosting |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/spattnaik1998/StudyFlow.git
cd StudyFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Then edit .env.local with your credentials
```

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: Never commit `.env.local` to version control!

### Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   └── (app)/             # Protected routes
├── components/            # React components
│   ├── layout/           # Shell components (Sidebar, TopBar)
│   ├── projects/         # Project-related components
│   └── tasks/            # Task-related components
├── lib/                  # Utilities and helpers
│   ├── supabase/        # Supabase client setup
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod schemas
├── stores/              # Zustand state management
├── types/               # TypeScript types
└── supabase/            # Database schema
```

## Database Schema

Key tables:
- `profiles` - User information
- `user_preferences` - Timer settings, theme, etc.
- `projects` - Courses/subjects
- `tasks` - Study tasks and assignments
- `task_sessions` - Pomodoro session records
- `topics` - Knowledge nodes for spaced repetition
- `schedule_blocks` - Calendar time blocks
- `ai_insights` - Cached AI-generated insights

All tables have Row-Level Security (RLS) enabled to ensure users only see their own data.

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally: `npm run dev`
3. Build to check for errors: `npm run build`
4. Commit with clear messages: `git commit -m "feat: add feature description"`
5. Push to GitHub: `git push origin feature/your-feature`
6. Create a Pull Request

## Key Files

- **Auth Pages**: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
- **Dashboard**: `app/(app)/dashboard/page.tsx`
- **Projects**: `app/(app)/projects/`, `components/projects/`
- **Tasks**: `app/(app)/tasks/`, `components/tasks/`
- **Database Schema**: `supabase/schema.sql`
- **Types**: `types/database.ts`, `types/api.ts`

## Testing

```bash
# Run type checking
npx tsc --noEmit

# Build validation
npm run build
```

## Deployment

The app is configured for Vercel:

```bash
# Push to GitHub (Vercel will auto-deploy)
git push origin main

# Or deploy manually to Vercel via their dashboard
```

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, open a GitHub issue.

## Roadmap

- [x] Phase 1: Foundation
- [x] Phase 2: Projects Management
- [x] Phase 3: Task Management
- [ ] Phase 4: Focus Sessions (In Progress)
- [ ] Phase 5: Weekly Calendar & Scheduling
- [ ] Phase 6: Spaced Repetition Learning
- [ ] Phase 7: AI Study Plans & Auto-Scheduling
- [ ] Phase 8: Analytics Dashboard
- [ ] Phase 9: Command Palette & Shortcuts
- [ ] Phase 10: Settings & Polish

---

**Last Updated**: February 2026 | **Current Phase**: 3/10 ✅ | **Status**: Active Development 🚀
