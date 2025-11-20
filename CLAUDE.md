# GitPilot - AI Assistant Documentation

This document provides comprehensive information about the GitPilot codebase for AI assistants and developers.

## Contributors & Co-Authors

**Co-Author**: Abdur-Rahman Bilal <aramb@aramservices.com>

This documentation was created with contributions from the project team to provide AI assistants with comprehensive context about the GitPilot codebase.

---

## Project Overview

**GitPilot** is a bulk GitHub repository management platform that enables developers and organizations to perform repository operations at scale. It addresses the problem of tedious manual GitHub management by providing a user-friendly interface for bulk operations like changing repository visibility, archiving, and deletion across multiple repositories simultaneously.

### Core Value Proposition
- **Time-Saving**: Execute actions on dozens of repositories at once instead of manually handling each one
- **Bulk Operations**: Make repositories private/public, archive, delete, and manage issues, PRs, and team members
- **Intuitive Dashboard**: Single, unified interface for all GitHub management needs
- **Zero Code Complexity**: Simple clicks instead of complex CLI commands or scripting

### Target Users
- Freelance developers managing multiple personal repositories
- Small to medium dev teams requiring bulk repository control
- Organizations needing centralized GitHub management
- Open-source maintainers managing large contributor bases

---

## Directory Structure

```
/home/user/gitpilot/
├── .git/                          # Git repository metadata
├── .gitignore                     # Git ignore patterns (excludes .env*, allows .env.example)
├── .env.example                   # Environment variables template
├── public/                        # Static assets (images, icons, etc.)
├── src/
│   ├── app/                       # Next.js app directory (routing & pages)
│   │   ├── dashboard/             # Dashboard routes
│   │   │   ├── layout.tsx         # Dashboard layout with ErrorBoundary wrapper
│   │   │   ├── page.tsx           # Root dashboard redirect to /repos
│   │   │   ├── repos/
│   │   │   │   └── page.tsx       # Repository management page
│   │   │   ├── issues/
│   │   │   │   └── page.tsx       # Issues management (coming soon)
│   │   │   ├── prs/
│   │   │   │   └── page.tsx       # Pull requests management (coming soon)
│   │   │   ├── members/
│   │   │   │   └── page.tsx       # Team members management (coming soon)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # User settings & preferences
│   │   │   └── globals.css        # Global CSS & Tailwind theme variables
│   │   ├── page.tsx               # Landing page (marketing site)
│   │   └── layout.tsx             # Root layout wrapper (metadata, fonts, dark mode)
│   │
│   ├── components/                # Reusable React components
│   │   ├── ErrorBoundary.tsx      # Error boundary for graceful error handling
│   │   ├── Providers.tsx          # Global providers wrapper (toast notifications)
│   │   │
│   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── Sidebar.tsx        # Navigation sidebar with active state tracking
│   │   │   ├── Breadcrumbs.tsx    # Dynamic breadcrumb navigation
│   │   │   ├── RepositoriesPage.tsx    # Main repositories management container (with confirmation dialogs)
│   │   │   ├── RepositoryTable.tsx     # Table displaying repositories
│   │   │   ├── RepositoryRow.tsx       # Single repository table row
│   │   │   ├── RepositoryActions.tsx   # Bulk action buttons & search bar
│   │   │   ├── Pagination.tsx    # Pagination controls
│   │   │   └── index.ts           # Barrel export file
│   │   │
│   │   └── ui/                    # shadcn/ui components (pre-built, styled)
│   │       ├── alert-dialog.tsx   # Confirmation dialog component (Radix UI)
│   │       ├── button.tsx         # Button with variants (default, outline, destructive, ghost)
│   │       ├── input.tsx          # Text input component
│   │       ├── checkbox.tsx       # Checkbox with Radix UI primitive
│   │       ├── badge.tsx          # Badge component for labels/tags
│   │       ├── card.tsx           # Card container with header/footer
│   │       ├── accordion.tsx      # Accordion component (used on landing)
│   │       ├── loading.tsx        # Loading states: Spinner, LoadingOverlay, TableSkeleton
│   │       └── empty-state.tsx    # Empty state component for no data
│   │
│   ├── types/                     # TypeScript type definitions
│   │   └── dashboard.ts           # Dashboard types (Repository, SidebarItem, PageType)
│   │
│   ├── data/                      # Static mock data
│   │   └── dashboard.ts           # Mock repositories and sidebar configuration
│   │
│   ├── lib/                       # Utility functions & helpers
│   │   └── utils.ts               # cn() - Tailwind CSS class merger
│   │
│   └── styles/                    # (Currently empty, styles in components/globals.css)
│
├── package.json                   # Node dependencies & scripts
├── package-lock.json              # Lock file for reproducible installs
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # (Configured via globals.css @theme)
├── components.json                # shadcn/ui configuration
├── postcss.config.mjs             # PostCSS configuration for Tailwind
├── eslint.config.mjs              # ESLint configuration
├── README.md                      # Project overview and setup guide
├── project-plan.md                # Strategic planning document
├── CODE_REVIEW.md                 # Comprehensive code review report
└── CLAUDE.md                      # This file - AI assistant documentation
```

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.2**: Latest React framework with:
  - App Router (file-based routing in `src/app/`)
  - Server & Client Components
  - Built-in optimization and deployment
  - TypeScript-first development

