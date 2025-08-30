# Phase 1: Project Setup & Foundation

This document contains all tasks needed to set up the basic Next.js project with authentication and core infrastructure.

## Pre-Implementation Instructions for LLM

**IMPORTANT**: Before starting ANY work, you MUST:

1. **Review ALL documentation in the `_docs/` directory**, especially:
   - `_docs/project-overview.md` - Understand the project goals
   - `_docs/tech-stack.md` - Review technology choices and patterns
   - `_docs/project-rules.md` - Follow file structure and conventions
   - `_docs/ui-rules.md` & `_docs/theme-rules.md` - Understand design system

2. **Examine the existing directory structure** in `src/` to understand the layout

3. **Ask the user these clarifying questions** before beginning:
   - Have you already created projects in Vercel and Supabase dashboards?
   - If yes, please provide:
     - Supabase project URL and anon key
     - Supabase project reference ID (from dashboard URL)
     - Vercel project ID and org/team ID (optional)
   - What is the Brunnr API URL and do you have an API key?
   - Should I use npm, yarn, pnpm, or bun for package management?
   - Do you want me to set up git and create an initial commit?
   - Should I generate Supabase types or will you handle database schema later?

4. **Working directories**: You'll primarily work in:
   - Root directory for config files
   - `src/` for all application code
   - `public/` for static assets

## Tasks Checklist

### 0. Set Up Vercel and Supabase Projects

**⚠️ IMPORTANT**: Both CLIs have interactive prompts that can block automation. Use these non-interactive approaches:

#### Option A: Manual Setup (Recommended for LLM Agents)
- [x] Ask user to manually create projects in Vercel and Supabase dashboards
- [x] Get project IDs/URLs from user
- [x] Create `.vercel/project.json` manually with project details
- [x] Create `supabase/.temp/project-ref` with Supabase project ID
- [x] Pull environment variables using non-interactive commands

#### Option B: Non-Interactive CLI Commands
- [x] Install CLIs if needed:
  ```bash
  bun add -g vercel supabase
  ```

**Vercel Non-Interactive Setup**:
```bash
# Create .vercel directory manually
mkdir -p .vercel

# Create project.json manually (ask user for orgId and projectId)
echo '{
  "orgId": "TEAM_ID_FROM_USER",
  "projectId": "PROJECT_ID_FROM_USER"
}' > .vercel/project.json

# Pull environment variables without prompts
vercel env pull .env.local --yes
```

**Supabase Non-Interactive Setup**:
```bash
# Initialize without prompts
supabase init --workdir supabase

# Create project-ref file manually (ask user for project ref)
mkdir -p supabase/.temp
echo "PROJECT_REF_FROM_USER" > supabase/.temp/project-ref

# Generate types without prompts
supabase gen types typescript --project-id PROJECT_REF_FROM_USER > src/lib/supabase/types.ts
```

**Alternative: Use Environment Variables Only**:
```bash
# Skip CLI linking entirely and just use .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_URL=https://brunnr-service-production.up.railway.app
BRUNNR_API_KEY=YOUR_API_KEY
EOF
```

### 1. Initialize Next.js Project
- [x] Create `package.json` with all required dependencies
- [x] Set up `tsconfig.json` for strict TypeScript
- [x] Configure `next.config.js` with proper settings
- [x] Create `.env.example` with all required variables
- [x] Set up `.gitignore` for Next.js projects

