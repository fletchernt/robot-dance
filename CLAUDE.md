# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at http://localhost:3000
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm run import:github` — Bulk import AI tools from GitHub awesome lists
- `npm run import:invertedstone` — Bulk import from Inverted Stone database
- `npx vercel --prod` — Deploy to Vercel production

## Architecture

This is a full-stack **Next.js 14 App Router** application — an AI tools directory and review platform at robotdance.com. It uses **Airtable** as its database, **NextAuth.js** (Google OAuth, JWT strategy) for auth, and **Tailwind CSS** for styling.

### Path alias

`@/*` maps to `./src/*`

### Key directories

- `src/app/` — Pages and API routes (App Router)
- `src/components/` — Reusable React components (barrel-exported from `index.ts`)
- `src/lib/` — Business logic: Airtable client, auth config, RDS scoring, referral utils
- `src/types/` — TypeScript interfaces and constants
- `scripts/` — Node.js data import/seed scripts

### Data layer

All data lives in Airtable with five tables: **Solutions**, **Reviews**, **Users**, **Submissions**, **TrustRatings**. The Airtable base is lazily initialized in `src/lib/airtable.ts` to avoid build-time errors. API routes in `src/app/api/` handle all CRUD operations with server-side filtering, search, and offset-based pagination (24 items/page).

### Robot Dance Score™ (RDS)

Defined in `src/lib/rds.ts`. A weighted 0–100 score computed from six review categories (each rated 1–10):

- Performance: 25%, Reliability: 20%, Ease of Use: 15%, Value: 15%, Trust: 15%, Delight: 10%

Color thresholds: green (80+), yellow (60+), orange (40+), red (<40).

### Auth & referral system

NextAuth config is in `src/lib/auth.ts`. Each user gets a unique referral code on signup. Referral links use the `/r/[code]/[slug]` route. Commission split constant: 70% reviewer / 30% platform (`COMMISSION_SPLIT` in `src/types/index.ts`).

### Solution categories

Five fixed categories: `apps`, `agents`, `apis`, `devices`, `robots` (type `SolutionCategory`).

### Server vs. client components

Pages are server components by default. Interactive components (forms, dropdowns, search, auth-dependent UI) use `'use client'`. The root layout wraps children in a `SessionProvider` via `src/app/providers.tsx`.

### Styling

Custom primary color palette (sky blue, shades 50–900) defined in `tailwind.config.js`. Global styles in `src/app/globals.css`.

## Environment Variables

Required in `.env.local` and Vercel:

```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## Deployment

Hosted on Vercel. Domain: robotdance.com. GitHub repo: github.com/fletchernt/robot-dance.