- **React 19.2.0** (updated 2025-11-20): Latest React library with:
  - Hooks for state management
  - Server Components support
  - New features and optimizations
  - Bug fixes and performance improvements

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS framework
  - CSS-in-JS via `@theme` directive
  - Custom theme variables defined in `globals.css`
  - Dark mode by default (hardcoded in root layout)
  - Responsive design system

- **shadcn/ui**: Pre-built, customizable React components
  - Built on Radix UI primitives
  - Customized components via `class-variance-authority`
  - Configured for TypeScript + RSC (React Server Components)
  - Style: "new-york", Icon Library: "lucide"

### Component Libraries
- **Radix UI**: Unstyled, accessible component primitives:
  - `@radix-ui/react-accordion`: Accordion component
  - `@radix-ui/react-checkbox`: Accessible checkboxes
  - `@radix-ui/react-dialog`: Modal dialogs
  - `@radix-ui/react-dropdown-menu`: Dropdown menus
  - `@radix-ui/react-slot`: Polymorphic component composition

- **Lucide React v0.554.0** (updated 2025-11-20): Icon library with 1000+ icons
  - Used for navigation, buttons, status indicators
  - Tree-shakeable, lightweight SVG icons
  - AlertCircle icon used in ErrorBoundary

### Utility Libraries
- **class-variance-authority**: CSS class variance generator
  - Used in Button, Badge, and other UI components
  - Type-safe variant management

- **clsx**: Conditional CSS class builder
  - Used in conjunction with tailwind-merge

- **tailwind-merge**: Merge Tailwind classes intelligently
  - Handles conflicting Tailwind classes
  - Used in the `cn()` utility function

- **use-debounce**: React hook for debouncing values
  - Used for search input optimization (300ms delay)
  - Prevents excessive filtering on every keystroke
  - Integrated in RepositoriesPage component

- **sonner**: Toast notification library for React
  - Beautiful, customizable toast notifications
  - Dark theme styling matching app design
  - Used for user feedback on bulk operations

### Development Tools
- **TypeScript 5**: Static type checking
  - Strict mode enabled
  - Path aliases configured (`@/*` → `./src/*`)
  - Strict null checking, noEmit

- **ESLint 9**: Code quality and style
  - Extends `next/core-web-vitals` and `next/typescript`
  - Ignores: node_modules, .next, build, dist

---

## Configuration Files & Purposes

### `tsconfig.json`
- **Target**: ES2017 with DOM and ESNext libraries
- **Compiler Options**:
  - `jsx: preserve` - Next.js handles JSX transformation
  - `strict: true` - Strict type checking enabled
  - `noEmit: true` - Type checking only, no JS output
  - `moduleResolution: bundler` - Next.js uses Turbopack
  - Path alias: `@/*` maps to `./src/*`

### `next.config.ts`
- Minimal configuration (empty object)
- Future configuration can be added here for optimization, redirects, rewrites
- TypeScript-based configuration file

### `components.json`
- **shadcn/ui Configuration**:
  - Style: "new-york" (clean, minimal style)
  - React Server Components: true
  - Tailwind CSS integration enabled
  - CSS Variables for theming
  - Icon Library: "lucide" (Lucide React)
  - Aliases map components to paths for easy imports

### `tailwind.config.ts`
- **Note**: Configuration is in `src/app/globals.css` using `@theme` directive
- PostCSS plugin: `@tailwindcss/postcss` (v4)
- Theme customization via CSS variables

### `postcss.config.mjs`
- Includes `@tailwindcss/postcss` plugin
- Handles CSS processing for Tailwind v4

### `eslint.config.mjs`
- Modern flat config format
- Extends Next.js recommended rules
- Ignores build directories and cache

### `.gitignore`
- Excludes node_modules, .next, build, dist
- Excludes environment files (.env, .env.local)
- Excludes OS-specific files (.DS_Store)
- Allows .yarn patches and versions

### `package.json`
**Scripts**:
- `npm run dev` - Start development server (hot reload)
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

**Dependencies**: 26 packages for UI, routing, and icons
**DevDependencies**: TypeScript, Tailwind, ESLint, and type definitions

---

## Project Structure & Patterns

### Routing Architecture (Next.js App Router)

```
Routes based on file structure:
/                          → src/app/page.tsx (Landing page)
/dashboard                 → src/app/dashboard/page.tsx (Redirect to /repos)
/dashboard/layout.tsx      → Wraps all /dashboard/* routes
/dashboard/repos           → src/app/dashboard/repos/page.tsx
/dashboard/issues          → src/app/dashboard/issues/page.tsx
/dashboard/prs             → src/app/dashboard/prs/page.tsx
/dashboard/members         → src/app/dashboard/members/page.tsx
/dashboard/settings        → src/app/dashboard/settings/page.tsx
```

### Component Organization

**Page Components** (in `src/app/`):
- Entry points for routes
- Use `Metadata` from Next.js for SEO
- Often server components by default
- Import and compose smaller components

