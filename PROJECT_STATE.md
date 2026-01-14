# RobotDance Project State

## What We Accomplished
- Created Next.js AI tools directory with 4,000+ solutions
- Deployed to Vercel with custom domain robotdance.com
- Built bulk import scripts (GitHub awesome lists + Inverted Stone DB)
- Added "Submit a Tool" feature for user submissions
- Added pagination (24/page) and working sort dropdown
- Added Robot Dance Score™ trademark throughout
- Pushed to GitHub repository

## URLs
| Resource | URL |
|----------|-----|
| **Production** | https://robotdance.com |
| **Vercel Dashboard** | https://vercel.com/robot-dance/robot-dance |
| **GitHub Repo** | https://github.com/fletchernt/robot-dance |

### Domain Status
- robotdance.com → Vercel (DNS configured via GoDaddy)
- A Record: `76.76.21.21`
- CNAME (www): `cname.vercel-dns.com`

## Environment Variables

### Required in `.env.local` (local) AND Vercel Dashboard:
```
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=https://robotdance.com
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
```

### To load locally:
```bash
export $(grep -v '^#' .env.local | xargs)
```

## Airtable Structure

### Base ID: in `.env.local`

### Tables:
| Table | Key Fields |
|-------|------------|
| **Solutions** | name, slug, website_url, description, category (apps/agents/apis/devices/robots), logo_url, rds_score, review_count, source, source_url, imported_at |
| **Reviews** | solution_id, user_id, performance, reliability, ease_of_use, value, trust, delight, review_text |
| **Users** | email, name, provider, provider_id, referral_code, trust_score |
| **Submissions** | name, website_url, description, category, submitter_email, status (pending/approved/rejected) |
| **TrustRatings** | rater_id, reviewer_id, review_id, rating |

## Commands

```bash
# Development
npm run dev              # Start local dev server

# Import tools
npm run import:github        # Import from GitHub awesome lists
npm run import:invertedstone # Import from Inverted Stone JSON

# Build & Deploy
npm run build            # Build for production
npx vercel --prod        # Deploy to Vercel
```

## Open TODOs / Next Steps

### High Priority
- [ ] Set up Google OAuth redirect URI in Google Console (add https://robotdance.com/api/auth/callback/google)
- [ ] Sign up for affiliate programs (Jasper, etc.) and add affiliate_url to solutions
- [ ] Review pending submissions in Airtable and approve/add to Solutions

### Features to Consider
- [ ] Add search to homepage
- [ ] Add category pages (/apps, /agents, etc.)
- [ ] Add "Recently Added" section
- [ ] Email notifications for submission approvals
- [ ] Admin dashboard for managing submissions

### Data
- [ ] Add more import sources to `scripts/import_sources.json`
- [ ] Fix any broken logo URLs (some Unavatar lookups may fail)
- [ ] Add affiliate URLs as you join affiliate programs

## File Structure (Key Files)
```
scripts/
  import_github_lists.js    # GitHub importer
  import_invertedstone.js   # Inverted Stone importer
  import_sources.json       # GitHub list URLs config
  seed-expanded.js          # Initial 200+ tools seed
src/
  app/
    solutions/page.tsx      # Solutions list with pagination
    submit/page.tsx         # Submit a tool page
  components/
    Pagination.tsx          # Pagination component
    SortDropdown.tsx        # Working sort dropdown
    SubmitToolForm.tsx      # Tool submission form
  lib/
    airtable.ts             # Airtable API functions
```
