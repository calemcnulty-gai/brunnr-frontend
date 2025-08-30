# Phase 2: MVP Core Features

This document contains all tasks needed to implement the core video generation functionality.

## Pre-Implementation Instructions for LLM

**IMPORTANT**: Before starting ANY work, you MUST:

1. **Verify Phase 1 is complete** by checking:
   - Auth is working (can login/signup)
   - Dashboard shell exists
   - API client is configured
   - All base components are installed

2. **Review these critical documents**:
   - `_docs/user-flow.md` - Understand the complete user journey
   - `_docs/api-reference.md` - Know all API endpoints
   - `_docs/ui-rules.md` - Follow component patterns
   - `_docs/project-rules.md` - Maintain code standards

3. **Ask the user these clarifying questions**:
   - Should we implement all three workflows or start with Quick Generation only?
   - Do you want real-time progress updates via polling or just loading states?
   - Should generated videos be stored in Supabase or just reference the API URLs?
   - What's the maximum video generation timeout we should allow?

4. **Working directories**: 
   - `src/app/dashboard/` - Dashboard features
   - `src/app/project/` - Project workflow pages
   - `src/components/forms/` - Form components
   - `src/components/projects/` - Project-specific components
   - `src/lib/api/` - API integration

## Tasks Checklist

### 1. Create Project Database Schema
- [ ] Design projects table schema for Supabase
- [ ] Create types in `src/lib/supabase/types.ts`
- [ ] Set up Row Level Security policies
- [ ] Create database helper functions in `src/lib/supabase/queries.ts`

**Schema suggestion**:
```sql
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  workflow_type text not null, -- 'quick' | 'step-by-step' | 'manifest'
  status text not null, -- 'created' | 'in_progress' | 'generating' | 'completed' | 'failed'
  current_step text,
  data jsonb not null default '{}',
  video_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 2. Implement Project Management
- [ ] Create `src/hooks/use-projects.ts` with React Query
- [ ] Create `src/components/projects/ProjectCard.tsx`
- [ ] Implement project list in dashboard
- [ ] Add create new project modal
- [ ] Implement project deletion with confirmation

**Reference**: Follow React Query patterns from `_docs/tech-stack.md` (lines 277-288)

### 3. Build Workflow Selection Modal
- [ ] Create `src/components/projects/WorkflowSelector.tsx`
- [ ] Implement three workflow options with descriptions
- [ ] Add workflow icons and visual distinctions
- [ ] Handle project creation with selected workflow

**Reference**: Follow modal patterns from `_docs/ui-rules.md` (lines 191-195)

### 4. Implement Quick Generation Workflow
- [ ] Create `src/app/project/[id]/page.tsx` main workflow page
- [ ] Create `src/components/forms/QuestionForm.tsx`
- [ ] Implement API call to `/media/question-to-video`
- [ ] Add progress tracking UI
- [ ] Handle success/error states

**API Integration**:
```typescript
// Reference from _docs/api-reference.md lines 284-329
POST /media/question-to-video
{
  "text": "question",
  "context": "optional context"
}
```

### 5. Create Video Player Component
- [ ] Create `src/components/projects/VideoPlayer.tsx`
- [ ] Implement custom controls
- [ ] Add download functionality
- [ ] Create `src/app/project/[id]/video/page.tsx`
- [ ] Handle video URL from API response

### 6. Build Step-by-Step Pipeline UI
- [ ] Create `src/components/projects/WorkflowStep.tsx`
- [ ] Create `src/components/projects/StepNavigation.tsx`
- [ ] Implement progress bar component
- [ ] Create form components for each step:
  - [ ] Question input form
  - [ ] Explanation editor
  - [ ] Screenplay viewer/editor
  - [ ] Manifest preview

### 7. Implement Pipeline API Calls
- [ ] Create API functions for each endpoint:
  - [ ] `questionToExplanation()`
  - [ ] `explanationToScreenplay()`
  - [ ] `screenplayToManifest()`
  - [ ] `manifestToVideo()`
- [ ] Add proper TypeScript types for each response
- [ ] Implement error handling with retry logic

**Reference**: API endpoints from `_docs/api-reference.md` (lines 104-246)

### 8. Add Project State Persistence
- [ ] Create `src/stores/project-store.ts` for current project
- [ ] Implement auto-save functionality
- [ ] Add step navigation with state preservation
- [ ] Handle browser refresh without data loss

### 9. Implement Error Handling
- [ ] Create `src/components/ui/ErrorDisplay.tsx`
- [ ] Add toast notifications for errors
- [ ] Implement retry mechanisms
- [ ] Show detailed API errors for technical users

**Reference**: Error handling patterns from `_docs/user-flow.md` (lines 118-134)

### 10. Create Loading States
- [ ] Add skeleton loaders for all data fetching
- [ ] Create progress indicators for video generation
- [ ] Implement proper loading states in buttons
- [ ] Add timeout handling for long operations

## Verification Checklist

After completing all tasks:
- [ ] Can create a new project with Quick Generation
- [ ] Video generation completes successfully
- [ ] Can view and download generated video
- [ ] Step-by-step workflow allows navigation between steps
- [ ] All API errors are handled gracefully
- [ ] Project state persists across page refreshes
- [ ] Loading states appear during all async operations

## API Integration Notes

Key endpoints to integrate:
1. `POST /media/question-to-video` - Quick generation
2. `POST /content/question-to-explanation` - Step 1
3. `POST /content/explanation-to-screenplay` - Step 2  
4. `POST /content/screenplay-to-manifest` - Step 3
5. `POST /media/manifest-to-video` - Step 4
6. `GET /media/videos/{request_id}/{filename}` - Download

## Common Issues & Solutions

1. **CORS Errors**: Ensure API proxy is set up correctly in Next.js
2. **Large Response Handling**: Implement streaming for video downloads
3. **Timeout Issues**: Add proper timeout configuration to fetch
4. **State Sync**: Always update both Zustand and Supabase

## Next Phase

Once MVP features are working, proceed to `03-enhanced-features.md` for manifest editing and analytics.