**Feature Components** (in `src/components/dashboard/`):
- Scoped to dashboard functionality
- Exported via barrel export (index.ts)
- Mixed server/client components
- Use "use client" directive where needed

**UI Components** (in `src/components/ui/`):
- Reusable across entire application
- Built with shadcn/ui patterns
- Variant-based styling with CVA
- No business logic - purely presentational

### State Management

**Current Approach**: Local Component State
- Uses React `useState` hook for managing local state
- Props drilling for parent-child communication
- Examples:
  - `RepositoriesPage` manages selected repos, search, pagination
  - Child components receive callbacks for state updates

**Future State Management**:
- README mentions Zustand as part of tech stack
- Not currently implemented
- Can be integrated for global state if needed

### Data Flow Pattern

1. **Data Source**: Mock data in `src/data/dashboard.ts`
2. **Container Component** (RepositoriesPage):
   - Manages local state (selections, search, pagination)
   - Handles event callbacks
   - Passes data and callbacks to child components
3. **Presentation Components**:
   - RepositoryTable, RepositoryRow, Pagination, RepositoryActions
   - Receive data as props
   - Call parent callbacks on user interaction
   - No state management of their own

### Navigation Pattern

**Sidebar Navigation** (`Sidebar.tsx`):
- Uses `usePathname()` hook to detect active route
- Maps routes to sidebar item IDs
- Dynamic active state styling
- Settings button always in footer
- User profile section at bottom

**Breadcrumbs** (`Breadcrumbs.tsx`):
- Auto-generated from current pathname
- Maps route segments to readable labels
- Current page is non-clickable (marked as active)
- Provides secondary navigation context

### Search & Filtering Pattern

- Search query state managed in RepositoriesPage
- Filters array using `.filter()` with case-insensitive matching
- Resets pagination and selection when search changes
- Pagination calculated on filtered results

### Pagination Pattern

- Page number state in RepositoriesPage
- Calculate start/end indices for slice
- Calculate total pages from filtered data
- Disable prev/next buttons at boundaries
- Show item count range (e.g., "1-10 of 50")

### UI Component Pattern (shadcn/ui)

All UI components follow this structure:
```tsx
// Imports
import * as React from "react"
import { cn } from "@/lib/utils"

// Variants definition (using CVA)
const componentVariants = cva(baseClass, {
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: { ... }
})

// Component function
function Component({ className, variant, size, ...props }) {
  return <element className={cn(componentVariants({ variant, size, className }))} {...props} />
}

// Export
export { Component, componentVariants }
```

---

## Key Patterns & Conventions

### Naming Conventions
- **Components**: PascalCase (RepositoriesPage, RepositoryTable)
- **Functions**: camelCase (handleSelectRepo, getRouteForId)
- **Types/Interfaces**: PascalCase (Repository, SidebarItem)
- **Constants**: UPPER_SNAKE_CASE or camelCase (itemsPerPage, mockRepos)

### Import Aliases
- `@/components` → UI component imports
- `@/components/dashboard` → Dashboard components
- `@/components/ui` → shadcn/ui primitives
- `@/types` → TypeScript types
- `@/data` → Static data and constants
- `@/lib/utils` → Utility functions

### File Organization
- **Colocation**: Related files kept together (component + its types)
- **Barrel Exports**: `index.ts` files in `dashboard/` for cleaner imports
- **Separation of Concerns**: UI components separate from business logic
- **CSS**: Global styles in `globals.css`, scoped via Tailwind classes

### TypeScript Patterns
- **Interfaces** for component props (not types)
- **React.ComponentProps<"element">** for native element props
- **Type Safety**: Strict mode enabled, no implicit any
- **Variants**: Used with class-variance-authority for type-safe styling

### Styling Patterns
- **Tailwind Utility Classes**: Primary styling method
- **Dark Mode**: Enabled by default (`className="dark"` on root HTML)
- **CSS Variables**: Theme colors defined as CSS variables
- **Responsive**: Tailwind breakpoints (md:, lg:, etc.)
- **Class Merging**: `cn()` utility handles conflicting classes

---

## Component Documentation

### Page-Level Components

#### `src/app/page.tsx` (Landing Page)
- **Purpose**: Marketing homepage with features, pricing, FAQ
- **Key Sections**:
  - Header with navigation and CTA
  - Hero section with product mockup
  - Features grid (6 feature cards)
  - Pricing section (Pilot free plan + Commander pro plan)
  - FAQ accordion section
  - Final CTA before footer
- **Type**: Client component (`'use client'`)
- **Size**: 322 lines

#### `src/app/dashboard/repos/page.tsx`
- **Purpose**: Server page wrapper for repositories management
- **Composites**: RepositoriesPage component
- **Metadata**: Sets page title and description for SEO
- **Data**: Uses mock data from `src/data/dashboard.ts`

#### `src/app/dashboard/issues/page.tsx`
- **Purpose**: Issues management page (MVP not implemented)
- **Status**: "Coming Soon" state with feature preview
- **Features Listed**: Bulk labeling, bulk assignment, bulk close, advanced filtering
- **Size**: 99 lines

