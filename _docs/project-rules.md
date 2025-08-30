# Project Rules

This document establishes the conventions, structure, and best practices for the Brunnr frontend codebase, optimized for AI-assisted development and long-term maintainability.

---

## Directory Structure

```
brunnr-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth group routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/         # Main dashboard
│   │   │   └── page.tsx
│   │   ├── project/           # Project workflows
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx   # Project workflow
│   │   │   │   └── video/     # Video player
│   │   ├── api/               # API proxy routes
│   │   │   └── brunnr/        # Brunnr API proxy
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI primitives
│   │   ├── forms/            # Form components
│   │   │   ├── QuestionForm.tsx
│   │   │   └── ManifestEditor.tsx
│   │   ├── layouts/          # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── projects/         # Project-specific
│   │       ├── ProjectCard.tsx
│   │       └── WorkflowStep.tsx
│   │
│   ├── lib/                   # Utilities and configs
│   │   ├── api/              # API client
│   │   │   ├── client.ts     # Typed fetch wrapper
│   │   │   ├── endpoints.ts  # API endpoint constants
│   │   │   └── types.ts      # API types
│   │   ├── supabase/         # Supabase setup
│   │   │   ├── client.ts     # Client instances
│   │   │   ├── queries.ts    # Database queries
│   │   │   └── types.ts      # Generated DB types
│   │   ├── utils/            # Helper functions
│   │   │   ├── cn.ts         # Class name utility
│   │   │   └── format.ts     # Formatting helpers
│   │   └── constants.ts      # App constants
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-auth.ts       # Auth hook
│   │   ├── use-projects.ts   # Projects data hook
│   │   └── use-api.ts        # API call hook
│   │
│   ├── stores/               # Zustand stores
│   │   ├── auth-store.ts     # Auth state
│   │   ├── ui-store.ts       # UI state
│   │   └── project-store.ts  # Current project state
│   │
│   └── types/                # TypeScript types
│       ├── api.ts            # API response types
│       ├── database.ts       # Supabase types
│       └── index.ts          # Common types
│
├── public/                    # Static assets
│   ├── fonts/                # Web fonts
│   └── images/               # Images
│
├── _docs/                     # Project documentation
│   ├── phases/               # Development phases
│   └── *.md                  # Doc files
│
├── .env.example              # Environment template
├── .env.local                # Local environment
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

---

## File Naming Conventions

### General Rules
- **Lowercase with hyphens**: `user-profile.tsx`, `api-client.ts`
- **Index files**: Use `index.ts` for barrel exports only
- **Test files**: `*.test.ts` or `*.spec.ts` (colocated)
- **Types**: `*.types.ts` or in `types/` directory
- **Constants**: `*.constants.ts` or `constants.ts`

### Component Files
- **React components**: PascalCase - `ProjectCard.tsx`
- **Hooks**: camelCase with `use` prefix - `useAuth.ts`
- **Utilities**: camelCase - `formatDate.ts`
- **API routes**: lowercase - `route.ts`

### File Length Limits
- **Maximum 500 lines** per file (AI tool compatibility)
- **Split large components** into smaller sub-components
- **Extract complex logic** into separate utility files

---

## Code Organization Standards

### File Structure Template
Every file should follow this structure:

```typescript
/**
 * @fileoverview Brief description of file purpose
 * @module ModuleName
 */

// 1. Imports - grouped and ordered
import React from 'react' // React imports
import { useRouter } from 'next/navigation' // Framework imports
import { Button } from '@/components/ui' // Internal imports
import { formatDate } from '@/lib/utils' // Utilities
import type { Project } from '@/types' // Types

// 2. Constants
const MAX_RETRIES = 3

// 3. Types/Interfaces (if component-specific)
interface ComponentProps {
  // ...
}

// 4. Main export
export function ComponentName() {
  // ...
}

// 5. Sub-components or helpers
function SubComponent() {
  // ...
}
```

### Import Order
1. React/Next.js core
2. Third-party libraries
3. Internal components
4. Utilities/helpers
5. Types
6. Styles (if any)

Use absolute imports with `@/` prefix:
```typescript
import { Button } from '@/components/ui/button'
```

---

## TypeScript Standards

### Type Definitions
```typescript
// ✅ GOOD - Use interfaces for objects
interface User {
  id: string
  email: string
  projects: Project[]
}

// ✅ GOOD - Use type for unions/primitives
type Status = 'idle' | 'loading' | 'error'
type ID = string | number

// ❌ BAD - Don't use 'any'
const data: any = fetch() // Use 'unknown' instead

