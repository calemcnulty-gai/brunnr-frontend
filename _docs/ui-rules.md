# UI Rules

This document establishes the visual and interaction guidelines for building components in the Brunnr frontend, following a modern minimal design approach optimized for productivity.

---

## Design Principles

### Core Philosophy
1. **Clarity First**: Every element should have a clear purpose and be immediately understandable
2. **Consistency**: Use the same patterns throughout the application
3. **Efficiency**: Optimize for task completion speed, not visual flair
4. **Accessibility**: Ensure all users can effectively use the interface

### Visual Hierarchy
- **Primary actions**: Deep blue buttons, prominent placement
- **Secondary actions**: Ghost or outline buttons
- **Destructive actions**: Red accent, require confirmation
- **Information density**: Optimize vertical space while maintaining readability

---

## Component Guidelines

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header (56px fixed)                         │
├─────────────┬───────────────────────────────┤
│ Sidebar     │ Main Content Area            │
│ (280px)     │ (fluid)                      │
│ Deep Blue   │ White Background             │
└─────────────┴───────────────────────────────┘
```

### Spacing System
- **Base unit**: 4px
- **Component padding**: 16px (4 units)
- **Section spacing**: 24px (6 units)
- **Card spacing**: 20px (5 units)
- **Inline spacing**: 8px (2 units)

### Typography
- **Font family**: Inter (primary), system fonts (fallback)
- **Font sizes**:
  - Heading 1: 28px (1.75rem)
  - Heading 2: 24px (1.5rem)
  - Heading 3: 20px (1.25rem)
  - Body: 14px (0.875rem)
  - Small: 12px (0.75rem)
- **Line heights**:
  - Headings: 1.2
  - Body text: 1.5
  - Compact: 1.4

### Interactive Elements

#### Buttons
- **Height**: 36px (default), 32px (small), 40px (large)
- **Padding**: 12px horizontal
- **Border radius**: 6px
- **States**:
  - Default: Solid background
  - Hover: 10% darker background
  - Active: 15% darker background
  - Disabled: 50% opacity
- **Variants**:
  - Primary: Deep blue background, white text
  - Secondary: Transparent background, blue text, blue border
  - Ghost: Transparent background, gray text
  - Destructive: Red accents

#### Form Elements
- **Input height**: 36px
- **Border**: 1px solid gray-300
- **Border radius**: 6px
- **Focus state**: Blue border with subtle shadow
- **Error state**: Red border with error message below
- **Label**: Above input, 12px font size, 4px margin

#### Cards
- **Background**: White
- **Border**: 1px solid gray-200
- **Border radius**: 8px
- **Shadow**: None (rely on borders for depth)
- **Padding**: 20px
- **Hover**: Subtle border color change for interactive cards

### Navigation Patterns

#### Sidebar
- **Background**: Deep blue gradient
- **Text**: White/light blue
- **Active item**: Lighter background, left border accent
- **Icons**: 20px size, consistent stroke width
- **Sections**: Separated by subtle dividers

#### Breadcrumbs
- **Separator**: "/" with 8px padding
- **Current page**: Bold, non-clickable
- **Hover**: Underline on clickable items

#### Tabs
- **Border bottom**: 2px for active tab
- **Padding**: 12px horizontal, 8px vertical
- **Transition**: None (instant feedback)

---

## State Communication

### Loading States
- **Inline**: Replace content with skeleton screens
- **Full page**: Centered spinner with message
- **Button loading**: Spinner replaces text, button disabled
- **Progress bars**: For known duration tasks

### Error Handling
- **Inline errors**: Red text below form fields
- **Toast notifications**: Top-right, auto-dismiss after 5s
- **Error pages**: Centered message with action buttons
- **API errors**: Show full error details in expandable panel

### Success Feedback
- **Form submission**: Green toast notification
- **Completion**: Check icon with success message
- **Progress**: Step indicators with checkmarks

---

## Responsive Behavior

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- **Sidebar**: Becomes full-screen overlay
- **Tables**: Horizontal scroll or card view
- **Buttons**: Full width in forms
- **Typography**: Slightly larger for touch

---

## Accessibility Standards

### Keyboard Navigation
- **Tab order**: Logical flow through interface
- **Focus indicators**: Visible blue outline
- **Skip links**: For main content
- **Shortcuts**: Document all keyboard shortcuts

### Screen Readers
- **ARIA labels**: On all interactive elements
- **Live regions**: For dynamic content updates
- **Semantic HTML**: Proper heading hierarchy
- **Alt text**: For all images and icons

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear visual distinction

---

## Component Patterns

### Forms
```jsx
// Standard form field pattern
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">
    Field Label
  </label>
  <input
    className="w-full h-9 px-3 border border-gray-300 rounded-md 
               focus:border-blue-500 focus:outline-none focus:ring-1 
               focus:ring-blue-500"
  />
  <p className="text-sm text-gray-500">Helper text</p>
</div>
```

### Data Display
- **Tables**: Zebra striping, hover states on rows
- **Lists**: Clear separation between items
- **Empty states**: Helpful message with action
- **Pagination**: Bottom right, show items per page

### Modals
- **Backdrop**: Dark overlay (60% opacity)
- **Width**: 500px max, responsive below
- **Position**: Centered vertically and horizontally
- **Actions**: Right-aligned, primary action last

---

## Do's and Don'ts

### Do's
- ✅ Use consistent spacing
- ✅ Maintain clear visual hierarchy
- ✅ Provide immediate feedback
- ✅ Use appropriate color contrast
- ✅ Test with keyboard navigation

### Don'ts
- ❌ Use more than 3 font sizes per page
- ❌ Create custom form controls without necessity
- ❌ Hide important actions in menus
- ❌ Use color alone to convey meaning
- ❌ Break established patterns

---

## Implementation Notes

### Using with Tailwind
- Extend theme with custom colors
- Create component classes for consistency
- Use `cn()` utility for conditional classes
- Avoid arbitrary values when possible

### Component Library (Shadcn)
- Customize theme to match our design
- Override default animations
- Maintain consistent sizing
- Document any modifications