#### `src/app/dashboard/prs/page.tsx`
- **Purpose**: Pull requests management page (MVP not implemented)
- **Status**: "Coming Soon" state with early access option
- **Features Listed**: Bulk merge, bulk review assignment, bulk close, bulk comments
- **Size**: 102 lines

#### `src/app/dashboard/members/page.tsx`
- **Purpose**: Team members management page (MVP not implemented)
- **Status**: "Coming Soon" state with pro tip about GitHub integration
- **Features Listed**: Bulk invitations, permission templates, access reviews, onboarding automation
- **Size**: 107 lines

#### `src/app/dashboard/settings/page.tsx`
- **Purpose**: User account and subscription settings
- **Sections**:
  - Settings navigation (Profile, Billing, Notifications, GitHub, Security)
  - Profile editing (name, email, organization)
  - Plan display (Pro Plan - Active)
  - Save/Cancel buttons
- **Size**: 138 lines

### Layout Components

#### `src/app/layout.tsx` (Root Layout)
- **Purpose**: Global layout wrapper for entire app
- **Responsibilities**:
  - Set HTML language and dark mode class
  - Import fonts (Inter from Google Fonts)
  - Apply global styles via globals.css
  - Set page metadata (title, description)
- **Size**: 27 lines

#### `src/app/dashboard/layout.tsx` (Dashboard Layout)
- **Purpose**: Dashboard-specific layout with sidebar and header
- **Type**: Client component for navigation interactivity
- **Structure**:
  ```
  <div class="flex">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header with Breadcrumbs />
      <Main content area>
        {children}
      </Main>
    </div>
  </div>
  ```
- **Size**: 28 lines

### Dashboard Feature Components

#### `src/components/dashboard/Sidebar.tsx`
- **Purpose**: Main navigation sidebar for dashboard
- **Features**:
  - Logo and branding
  - Navigation items mapped from `sidebarItems` array
  - Active state detection via `usePathname()`
  - Route mapping (ID → path)
  - Settings button in footer
  - User profile section
- **Size**: 96 lines
- **Props**: `SidebarItem[]`
- **Hooks**: `usePathname()`, `useRouter()`

#### `src/components/dashboard/Breadcrumbs.tsx`
- **Purpose**: Dynamic breadcrumb navigation showing current location
- **Features**:
  - Parses pathname into segments
  - Maps segments to readable labels
  - Links to parent pages (except current)
  - Chevron separators between items
- **Size**: 61 lines
- **Hooks**: `usePathname()`
- **Note**: Fully client-side, no manual configuration needed

#### `src/components/dashboard/RepositoriesPage.tsx`
- **Purpose**: Main container for repository management feature
- **Optimizations** (2025-11-20):
  - **useMemo()** for filtered repositories - recalculates only when repositories or searchQuery changes
  - **useMemo()** for paginated repositories - recalculates only when filteredRepos, currentPage, or itemsPerPage changes
  - **useDebounce()** for search query - 300ms debounce prevents excessive filtering on every keystroke
  - Loading states with TableSkeleton component
  - Empty states with context-aware messaging
  - Confirmation dialogs for destructive actions (archive, delete)
- **Responsibilities**:
  - Manage selected repositories state
  - Manage search query state (immediate + debounced)
  - Manage pagination state
  - Filter repositories based on debounced search
  - Calculate pagination on filtered data
  - Handle bulk actions with async/await and toast notifications
- **Size**: 244 lines
- **Props**: `{ repositories: Repository[] }`
- **State**:
  - `selectedRepos`: number[] (IDs of checked repos)
  - `selectAll`: boolean (select all on current page)
  - `searchQuery`: string (immediate search filter for input)
  - `debouncedSearchQuery`: string (debounced for actual filtering)
  - `currentPage`: number (pagination)
  - `showDeleteDialog`: boolean
  - `showArchiveDialog`: boolean
  - `isLoading`: boolean
- **Dependencies**: react, use-debounce, sonner, lucide-react
- **TODO Comments**: API integration needed for action handlers

#### `src/components/dashboard/RepositoryTable.tsx`
- **Purpose**: Table displaying filtered and paginated repositories
- **Features**:
  - Header with "select all" checkbox
  - Maps repositories to RepositoryRow components
  - Pass selection callbacks to rows
- **Size**: 51 lines
- **Props**: 
  - `repositories: Repository[]`
  - `selectedRepos: number[]`
  - `selectAll: boolean`
  - `onSelectAll: (checked) => void`
  - `onSelectRepo: (id, checked) => void`

#### `src/components/dashboard/RepositoryRow.tsx`
- **Purpose**: Single table row representing one repository
- **Optimizations** (2025-11-20):
  - Wrapped with React.memo() to prevent unnecessary re-renders
  - Only re-renders when props (repository, isSelected, onSelectionChange) change
  - Keyboard navigation support (Enter/Space keys)
  - Full accessibility with ARIA labels
- **Displays**:
  - Checkbox (with hover effects)
  - Repository name
  - Visibility badge (Public/Private with color)
  - Star count with icon
  - Last updated timestamp
