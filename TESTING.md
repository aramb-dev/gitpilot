# Testing Guide

GitPilot uses **Vitest** and **React Testing Library** for unit and component testing.

## 🧪 Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📁 Test Structure

Tests are colocated with their source files using the `.test.ts` or `.test.tsx` extension:

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts          # Unit test for utils
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx    # Component test for Button
│   │   ├── empty-state.tsx
│   │   └── empty-state.test.tsx
│   └── dashboard/
│       ├── Pagination.tsx
│       └── Pagination.test.tsx
└── test/
    └── setup.ts               # Global test setup
```

## 🔧 Configuration

### `vitest.config.ts`
- **Environment**: jsdom (simulates browser environment)
- **Globals**: true (allows using `describe`, `it`, `expect` without imports)
- **Setup Files**: `src/test/setup.ts`
- **Coverage Provider**: v8
- **Path Aliases**: `@/*` resolves to `./src/*`

### `src/test/setup.ts`
- Extends Vitest with `@testing-library/jest-dom` matchers
- Configures automatic cleanup after each test
- Mocks Next.js router (`next/navigation`)

## ✅ Writing Tests

### Example: Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})
```

### Example: Testing a React Component

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🎯 Testing Best Practices

### 1. **Test User Behavior, Not Implementation**
```typescript
// ✅ Good: Test what the user sees
expect(screen.getByText('Welcome')).toBeInTheDocument()

// ❌ Bad: Test internal state
expect(component.state.isVisible).toBe(true)
```

### 2. **Use Accessible Queries**
Prefer queries that reflect how users interact with the page:
```typescript
// ✅ Best: Use role-based queries
screen.getByRole('button', { name: /submit/i })

// ✅ Good: Use text queries
screen.getByText('Submit')

// ⚠️ Okay: Use test IDs as a last resort
screen.getByTestId('submit-button')
```

### 3. **Mock External Dependencies**
```typescript
// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock API calls
vi.mock('@/services/github', () => ({
  fetchRepositories: vi.fn().mockResolvedValue([...mockData]),
}))
```

### 4. **Test Asynchronous Operations**
```typescript
it('should handle async operations', async () => {
  const user = userEvent.setup()

  render(<MyComponent />)

  await user.click(screen.getByRole('button'))

  // Wait for async operation to complete
  expect(await screen.findByText('Success')).toBeInTheDocument()
})
```

### 5. **Use Setup Functions for Reusable Test Data**
```typescript
describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  }

  it('should render correctly', () => {
    render(<Pagination {...defaultProps} />)
    // ...
  })
})
```

## 📊 Current Test Coverage

### Tested Components
- ✅ `src/lib/utils.ts` - 6 tests
- ✅ `src/components/ui/button.tsx` - 8 tests
- ✅ `src/components/ui/empty-state.tsx` - 8 tests
- ✅ `src/components/dashboard/Pagination.tsx` - 11 tests

**Total: 33 tests passing**

### Components to Test (Future Work)
- `src/components/dashboard/RepositoriesPage.tsx`
- `src/components/dashboard/RepositoryTable.tsx`
- `src/components/dashboard/RepositoryRow.tsx`
- `src/components/dashboard/RepositoryActions.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/Breadcrumbs.tsx`
- `src/components/ErrorBoundary.tsx`

## 🚀 Next Steps

1. **Increase Coverage**: Add tests for remaining components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Add Playwright for end-to-end testing
4. **CI/CD**: Run tests on every pull request

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest-DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Last Updated**: 2025-11-20
**Testing Framework**: Vitest v4.0.12
**Test Coverage Goal**: 70%+
