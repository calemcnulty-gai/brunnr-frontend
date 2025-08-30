# User Flow

This document outlines the user journey through the Brunnr frontend application, from initial access through video generation and project management.

---

## Entry & Authentication

### Landing Page
- **Unauthenticated users** → Redirect to login/signup
- **Authenticated users** → Redirect to dashboard
- **Authentication provider**: Supabase Auth (via Vercel integration)

### Login/Signup Flow
1. User arrives at `/auth` page
2. Options: Email/password or OAuth providers (Google/GitHub)
3. New users complete signup with email verification
4. Successful auth → Redirect to dashboard
5. Session persisted via Supabase

---

## Main Dashboard

### Layout Structure
- **Header**: App logo, user menu, settings
- **Side Panel** (persistent):
  - Project list (sorted by last modified)
  - Quick filters (active, completed, all)
  - Links to generated videos
  - New project button
- **Main Content Area**:
  - Project cards showing status, last modified, preview
  - Empty state with CTA for first project

### Dashboard Actions
- **New Project** → Opens workflow selection modal
- **Continue Project** → Resumes at last step
- **View Completed** → Shows video player with download option
- **Delete Project** → Soft delete with confirmation

---

## Video Generation Workflows

### Workflow Selection Modal
User chooses between:
1. **Quick Generation** (single endpoint: `/media/question-to-video`)
2. **Step-by-Step Pipeline** (full control over each phase)
3. **From Manifest** (skip to manifest editing)

### 1. Quick Generation Flow
```
Enter Question → Add Context → Generate → View Video
```
- Single form with question and optional context
- Real-time progress indicator
- Direct to video player on completion
- Option to "Open in Editor" to see generated steps

### 2. Step-by-Step Pipeline Flow
```
Question → Explanation → Screenplay → Manifest → Video
```

#### Navigation Controls
- **Progress Bar**: Shows current step and completion status
- **Back Button**: Return to previous step (preserves edits)
- **Skip Ahead**: Jump to any completed step
- **Save & Exit**: Return to dashboard (auto-saves progress)

#### Step Details

**Step 1: Question to Explanation**
- Input: Question text + context
- Output: Detailed explanation with metrics
- Actions: Edit and regenerate, Continue

**Step 2: Explanation to Screenplay**
- Input: Explanation text (editable)
- Output: Structured screenplay with scenes/shots
- Actions: Edit scenes, Regenerate, Continue

**Step 3: Screenplay to Manifest**
- Input: Screenplay JSON (visual editor)
- Output: Render manifest with templates/animations
- Actions: Visual manifest editor, Preview shots, Continue

**Step 4: Manifest to Video**
- Input: Final manifest
- Options: With audio or silent
- Output: Video player with download

### 3. From Manifest Flow
- Direct manifest editor
- Import existing manifest or start fresh
- Immediate video generation option

---

## Project State Management

### Project Lifecycle
1. **Created**: Project initialized with workflow type
2. **In Progress**: Partial completion, auto-saved at each step
3. **Generating**: Active API call in progress
4. **Completed**: Video successfully generated
5. **Failed**: Error occurred (retryable)

### Data Persistence
- All project data saved to Supabase
- Each step's input/output preserved
- Manifest versions tracked
- Generated video URLs stored

---

## Error Handling Flow

### API Error Response
1. Show full error details in modal
2. Display: Status code, error message, request ID
3. Actions available:
   - **Retry**: Re-attempt same request
   - **Edit & Retry**: Modify input and try again
   - **Skip Step**: Continue with default (if possible)
   - **Report Issue**: Copy error details

### Network Errors
- Automatic retry with exponential backoff
- Show connection status indicator
- Preserve unsaved work locally
- Sync when connection restored

---

## Video Management

### Video Player View
- Custom player with playback controls
- Shot navigation (jump to specific shots)
- Download options (MP4, transcript)
- Share link generation
- Return to edit manifest

### Generation History
- Accessible from side panel
- Shows all generated videos
- Filterable by date, status
- Bulk download option
- Storage quota indicator

---

## Settings & Configuration

### User Settings (via dropdown menu)
- Profile information
- Theme preferences
- Default generation settings
- API usage statistics
- Logout option

### Global Settings
- Shared API key configuration (admin only)
- Rate limit monitoring
- System health status

---

## Responsive Behavior

### Mobile (< 768px)
- Side panel becomes slide-out drawer
- Single column layout
- Touch-optimized controls
- Simplified video player

### Tablet (768px - 1024px)
- Collapsible side panel
- Responsive grid for projects
- Full video controls

### Desktop (> 1024px)
- Full layout with persistent side panel
- Multi-column project grid
- Advanced editing features

---

## Key User Journeys

### Journey 1: First-Time User
1. Sign up → Dashboard (empty) → New Project → Quick Generation → Success → Explore steps

### Journey 2: Power User
1. Login → Dashboard → Continue project → Edit manifest → Regenerate specific shots → Download

### Journey 3: Error Recovery
1. Generation fails → View error → Edit input → Retry → Success → Continue workflow

---

## Navigation Structure

```
/                  → Landing (redirects to /dashboard if auth)
/auth             → Login/Signup
/dashboard        → Main project view
/project/[id]     → Active project workflow
/project/[id]/video → Video player view
/settings         → User settings
```