- **Size**: 58 lines
- **Props**:
  - `repository: Repository`
  - `isSelected: boolean`
  - `onSelectionChange: (id, checked) => void`

#### `src/components/dashboard/RepositoryActions.tsx`
- **Purpose**: Action buttons and search bar above table
- **Features**:
  - Search input with icon
  - Action buttons: Make Private, Archive, Delete
  - Disabled state when no repos selected
  - Red destructive styling for Delete button
- **Size**: 57 lines
- **Props**:
  - `hasSelectedRepos: boolean`
  - `onMakePrivate: () => void`
  - `onArchive: () => void`
  - `onDelete: () => void`
  - `onSearch: (query: string) => void`

#### `src/components/dashboard/Pagination.tsx`
- **Purpose**: Pagination controls and item counter
- **Features**:
  - Shows item range (e.g., "1-10 of 50")
  - Previous button (disabled on first page)
  - Next button (disabled on last page)
  - Smooth state management
- **Size**: 47 lines
- **Props**:
  - `currentPage: number`
  - `totalPages: number`
  - `totalItems: number`
  - `itemsPerPage: number`
  - `onPageChange: (page) => void`

### UI Component Library (shadcn/ui)

All UI components follow the shadcn/ui pattern:

#### `src/components/ui/button.tsx`
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Features**: 
  - Accessible focus states
  - Icon support with proper sizing
  - Disabled state handling
  - Polymorphic component via Radix Slot
- **Used in**: Almost every interactive element

#### `src/components/ui/input.tsx`
- **Features**: Text input with file upload support
- **States**: Focus, disabled, invalid
- **Styling**: Dark mode variant with `dark:bg-input/30`
- **Used in**: Search bars, form fields

#### `src/components/ui/checkbox.tsx`
- **Type**: Client component with Radix UI primitive
- **Features**: 
  - Accessible keyboard navigation
  - Custom icon (CheckIcon from Lucide)
  - Dark mode styling
- **Used in**: Select all, individual selections

#### `src/components/ui/badge.tsx`
- **Variants**: default, secondary, destructive, outline
- **Features**: Small, inline labels with variant styling
- **Used in**: Visibility indicators (Public/Private)

#### `src/components/ui/card.tsx`
- **Parts**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
- **Features**: Grid-based layout with proper spacing
- **Used in**: Feature preview cards, settings sections

#### `src/components/ui/accordion.tsx`
- **Type**: Client component with Radix UI
- **Features**: Animated expand/collapse with smooth transitions
- **Animations**: accordion-down, accordion-up keyframes
- **Used in**: FAQ section on landing page

#### `src/components/ui/alert-dialog.tsx` (NEW - 2025-11-20)
- **Type**: Client component with Radix UI Dialog primitive
- **Purpose**: Confirmation dialogs for destructive actions
- **Parts**: AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
- **Features**:
  - Modal overlay with fade-in/out animations
  - Keyboard accessible (Escape to close)
  - Focus trap when open
  - Dark theme styling matching app design
  - Action button (red destructive style)
  - Cancel button (gray outline style)
- **Used in**: Repository delete confirmation, archive confirmation
- **Example Usage**:
  ```tsx
  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```

