# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JigsawWorld is an online jigsaw puzzle gaming platform built with Next.js 16 App Router. The application allows users to browse puzzle categories, play interactive puzzles with drag-and-drop mechanics, track progress with timers and leaderboards, and discover new puzzles through search and daily challenges.

**Current Status:** UI/Frontend implemented with mock data. Supabase backend integration pending.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run production server
npm start

# Run ESLint
npm run lint
```

## Architecture & Key Patterns

### Tech Stack
- **Framework:** Next.js 16.1.6 with App Router
- **UI:** React 19.2.3 + TypeScript 5
- **Styling:** Tailwind CSS v4 with custom theme system
- **Database:** Supabase (PostgreSQL) - client configured, data integration pending
- **Icons:** Lucide React

### Directory Structure
```
src/
├── app/                          # Next.js pages (App Router)
│   ├── category/[slug]/         # Dynamic category pages
│   ├── puzzle/[slug]/           # Puzzle detail pages
│   ├── play/[slug]/             # Game interface
│   └── [other pages]
├── components/
│   ├── ui/                      # Reusable components (Button, Card, Input)
│   ├── home/                    # Home page sections
│   ├── navigation/              # Header, Footer
│   └── theme/                   # Theme provider & toggle
└── lib/
    ├── supabase.ts              # Database client
    ├── types.ts                 # TypeScript interfaces
    └── utils.ts                 # cn() utility for className merging
```

### Key Implementation Patterns

#### 1. Client vs Server Components
- Use `'use client'` directive for components with hooks, browser APIs, or event handlers
- Server components default for static content and layouts

#### 2. Import Paths
Always use path alias `@/` for imports:
```typescript
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
```

#### 3. Styling with Tailwind + cn()
```typescript
className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // Allow prop overrides
)}
```

#### 4. Current Data Pattern (Mock)
All data fetching currently uses mock data with setTimeout to simulate loading:
```typescript
useEffect(() => {
  // TODO: Replace with Supabase query
  const mockData = { /* ... */ }
  setTimeout(() => {
    setData(mockData)
    setLoading(false)
  }, 1000)
}, [])
```

Target pattern for Supabase integration:
```typescript
const { data, error } = await supabase
  .from('puzzles')
  .select('*')
  .eq('slug', slug)
```

### Theme System

The app implements a comprehensive dark/light theme system:
- Context-based provider in `src/components/theme/ThemeProvider.tsx`
- localStorage persistence
- System preference detection
- CSS variables defined in `globals.css` for both themes
- Toggle component in header

### Database Schema

**puzzles table:**
- `id`: uuid (primary key)
- `title`: text (required)
- `slug`: text (unique, required)
- `image_url`: text (required)
- `description`: text
- `seo_description`: text
- `piece_count`: integer (default: 100)
- `created_at`, `updated_at`: timestamptz

RLS enabled with public read access.

## Game Mechanics (play/[slug]/page.tsx)

The puzzle game implements:
- Drag-and-drop piece movement with mouse events
- Grid-based positioning (30px snap tolerance)
- Piece state tracking (position, placed, connections)
- Progress percentage calculation
- Timer with formatted display (MM:SS)
- Completion modal with celebration

**Note:** Actual image slicing not yet implemented - uses colored divs as placeholders.

## Component Library

### UI Components (`src/components/ui/`)

**Button:** 6 variants (default, outline, ghost, secondary, destructive, link), 4 sizes (sm, default, lg, icon)

**Card:** Container with CardHeader, CardTitle, CardDescription, CardContent sections

**Input:** Themed text input with focus states

All components support className prop for customization.

## Environment Configuration

Required `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Current Implementation Status

### Completed
- Page routing structure with dynamic routes
- Responsive UI with Tailwind CSS v4
- Dark/light theme system
- Drag-and-drop puzzle game interface
- Component library (Button, Card, Input)
- Supabase client configuration
- Database migrations

### Pending (Mock Data Currently)
- Supabase data fetching (all queries return mock data)
- User authentication system
- Search functionality
- Progress/score persistence
- Daily puzzle rotation
- Image slicing for actual puzzle pieces

### Missing Pages
Routes exist but pages not implemented:
- `/daily` - Daily puzzle page
- `/categories` - All categories listing
- `/help`, `/contact`, `/privacy`, `/terms`

## Important Notes

1. **Mock Data:** All data is currently mocked. Look for TODO comments to find integration points.

2. **Image Sources:** Only `images.unsplash.com` is whitelisted in `next.config.js` for external images.

3. **TypeScript:** Strict mode enabled. All new code should include proper type definitions.

4. **No Testing:** No test framework configured yet. Consider adding Jest + React Testing Library.

5. **Build Warnings:** ESLint runs during build but doesn't fail on errors (configured in `next.config.js`).

6. **Deployment:** Designed for Vercel. Requires environment variables to be set in deployment platform.