// ❌ BAD - Don't use enums
enum Status { } // Use const objects or union types
```

### Function Documentation
```typescript
/**
 * Generates a video from a question using the Brunnr API
 * @param question - The user's question or topic
 * @param context - Optional context for the target audience
 * @returns Promise resolving to video URL and metadata
 * @throws {ApiError} If the API request fails
 */
export async function generateVideo(
  question: string,
  context?: string
): Promise<VideoResponse> {
  // Implementation
}
```

---

## React Component Standards

### Component Structure
```typescript
/**
 * ProjectCard displays a summary of a video project
 */
export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete 
}: ProjectCardProps) {
  // 1. Hooks (grouped by type)
  const router = useRouter()
  const { user } = useAuth()
  
  // 2. State
  const [isDeleting, setIsDeleting] = useState(false)
  
  // 3. Computed values
  const isOwner = user?.id === project.userId
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])
  
  // 5. Handlers
  const handleDelete = async () => {
    // Handler logic
  }
  
  // 6. Early returns
  if (!project) return null
  
  // 7. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Props Interface
```typescript
// Always define props interface above component
interface ProjectCardProps {
  project: Project
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string // Allow style overrides
}
```

---

## State Management Rules

### Client State (Zustand)
```typescript
// stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
}))
```

### Server State (React Query)
```typescript
// hooks/use-projects.ts
export function useProjects() {
  const { data: user } = useUser()
  
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => getProjects(user!.id),
    enabled: !!user,
  })
}
```

---

## API Integration Patterns

### API Client Usage
```typescript
// ✅ GOOD - Typed, error handled
try {
  const data = await apiClient.post<VideoResponse>(
    '/media/question-to-video',
    { text: question, context }
  )
  return data
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message)
  }
  throw error
}

// ❌ BAD - Untyped, no error handling
const data = await fetch('/api/video', { method: 'POST' })
```

---

## Component Modularity Rules

### Single Responsibility
Each component should have ONE primary purpose:
```typescript
// ✅ GOOD - Focused components
<QuestionInput onChange={setQuestion} />
<ContextSelector value={context} onChange={setContext} />
<GenerateButton onClick={handleGenerate} />

// ❌ BAD - Does too much
<VideoGenerationForm 
  onGenerate={...} 
  onSave={...} 
  onShare={...} 
  projects={...}
/>
```

### Composition Over Configuration
```typescript
// ✅ GOOD - Composable
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// ❌ BAD - Prop explosion
<Card 
  title="Project Name"
  subtitle="Description"
  footer="Actions"
  showBorder={true}
  padding="medium"
/>
```

---

## Testing Standards

### Test File Structure
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  
  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<ComponentName onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

---

## Git Conventions

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes  
- `refactor/description` - Code refactoring
- `docs/description` - Documentation

### Commit Messages
```
type(scope): description

- feat: New feature
- fix: Bug fix
- refactor: Code change that neither fixes a bug nor adds a feature
- docs: Documentation only
- style: Formatting, missing semicolons, etc
- test: Adding missing tests
- chore: Maintenance
```

---

## Environment Variables

### Naming Convention
```env
# Public (client-side accessible)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=

# Private (server-side only)
BRUNNR_API_KEY=
SUPABASE_SERVICE_KEY=
```

### Usage
```typescript
// Always validate presence
const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}
```

---

## Performance Guidelines

### Code Splitting
```typescript
// Lazy load heavy components
const ManifestEditor = dynamic(
  () => import('@/components/forms/ManifestEditor'),
  { loading: () => <Skeleton /> }
)
```

### Memoization
```typescript
// Only memoize expensive computations
const expensiveValue = useMemo(
  () => calculateComplexValue(data),
  [data]
)

// Don't over-memoize
// ❌ BAD - Unnecessary
const SimpleComponent = memo(() => <div>Hello</div>)
```

---

## Accessibility Requirements

### ARIA Labels
```typescript
<button
  aria-label="Delete project"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
```

### Semantic HTML
```typescript
// ✅ GOOD
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ❌ BAD
<div onClick={navigate}>
  <div>Dashboard</div>
</div>
```

---

## Common Pitfalls to Avoid

1. **Don't store server state in Zustand** - Use React Query
2. **Don't use `any` type** - Use `unknown` and narrow it
3. **Don't ignore error boundaries** - Wrap features in error boundaries
4. **Don't hardcode values** - Use constants and environment variables
5. **Don't skip loading states** - Always show feedback
6. **Don't forget cleanup** - Cancel requests, clear timers
7. **Don't mutate state directly** - Always create new objects/arrays
