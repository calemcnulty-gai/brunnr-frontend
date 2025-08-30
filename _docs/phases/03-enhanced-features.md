# Phase 3: Enhanced Features

This document contains tasks for implementing advanced features including manifest editing, analytics, and improved UX.

## Pre-Implementation Instructions for LLM

**IMPORTANT**: Before starting ANY work, you MUST:

1. **Verify Phase 2 is complete**:
   - Quick generation workflow works end-to-end
   - Step-by-step pipeline is functional
   - Videos can be generated and viewed
   - Basic error handling is in place

2. **Review these documents for context**:
   - `_docs/user-flow.md` - Advanced user journeys
   - `_docs/api-reference.md` - Analytics endpoints (lines 410-497)
   - `_docs/ui-rules.md` - Complex component patterns
   - `_docs/theme-rules.md` - Visual consistency

3. **Ask the user these clarifying questions**:
   - How complex should the manifest editor be? (JSON editor vs visual editor)
   - Should analytics show real-time graphs or just data tables?
   - Do you want to implement manifest templates/presets?
   - Should we add video comparison features?
   - What level of manifest validation is needed?

4. **Working directories**:
   - `src/components/forms/` - Manifest editor
   - `src/components/analytics/` - Analytics components
   - `src/components/ui/` - Additional UI components
   - `src/lib/` - Utility functions

## Tasks Checklist

### 1. Build Manifest Editor Component
- [ ] Create `src/components/forms/ManifestEditor.tsx`
- [ ] Implement JSON editor with syntax highlighting
- [ ] Add visual template selector
- [ ] Create template preview component
- [ ] Implement action editor interface

**Manifest Structure Reference** (from API docs):
```typescript
interface Manifest {
  video_id: string
  templates: Template[]
  shots: Shot[]
}

interface Template {
  id: string
  type: string // Text, MathTex_term, etc.
  content: string
}

interface Shot {
  voiceover: string
  actions: Action[]
  duration?: number
  allow_bleed_over?: boolean
}
```

### 2. Create Visual Manifest Builder
- [ ] Create `src/components/forms/VisualManifestBuilder.tsx`
- [ ] Implement drag-and-drop shot reordering
- [ ] Add template palette sidebar
- [ ] Create timeline visualization
- [ ] Build action property panel

**Reference**: Valid template types from `_docs/api-reference.md` (lines 523-531)

### 3. Implement Manifest Validation
- [ ] Create Zod schemas for manifest structure
- [ ] Add real-time validation feedback
- [ ] Implement validation error display
- [ ] Create helpful error messages
- [ ] Add auto-fix suggestions for common issues

### 4. Add Analytics Dashboard
- [ ] Create `src/app/project/[id]/analytics/page.tsx`
- [ ] Create `src/components/analytics/TimingChart.tsx`
- [ ] Implement audio timing visualization
- [ ] Add video timing analysis display
- [ ] Create timing recommendations panel

**API Endpoints**:
- `POST /analytics/audio-timing`
- `POST /analytics/video-timing`
- `POST /analytics/timing-visualization`

### 5. Build Transcript Feature
- [ ] Create `src/components/projects/TranscriptViewer.tsx`
- [ ] Implement transcript extraction
- [ ] Add search within transcript
- [ ] Create export functionality
- [ ] Add copy-to-clipboard feature

**API Reference**: `POST /media/audio/transcript` (lines 379-408)

### 6. Implement Generation History
- [ ] Create `src/components/projects/GenerationHistory.tsx`
- [ ] Add version comparison view
- [ ] Implement manifest diff viewer
- [ ] Add rollback functionality
- [ ] Create bulk actions (download, delete)

### 7. Add Advanced Error Recovery
- [ ] Implement retry with modified parameters
- [ ] Add error log viewer
- [ ] Create error reporting system
- [ ] Add suggested fixes for common errors
- [ ] Implement partial generation recovery

### 8. Create Template Library
- [ ] Create `src/components/templates/TemplateLibrary.tsx`
- [ ] Add preset manifest templates
- [ ] Implement template categories
- [ ] Add search and filter functionality
- [ ] Allow custom template saving

### 9. Enhance Video Player
- [ ] Add shot navigation markers
- [ ] Implement playback speed control
- [ ] Add fullscreen support
- [ ] Create frame-by-frame navigation
- [ ] Add timestamp annotations

### 10. Performance Optimizations
- [ ] Implement virtual scrolling for long lists
- [ ] Add request caching with React Query
- [ ] Optimize manifest editor for large documents
- [ ] Add progressive loading for analytics
- [ ] Implement code splitting for routes

## Component Architecture

### Manifest Editor Architecture
```
ManifestEditor/
├── EditorContainer.tsx      # Main container
├── TemplatePanel.tsx        # Template selection
├── ShotTimeline.tsx         # Visual timeline
├── ActionEditor.tsx         # Action properties
├── JSONView.tsx            # Raw JSON editor
└── PreviewPanel.tsx        # Live preview
```

### Analytics Dashboard Structure
```
Analytics/
├── DashboardLayout.tsx      # Main layout
├── TimingChart.tsx         # D3/Recharts visualization
├── MetricsGrid.tsx         # Key metrics display
├── RecommendationsList.tsx  # AI suggestions
└── ExportPanel.tsx         # Export options
```

## Verification Checklist

After completing all tasks:
- [ ] Manifest editor allows visual editing of all properties
- [ ] Can save and load manifest templates
- [ ] Analytics show meaningful timing insights
- [ ] Transcript extraction works correctly
- [ ] Generation history tracks all attempts
- [ ] Advanced error recovery helps users fix issues
- [ ] Performance remains smooth with large manifests

## UI/UX Considerations

1. **Manifest Editor**:
   - Use Monaco editor for JSON view
   - Provide visual cues for valid drop zones
   - Show real-time preview of changes

2. **Analytics**:
   - Use chart.js or recharts for visualizations
   - Provide context for all metrics
   - Allow data export in multiple formats

3. **Error Handling**:
   - Show errors inline where possible
   - Provide actionable error messages
   - Never lose user work due to errors

## Common Issues & Solutions

1. **Large Manifest Performance**: Implement virtualization for shot lists
2. **Complex Validation**: Use Zod with custom refinements
3. **Real-time Preview**: Debounce updates to prevent lag
4. **Analytics Data**: Cache results aggressively

## Next Phase

After enhanced features are complete, proceed to `04-polish-and-deploy.md` for final polish and production deployment.
