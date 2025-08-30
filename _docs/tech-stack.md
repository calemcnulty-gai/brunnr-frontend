# Tech Stack

This document outlines the technology choices for the Brunnr frontend, prioritizing simplicity, speed of development, and seamless integration with Supabase.

---

## Core Technologies

### Framework: Next.js 14+ with App Router
**Why**: Full-stack React framework with excellent Vercel integration
- **Benefits**: SSR/SSG support, API routes, built-in optimizations, TypeScript-first
- **Alternative considered**: Remix (better data loading patterns but less Vercel integration)

### Language: TypeScript
**Why**: Type safety reduces bugs and improves developer experience
- **Benefits**: Better IDE support, self-documenting code, catches errors early
- **Alternative considered**: JavaScript (faster initial development but more runtime errors)

### Styling: Tailwind CSS + Shadcn/ui
**Why**: Rapid UI development with consistent design system
- **Benefits**: Utility-first CSS, pre-built accessible components, easy customization
- **Alternative considered**: Material-UI (more opinionated, less flexible)

### Database & Auth: Supabase
**Why**: Complete backend solution with excellent DX
- **Benefits**: PostgreSQL, real-time subscriptions, built-in auth, storage, Row Level Security
- **Alternative considered**: Firebase (NoSQL, less suited for relational data)

### Deployment: Vercel
**Why**: Zero-config deployment for Next.js
- **Benefits**: Automatic CI/CD, preview deployments, edge functions, analytics
- **Alternative considered**: Netlify (similar features but less Next.js optimization)

---

## State Management & Data Fetching

### Server State: Supabase Client + React Query
**Why**: Seamless integration with Supabase and excellent caching
- **Benefits**: 
  - Automatic cache management
  - Background refetching
  - Optimistic updates
  - Built-in error handling
- **Implementation**: Use `@tanstack/react-query` with Supabase client
- **Alternative considered**: SWR (similar but less feature-rich)

### Client State: Zustand
**Why**: Minimal boilerplate, TypeScript-first, modular stores
- **Benefits**:
  - Simple API
  - No providers needed
  - Easy persistence
  - Devtools support
- **Use cases**: UI state, form drafts, user preferences
- **Alternative considered**: React Context (more boilerplate, re-render issues)

### Form Handling: React Hook Form
**Why**: Performant with minimal re-renders
- **Benefits**: Built-in validation, TypeScript support, small bundle
- **Alternative considered**: Native controlled components (more re-renders)

---

## HTTP & API Communication

### HTTP Client: Native Fetch
**Why**: Built into the platform, works well with Next.js
- **Benefits**: No extra dependencies, streaming support, standard API
- **Wrapper**: Create typed fetch wrapper for API calls
- **Alternative considered**: Axios (more features but unnecessary overhead)

### API Type Safety: Zod
**Why**: Runtime validation matching TypeScript types
- **Benefits**: Schema validation, type inference, error messages
- **Use case**: Validate API responses, form inputs
- **Alternative considered**: Yup (less TypeScript integration)

---

## Developer Experience

### Code Quality: ESLint + Prettier
**Why**: Industry standard, great Next.js support
- **Config**: Use Next.js ESLint config with Tailwind plugin
- **Prettier**: Standard config with Tailwind class sorting
- **Alternative considered**: Biome (faster but less ecosystem support)

### Git Hooks: Husky + lint-staged
**Why**: Ensure code quality before commits
- **Pre-commit**: Format and lint staged files
- **Alternative considered**: Manual CI checks only (slower feedback)

### Testing: Vitest + React Testing Library
**Why**: Fast, Jest-compatible, great DX
- **Benefits**: Native ESM support, TypeScript built-in
- **Alternative considered**: Jest (slower, more configuration)

---

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth group (login, signup)
│   ├── dashboard/         # Main dashboard
│   ├── project/           # Project workflows
│   └── api/               # API route handlers
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utilities and configs
│   ├── api/              # API client and types
│   ├── supabase/         # Supabase client and helpers
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

---

## Best Practices & Conventions

### TypeScript
- Strict mode enabled
- No implicit any
- Prefer interfaces over types for objects
- Use const assertions for literals

### React Patterns
- Functional components only
- Custom hooks for logic reuse
- Composition over inheritance
- Props destructuring with defaults

