# Theme Rules

This document defines the visual theme for the Brunnr frontend, establishing colors, typography, and styling patterns for a cohesive, professional appearance.

---

## Color Palette

### Primary Colors
- **Deep Blue** (Primary): `#1e3a8a` - Sidebar, primary buttons, active states
- **Blue 600**: `#2563eb` - Interactive elements, links
- **Blue 500**: `#3b82f6` - Hover states, focus rings
- **Blue 100**: `#dbeafe` - Light backgrounds, subtle highlights

### Secondary Colors
- **Emerald 500**: `#10b981` - Success states, positive actions
- **Emerald 600**: `#059669` - Success hover states
- **Emerald 100**: `#d1fae5` - Success backgrounds

### Tertiary Colors
- **Amber 500**: `#f59e0b` - Warnings, in-progress states
- **Amber 600**: `#d97706` - Warning hover states
- **Amber 100**: `#fef3c7` - Warning backgrounds

### Neutral Colors
- **Gray 900**: `#111827` - Primary text
- **Gray 700**: `#374151` - Secondary text
- **Gray 500**: `#6b7280` - Muted text, placeholders
- **Gray 300**: `#d1d5db` - Borders
- **Gray 200**: `#e5e7eb` - Dividers, subtle borders
- **Gray 100**: `#f3f4f6` - Subtle backgrounds
- **Gray 50**: `#f9fafb` - Hover backgrounds
- **White**: `#ffffff` - Primary backgrounds, cards

### Semantic Colors
- **Error**: `#dc2626` - Error states, destructive actions
- **Error Light**: `#fee2e2` - Error backgrounds
- **Info**: `#3b82f6` - Information, tips
- **Info Light**: `#dbeafe` - Info backgrounds

---

## Typography System

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 
             'Roboto Mono', Consolas, 'Courier New', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 0.875rem; /* 14px - Body default */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.75rem;   /* 28px */
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis, labels
- **Semibold**: 600 - Headings, buttons
- **Bold**: 700 - Strong emphasis

### Text Colors
- **Primary**: `text-gray-900` - Main content
- **Secondary**: `text-gray-700` - Supporting text
- **Muted**: `text-gray-500` - De-emphasized text
- **Inverse**: `text-white` - On dark backgrounds

---

## Component Theming

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #1e3a8a;
  color: white;
}
.btn-primary:hover {
  background: #1e40af;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1e3a8a;
  border: 1px solid #1e3a8a;
}
.btn-secondary:hover {
  background: #eff6ff;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #6b7280;
}
.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}
```

### Form Elements
```css
/* Input */
.input {
  border: 1px solid #d1d5db;
  background: white;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.input:error {
  border-color: #dc2626;
}

/* Label */
.label {
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}
```

### Cards & Surfaces
```css
/* Card */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

/* Modal */
.modal {
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Dropdown */
.dropdown {
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## Layout Theming

### Sidebar
```css
.sidebar {
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
}

.sidebar-item {
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-item.active {
  background: rgba(255, 255, 255, 0.15);
  border-left: 3px solid #3b82f6;
  color: white;
}
```

### Header
```css
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  height: 56px;
}
```

### Main Content
```css
.main-content {
  background: #f9fafb;
  min-height: calc(100vh - 56px);
}
```

---

## State Styles

### Hover States
- Buttons: Darken by 10%
- Links: No underline → underline
- Cards: Border color `#d1d5db` → `#9ca3af`
- List items: Background `transparent` → `#f9fafb`

### Focus States
- Outline: `3px solid rgba(59, 130, 246, 0.1)`
- Border: Change to `#3b82f6`
- No default browser outline

### Active States
- Buttons: Darken by 15%
- Scale: `scale(0.98)` (optional, only for primary actions)

### Disabled States
- Opacity: `0.5`
- Cursor: `not-allowed`
- No hover effects

---

## Applied Examples

### Page Header
```jsx
<header className="bg-white border-b border-gray-200 px-6 py-4">
  <h1 className="text-2xl font-semibold text-gray-900">
    Dashboard
  </h1>
  <p className="text-sm text-gray-500 mt-1">
    Manage your video projects
  </p>
</header>
```

### Primary Card
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-5">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Card Title
  </h3>
  <p className="text-gray-700">
    Card content goes here
  </p>
</div>
```

### Status Badges
```jsx
// Success
<span className="px-2 py-1 text-xs font-medium bg-emerald-100 
                 text-emerald-700 rounded-full">
  Completed
</span>

// Warning
<span className="px-2 py-1 text-xs font-medium bg-amber-100 
                 text-amber-700 rounded-full">
  Processing
</span>

// Error
<span className="px-2 py-1 text-xs font-medium bg-red-100 
                 text-red-700 rounded-full">
  Failed
</span>
```

---

## Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          hover: '#1e40af',
          light: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#d1fae5',
        },
        tertiary: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          light: '#fef3c7',
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'body': '0.875rem',
      }
    }
  }
}
```

---

## Usage Guidelines

### Color Usage
- **Primary blue**: CTAs, navigation, primary actions
- **Emerald**: Success messages, positive feedback
- **Amber**: Warnings, in-progress states
- **Red**: Errors, destructive actions only
- **Grays**: Text, borders, backgrounds

### Consistency Rules
1. Always use theme variables, never hardcode colors
2. Maintain consistent border radius (6px for inputs, 8px for cards)
3. Use semantic color names in components
4. Apply hover states to all interactive elements
5. Keep contrast ratios accessible (WCAG AA)