**Dependencies to install**:
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2",
    "@supabase/auth-helpers-nextjs": "^0.8",
    "@tanstack/react-query": "^5",
    "zustand": "^4",
    "react-hook-form": "^7",
    "zod": "^3",
    "tailwindcss": "^3",
    "clsx": "^2",
    "tailwind-merge": "^2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14.x",
    "prettier": "^3",
    "prettier-plugin-tailwindcss": "^0.5"
  }
}
```

### 2. Configure Tailwind CSS
- [x] Create `tailwind.config.ts` with theme extensions from `_docs/theme-rules.md`
- [x] Set up `src/app/globals.css` with Tailwind imports
- [x] Add Inter font configuration
- [x] Create CSS variables for theme colors

**Reference**: Use exact color values from `_docs/theme-rules.md`

### 3. Set Up Shadcn/ui
- [x] Install and configure shadcn/ui CLI
- [x] Set up `components.json` for shadcn
- [x] Install initial components: Button, Card, Input, Label
- [x] Create `src/lib/utils.ts` utility (shadcn created this)

### 4. Create Base Layout Structure
- [x] Create `src/app/layout.tsx` with providers setup
- [x] Create `src/app/page.tsx` landing page
- [x] Set up `src/components/layouts/Header.tsx`
- [x] Set up `src/components/layouts/Sidebar.tsx`
- [x] Implement responsive layout structure from `_docs/ui-rules.md`

### 5. Configure Supabase
- [x] Create `src/lib/supabase/client.ts` for browser client
- [x] Create `src/lib/supabase/server.ts` for server components
- [x] Ensure `src/lib/supabase/types.ts` was generated by CLI
- [x] Create middleware.ts for auth protection
- [x] Add Supabase environment variables to `.env.local`
- [x] Set up Supabase Auth redirect URLs in dashboard

**Reference**: Follow patterns in `_docs/tech-stack.md` (lines 289-298)

**Note**: The types.ts file should already exist from the CLI setup. If not, run:
```bash
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

### 6. Set Up API Client
- [x] Create `src/lib/api/client.ts` with typed fetch wrapper
- [x] Create `src/lib/api/endpoints.ts` with all endpoints from API docs
- [x] Create `src/lib/api/types.ts` for API response types
- [x] Implement error handling with custom ApiError class

**Reference**: Use the typed fetch wrapper from `_docs/tech-stack.md` (lines 141-161)

### 7. Create Auth Pages
- [x] Create `src/app/auth/login/page.tsx`
- [x] Create `src/app/auth/signup/page.tsx`
- [x] Create `src/app/auth/layout.tsx` for auth layout
- [x] Implement Supabase auth forms with react-hook-form
- [x] Add proper error handling and loading states

### 8. Set Up State Management
- [x] Create `src/stores/auth-store.ts` for auth state
- [x] Create `src/stores/ui-store.ts` for UI state
- [x] Create `src/hooks/use-auth.ts` custom hook
- [x] Set up React Query provider (ready to use, just needs provider in layout)

**Reference**: Follow Zustand patterns in `_docs/tech-stack.md` (lines 332-347)

### 9. Create Dashboard Shell
- [x] Create `src/app/dashboard/page.tsx`
- [x] Create `src/app/dashboard/layout.tsx` with sidebar
- [x] Implement auth protection redirect
- [x] Create empty state for no projects
- [x] Add loading skeleton

### 10. Development Environment Setup
- [x] Create development scripts in package.json
- [x] Set up ESLint with Next.js config
- [x] Configure Prettier with Tailwind plugin
- [x] Create VS Code settings.json
- [x] Add README with setup instructions (updated for bun)

## Verification Checklist

After completing all tasks, verify:
- [x] `bun dev` starts without errors
- [x] Tailwind styles are working
- [x] Can navigate to login page
- [x] Supabase auth redirects work (middleware configured)
- [x] TypeScript has no errors
- [x] ESLint passes
- [x] All environment variables are documented
- [x] Vercel project is linked (`vercel env pull`)
- [x] Supabase types are generated

## Common Issues & Solutions

1. **CLI Blocking on Input**: Both Vercel and Supabase CLIs have interactive prompts that can't be automated. Always use the manual setup approach or non-interactive commands shown above.
2. **Supabase Auth Not Working**: Check middleware.ts is properly configured
3. **Tailwind Not Applying**: Ensure globals.css is imported in root layout
4. **TypeScript Errors**: Make sure all types are properly imported
5. **Hydration Errors**: Check for client/server component mismatches
6. **Vercel Link Hanging**: If `vercel link` hangs, manually create `.vercel/project.json` instead
7. **Supabase Init Prompts**: Use `--workdir` flag to avoid prompts, or create config manually

## Next Phase

Once this phase is complete, proceed to `02-mvp-core-features.md` to implement the video generation workflows.
