import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'
import { EmptyState } from './empty-state'

describe('EmptyState Component', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />)

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your search"
      />
    )

    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<EmptyState title="No items found" />)

    // Query for description container
    const description = screen.queryByText(/try/i)
    expect(description).not.toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<EmptyState icon={Search} title="No items found" />)

    // Icon should be rendered (lucide-react icons have specific classes)
    const iconContainer = screen.getByText('No items found').parentElement?.parentElement
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument()
  })

  it('should render action button when provided', async () => {
    const handleAction = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        title="No items found"
        action={{
          label: 'Clear filters',
          onClick: handleAction,
        }}
      />
    )

    const button = screen.getByRole('button', { name: /clear filters/i })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('should not render action button when not provided', () => {
    render(<EmptyState title="No items found" />)

    const button = screen.queryByRole('button')
    expect(button).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<EmptyState title="No items found" className="custom-class" />)

    const container = screen.getByText('No items found').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('should render complete empty state with all props', async () => {
    const handleAction = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        icon={Search}
        title="No repositories found"
        description="Try adjusting your search query"
        action={{
          label: 'Clear search',
          onClick: handleAction,
        }}
        className="test-class"
      />
    )

    // All elements should be present
    expect(screen.getByText('No repositories found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search query')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /clear search/i })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(handleAction).toHaveBeenCalled()
  })
})