### API Integration
```typescript
// Typed fetch wrapper example
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  return response.json();
}
```

### Supabase Integration
```typescript
// Singleton client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Auth helper
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### Component Patterns
```typescript
// Modular component example
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        props.className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Common Pitfalls & Solutions

### Next.js App Router
- **Pitfall**: Mixing client/server components incorrectly
- **Solution**: Use 'use client' directive explicitly, keep server components at page level

### Supabase Auth
- **Pitfall**: Auth state not syncing with Next.js
- **Solution**: Use middleware for auth checks, refresh session on mount

### TypeScript
- **Pitfall**: Over-typing or using 'any'
- **Solution**: Let TypeScript infer when possible, use 'unknown' over 'any'

### Tailwind CSS
- **Pitfall**: Conflicting styles with Shadcn components
- **Solution**: Use cn() utility for proper class merging

### State Management
- **Pitfall**: Storing server state in Zustand
- **Solution**: Use React Query for server state, Zustand for UI state only

---

## Performance Considerations

### Bundle Size
- Use dynamic imports for heavy components
- Tree-shake unused Shadcn components
- Analyze with `@next/bundle-analyzer`

### Runtime Performance
- Implement virtual scrolling for long lists
- Use React.memo sparingly and strategically
- Optimize images with Next.js Image component

### API Calls
- Implement request deduplication
- Use optimistic updates for better UX
- Cache responses appropriately

---

## Common LLM Pitfalls & Correct Patterns

### Next.js App Router - Client vs Server Components
**❌ WRONG - Mixing async/await in Client Components**
```typescript
'use client'
export default async function BadComponent() { // ERROR!
  const data = await fetch('/api/data')
  return <div>{data}</div>
}
```

**✅ CORRECT - Use useEffect or React Query in Client Components**
```typescript
'use client'
export default function GoodComponent() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: () => fetch('/api/data').then(res => res.json())
  })
  return <div>{data}</div>
}
```

### Supabase in Next.js App Router
**❌ WRONG - Using client in server component without cookies**
```typescript
// app/page.tsx
import { createClient } from '@supabase/supabase-js'

export default async function Page() {
  const supabase = createClient(url, key) // No cookies!
  const { data } = await supabase.auth.getUser() // Always null
}
```

**✅ CORRECT - Create server client with cookies**
```typescript
// app/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
}
```

### React Query with Supabase
**❌ WRONG - Not handling auth state in queries**
```typescript
// Missing auth dependency
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: () => supabase.from('projects').select()
})
```

**✅ CORRECT - Include user in query key**
```typescript
const { data: { user } } = useUser() // Custom hook for auth
const { data } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => supabase.from('projects').select(),
  enabled: !!user // Don't run if not authenticated
})
```

### Zustand + TypeScript
**❌ WRONG - Incorrect typing and mutations**
```typescript
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }), // No types!
  updateUser: (name) => {
    user.name = name // Direct mutation!
  }
}))
```

**✅ CORRECT - Proper typing and immutable updates**
```typescript
interface StoreState {
  user: User | null
  setUser: (user: User | null) => void
  updateUserName: (name: string) => void
}

const useStore = create<StoreState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUserName: (name) => set((state) => ({
    user: state.user ? { ...state.user, name } : null
  }))
}))
```

### Environment Variables in Next.js
**❌ WRONG - Using server env vars on client**
```typescript
// components/ApiClient.tsx
'use client'
const API_KEY = process.env.API_KEY // undefined on client!
```

**✅ CORRECT - Use NEXT_PUBLIC_ prefix for client vars**
```typescript
// components/ApiClient.tsx
'use client'
const API_URL = process.env.NEXT_PUBLIC_API_URL // Available

// For secrets, use API routes
// app/api/generate/route.ts
export async function POST(request: Request) {
  const API_KEY = process.env.API_KEY // Server only
  // Proxy the request
}
```

## Security Considerations

### API Key Management
- Store in environment variables
- Never expose in client-side code
- Use Next.js API routes as proxy if needed

### Authentication
- Implement proper RBAC with Supabase
- Validate permissions server-side
- Use secure session management

### Input Validation
- Validate all user inputs with Zod
- Sanitize before display
- Implement rate limiting
