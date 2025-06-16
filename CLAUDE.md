# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (uses Turbopack for fast dev experience)
- `npm run build` - Build production application
- `npm run lint` - Run ESLint for code quality
- `npm start` - Start production server

## Architecture Overview

This is a **Next.js 14 App Router application** with **Supabase authentication** being built into **SingleShop** - a platform for selling single products online. Key architectural patterns:

- Server-Side Rendering with App Router
- Cookie-based authentication via Supabase SSR
- Component-based architecture using shadcn/ui
- TypeScript throughout for type safety

## Supabase Authentication Structure

The codebase uses a multi-environment Supabase setup:

- **Client-side**: `createClient()` from `/lib/supabase/client.ts`
- **Server-side**: `createClient()` from `/lib/supabase/server.ts` with cookie handling  
- **Middleware**: `updateSession()` from `/lib/supabase/middleware.ts` for route protection

Authentication pattern:
```typescript
// Server components
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Client components  
const supabase = createClient();
```

## Project Structure

- `/app/` - Next.js App Router pages and layouts
  - `/auth/` - Authentication pages (login, sign-up, etc.)
  - `/protected/` - Protected routes requiring authentication
- `/components/` - Reusable components
  - `/ui/` - shadcn/ui components (Button, Card, Input, etc.)
  - Auth components (forms, buttons)
- `/lib/` - Utilities and configurations
  - `/supabase/` - Supabase client configurations
  - `utils.ts` - Utility functions including `cn()` helper

## Environment Variables

Required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The app gracefully handles missing environment variables.

## SingleShop Product Vision

Target: Enable anyone to sell their single product online with a custom URL in under 60 seconds. Planned features include:

- Custom shop URLs (`singleshop.com/username`)
- Single product per seller focus
- Mock payment system for portfolio demonstration
- User profiles and shop management

## Component and Styling Patterns

- Uses shadcn/ui component library with "new-york" style
- Tailwind CSS with CSS variables for theming
- Dark mode support via next-themes
- Path aliases configured (@/components, @/lib, etc.)