#### `src/components/ui/loading.tsx` (NEW - 2025-11-20)
- **Type**: Loading state components
- **Purpose**: Show loading feedback during async operations
- **Components**:
  - **Spinner**: Animated loading spinner with size variants
    - Sizes: sm (w-4 h-4), md (w-8 h-8), lg (w-12 h-12)
    - Uses Loader2 icon from Lucide with spin animation
    - Blue color (#58a6ff) matching app theme
    - ARIA label "Loading" for accessibility
  - **LoadingOverlay**: Centered loading state with message
    - Large spinner with customizable message
    - Padding and spacing for standalone use
  - **TableSkeleton**: Animated skeleton for table loading
    - Configurable row count (default: 10)
    - Staggered animation with 50ms delay per row
    - Gray shimmer effect matching dark theme
- **Used in**: RepositoriesPage during bulk operations
- **Example Usage**:
  ```tsx
  {isLoading ? (
    <TableSkeleton rows={10} />
  ) : (
    <RepositoryTable repositories={repos} />
  )}
  ```

#### `src/components/ui/empty-state.tsx` (NEW - 2025-11-20)
- **Type**: Empty state component
- **Purpose**: Show user-friendly messages when no data exists
- **Features**:
  - Optional icon (Lucide icon component)
  - Title (required, bold white text)
  - Description (optional, gray text)
  - Optional action button with callback
  - Centered layout with proper spacing
  - Consistent styling with app theme
- **Used in**: RepositoriesPage for no results or no repositories
- **Example Usage**:
  ```tsx
  <EmptyState
    icon={Search}
    title="No repositories found"
    description={`No repositories match "${query}"`}
    action={{
      label: 'Clear search',
      onClick: () => handleSearch(''),
    }}
  />
  ```

### Providers & Global Components

#### `src/components/Providers.tsx` (NEW - 2025-11-20)
- **Type**: Client component wrapper
- **Purpose**: Provide global providers (toast, etc.)
- **Features**:
  - Wraps children with Toaster from sonner
  - Configures toast notifications:
    - Position: top-right
    - Theme: dark
    - Rich colors enabled
    - Close button enabled
    - Custom dark theme styling
  - Used in root layout to wrap entire app
- **Styling**: Matches app dark theme (#0d1117 background, #30363d border)

### Error Handling Components

#### `src/components/ErrorBoundary.tsx` (NEW - 2025-11-20)
- **Type**: Class component (required for Error Boundaries)
- **Purpose**: Gracefully catch and handle React component errors
- **Features**:
  - Prevents entire app crash when component errors occur
  - User-friendly error UI with retry option
  - Shows error details in development mode only
  - "Try Again" button to reset error state
  - "Go to Home" button as fallback navigation
  - Logs errors to console (can be extended to Sentry)
- **Implementation**:
  - Uses `getDerivedStateFromError` to catch errors
  - Uses `componentDidCatch` for error logging
  - Wraps dashboard children in `src/app/dashboard/layout.tsx`
- **Size**: 81 lines
- **Styling**: Dark theme with AlertCircle icon, centered error message

---

## Testing Setup

**Current Status**: Testing infrastructure configured (2025-11-20)

### Testing Stack
- **Unit Testing**: Vitest v4.0.12 (fast, modern test runner)
- **Component Testing**: React Testing Library v16.3.0
- **DOM Matchers**: @testing-library/jest-dom v6.9.1
- **User Interactions**: @testing-library/user-event v14.6.1
- **Test Environment**: jsdom v27.2.0 (browser simulation)

### Configuration Files

#### `vitest.config.ts`
- **Environment**: jsdom for browser-like testing
- **Globals**: Enabled (`describe`, `it`, `expect` available globally)
- **Setup File**: `src/test/setup.ts` (loaded before tests)
- **Coverage Provider**: v8 (native V8 coverage)
- **Coverage Output**: text, json, html formats
- **Path Aliases**: `@/*` resolves to `./src/*`

#### `src/test/setup.ts`
- Extends Vitest with jest-dom matchers (`.toBeInTheDocument()`, etc.)
- Auto cleanup after each test
- Mocks Next.js router (`useRouter`, `usePathname`, `useSearchParams`)

### Test Structure

Tests are colocated with source files using `.test.ts` or `.test.tsx` extensions:

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts          # 6 tests - utility functions
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx    # 8 tests - button variants, sizes, events
│   │   ├── empty-state.tsx
│   │   └── empty-state.test.tsx  # 8 tests - empty state rendering
│   └── dashboard/
│       ├── Pagination.tsx
│       └── Pagination.test.tsx   # 11 tests - pagination logic
└── test/
    └── setup.ts               # Global test configuration
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:ui       # Run tests with interactive UI
npm run test:coverage # Run tests with coverage report
```

### Current Test Coverage

**33 tests passing** across 4 test suites:
- ✅ `utils.test.ts` - Class name merging utility
- ✅ `button.test.tsx` - Button variants, sizes, interactions
- ✅ `empty-state.test.tsx` - Empty state rendering and actions
- ✅ `Pagination.test.tsx` - Pagination logic and navigation

See [TESTING.md](./TESTING.md) for comprehensive testing guide and best practices.

### Future Testing Work
- Add tests for RepositoriesPage, RepositoryTable, RepositoryRow
- Add tests for Sidebar and Breadcrumbs components
- Add E2E testing with Playwright
- Achieve 70%+ test coverage

---

## Build & Deployment Configuration

### Build Process (`npm run build`)
1. Compiles TypeScript code
2. Bundles React components
3. Optimizes with Next.js Turbopack
4. Generates static files and server functions
5. Creates `.next/` output directory

### Development Server (`npm run dev`)
- Hot module replacement for instant feedback
- Fast refresh for React components
- Local server at http://localhost:3000

### Production Server (`npm run start`)
- Runs optimized production build
- Suitable for deployment platforms

### Deployment Targets
According to README: **Netlify** is the primary deployment target
- Environment variables via Netlify dashboard
- Auto-deploy from git commits
- Serverless functions for backend (not yet configured)

### Environment Variables Configuration

**Status**: Template created (2025-11-20), not yet implemented in code

**File**: `.env.example` provides comprehensive template for all required environment variables

**Required Variables** (for production):
```env
# GitHub OAuth Configuration
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database (when implemented)
DATABASE_URL=postgresql://user:password@localhost:5432/gitpilot

# Optional: Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id_here

# Node Environment
NODE_ENV=development
```

**Setup Instructions**:
1. Copy `.env.example` to `.env.local`
2. Create GitHub OAuth App at https://github.com/settings/developers
3. Generate NextAuth secret: `openssl rand -base64 32`
4. Fill in all required values
5. Restart development server

**Note**: `.gitignore` is configured to exclude all `.env*` files except `.env.example`

---

## Code Organization & Architectural Patterns

### File Structure Philosophy
1. **Co-location**: Files used together are stored together
2. **Feature-Based**: Grouped by feature (dashboard, ui, landing)
3. **Separation of Concerns**: 
   - Components for UI
   - Types for data structures
   - Data for mocks and constants
   - Lib for utilities

### Dependency Injection Pattern
- Props passed down to child components
- Callbacks bubble up for state updates
- No global state currently (Zustand configured but unused)

### Single Responsibility Principle
- Each component has one primary purpose
- Page components: routing & layout
- Feature components: business logic & composition
- UI components: pure presentation

### DRY (Don't Repeat Yourself)
- Barrel exports (`index.ts`) for cleaner imports
- Utility function `cn()` for class merging
- Reusable UI components from shadcn/ui
- Type definitions in `types/` directory

---

## Key Features & Current Implementation Status

### Implemented (MVP)
1. **Landing Page**
   - Marketing copy and feature descriptions
   - Pricing plans display
   - FAQ section
   - CTA buttons

2. **Dashboard Layout**
   - Sidebar navigation with active states
   - Breadcrumb navigation
   - Page routing structure

3. **Repository Management** (Enhanced)
   - Mock data of 10 repositories
   - Search functionality (case-insensitive)
   - Selection (individual + select all)
   - Pagination (10 items per page)
   - Confirmation dialogs for destructive actions (delete, archive)
   - Toast notifications for action feedback
   - Loading states with animated skeletons
   - Empty states for no results or no data
   - Error handling with error toasts
   - Action buttons (simulated async operations)

### TODO/Not Implemented
1. **Authentication**
   - GitHub OAuth (mentioned in README)
   - User profiles not saved
   - No session management

2. **API Integration**
   - GitHub API calls not implemented
   - Bulk action handlers have `console.log()` + TODO comments
   - No actual repository modifications possible

3. **Database/Persistence**
   - No backend database
   - No user data storage
   - No action history/audit logs

4. **Advanced Features** (mentioned as future/bonus)
   - Issues management
   - Pull requests management
   - Team members management
   - Bulk issue operations
   - Bulk PR operations
   - Scheduled actions
   - Audit logs
   - Stripe billing integration

---

## Special Conventions & Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follows Next.js best practices
- **Naming**: Clear, descriptive names for components and functions
- **Comments**: TODO markers for unimplemented features

### CSS Conventions
- **No CSS Files**: All styling via Tailwind utility classes
- **Dark Mode First**: App starts in dark mode by default
- **CSS Variables**: Theme colors defined as CSS variables in `globals.css`
- **Responsive**: Mobile-first approach with md:, lg: breakpoints

### Component Conventions
- **Props Interface**: Defined above component function
- **Destructuring**: Props destructured with type annotation
- **Exports**: Both component and variants exported (for UI components)
- **Client Directives**: Use `'use client'` only when hooks/interactivity needed

### Git Commit Messages
Based on recent history, follows conventional commits:
- `feat(scope): description` - New feature
- `refactor(scope): description` - Code refactoring
- `style(scope): description` - CSS/styling changes
- `chore(scope): description` - Dependency updates

---

## Recent Development History

### Latest Commits (11 most recent)
1. `c7771b9` - feat: implement comprehensive performance optimizations (2025-11-20)
2. `5607b2a` - feat: add loading states and empty state handling (2025-11-20)
3. `8919ddf` - feat: add toast notification system for user feedback (2025-11-20)
4. `840cea3` - docs: update CLAUDE.md with critical fixes and new components (2025-11-20)
5. `3700ac1` - fix: implement critical security and UX improvements (2025-11-20)
6. `342f82b` - docs: add comprehensive code review report (2025-11-20)
7. `dd11e0c` - docs: add comprehensive CLAUDE.md for AI assistants (2025-11-20)
8. `837ab90` - feat(dashboard): implement route-based multi-page layout
9. `cc718c9` - refactor(dashboard): extract page into a reusable layout component
10. `1b222b8` - feat(dashboard): implement initial repository management UI
11. `0e19dc2` - style(css): remove universal reset from global stylesheet

### Development Milestones
- **Recent Focus**: Testing infrastructure, performance optimizations, and UX improvements (2025-11-20)
- **Completed**:
  - Landing page, basic dashboard layout, repository table UI
  - Comprehensive documentation (CLAUDE.md, CODE_REVIEW.md, TESTING.md, updated README)
  - Error boundaries for graceful error handling
  - Confirmation dialogs for destructive actions
  - Security vulnerability fixes (zero vulnerabilities)
  - Dependency updates (React 19.2.0, lucide-react 0.554.0, sonner 2.0.7, use-debounce 4.0.2)
  - Environment configuration template (.env.example)
  - Toast notification system (success, error feedback)
  - Loading states (Spinner, LoadingOverlay, TableSkeleton)
  - Empty states with context-aware messaging
  - Accessibility improvements (ARIA labels, keyboard navigation, focus indicators)
  - Performance optimizations (React.memo, useMemo, search debouncing)
  - Async operation simulation with error handling
  - **Testing infrastructure (Vitest + React Testing Library)**
  - **33 passing tests** across 4 test suites (utils, Button, EmptyState, Pagination)
- **In Progress**: Authentication implementation (GitHub OAuth)
- **Next Steps**: Expand test coverage, GitHub API integration, authentication (GitHub OAuth)

### Branch Information
- **Current Branch**: `claude/add-claude-documentation-01YAv12QgjwLQetjgftfQvgD`
- **Status**: Clean (no uncommitted changes)

---

## Performance Considerations

### Current Optimizations
1. **Next.js Optimizations**:
   - Image optimization (via Next Image component - not yet used)
   - Code splitting per page
   - Fast refresh in development

2. **CSS Optimizations**:
   - Tailwind CSS tree-shaking (unused classes removed)
   - CSS variables for theme (single source of truth)

3. **Component Optimizations** (Implemented 2025-11-20):
   - **React.memo()**: RepositoryRow component wrapped with memo to prevent unnecessary re-renders
   - **useMemo() hooks**: Filtered and paginated repository data memoized to avoid recalculation
   - **Search Debouncing**: 300ms debounce on search input using `use-debounce` library
   - Pagination limits items to 10 per page
   - Dependencies optimized to trigger recalculation only when necessary

### Performance Impact
- **RepositoryRow**: With 10+ rows per page, React.memo prevents wasted re-renders when parent state changes
- **Filtered Data**: useMemo prevents filter operations on every render, only when search query or data changes
- **Pagination**: useMemo prevents slice operations on every render, only when page or filtered data changes
- **Search**: Debouncing reduces filter operations from every keystroke to once per 300ms pause

### Potential Performance Improvements
1. ✅ ~~Implement React.memo() for RepositoryRow components~~ (COMPLETED)
2. ✅ ~~Add useMemo() for filtered/paginated data~~ (COMPLETED)
3. ✅ ~~Implement search debouncing~~ (COMPLETED)
4. Lazy load future feature pages (Issues, PRs, Members)
5. Implement virtual scrolling for large repository lists
6. Add image optimization for profile pictures

---

## Security & Authentication Notes

### Current Security Status
- **No Authentication**: App is currently public, no login required
- **No API Tokens**: GitHub tokens not stored or used
- **Mock Data Only**: No real GitHub data accessed

### Future Security Implementation
From README and project-plan.md:
- **GitHub OAuth**: Use official GitHub OAuth app
- **Token Management**: Store tokens securely (not in code)
- **Minimal Permissions**: Request only necessary GitHub API scopes
- **No Code Storage**: Never clone or store repository source code
- **Rate Limiting**: Implement retry/backoff logic for GitHub API

### Environment Variables Strategy
- Firebase configuration (when implemented)
- GitHub OAuth credentials
- API endpoints
- Stripe keys (for future billing)

---

## Documentation & Resources

### Internal Documentation
- `README.md` - Project overview, setup, tech stack, features
- `project-plan.md` - Strategic planning, target audience, monetization
- `CLAUDE.md` - This file, for AI assistants

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [GitHub API Docs](https://docs.github.com/en/rest)

### Third-Party Integrations (Planned)
- GitHub OAuth
- Firebase Authentication
- Firebase Database
- Stripe Billing
- Netlify Hosting

---

## Summary for AI Assistants

### What This Project Does
GitPilot is a SaaS application that simplifies bulk GitHub repository management. Instead of manually managing dozens of repositories through GitHub's UI, users can perform bulk operations (change visibility, archive, delete) through an intuitive dashboard.

### Key Technologies
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Language**: TypeScript with strict mode
- **Deployment**: Netlify
- **Icons**: Lucide React

### Current Development Stage
**MVP Phase**: Core UI and routing implemented. Mock data working. API integration pending.

### Main Challenges to Solve
1. GitHub OAuth implementation
2. GitHub API integration for bulk operations
3. Backend database setup (probably Firebase or PostgreSQL)
4. Handling async bulk operations (probably queuing system)
5. Rate limiting and error handling

### Code Quality
- Good: Organized file structure, TypeScript types, reusable components
- Improving: Add tests, implement authentication, connect to real API
- Future: State management library (Zustand), data fetching library (React Query/SWR)

---

## Quick Reference: Common Tasks

### Adding a New Dashboard Page
1. Create `src/app/dashboard/[feature]/page.tsx`
2. Add metadata and component
3. Add sidebar item to `src/data/dashboard.ts`
4. Update Breadcrumbs mapping in `src/components/dashboard/Breadcrumbs.tsx`

### Adding a UI Component
1. Create `src/components/ui/component-name.tsx`
2. Use shadcn/ui pattern with variants
3. Export component and variants
4. Import and use in feature components

### Adding a Type Definition
1. Add to `src/types/dashboard.ts` (or create new file)
2. Import in components that use the type
3. Use for props, function parameters, state

### Modifying Theme Colors
1. Edit CSS variables in `src/app/globals.css` (:root section)
2. Variables are used throughout via Tailwind color names
3. Dark mode colors already set (app uses dark: prefix classes)

### Styling a Component
1. Use Tailwind utility classes in className
2. Use `cn()` utility to merge conflicting classes
3. Define variants in component with `cva()`
4. Responsive: use md:, lg: prefixes for breakpoints

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-20  
**Repository**: GitPilot - Bulk GitHub Repository Management  
**For**: AI Assistants and Developers
