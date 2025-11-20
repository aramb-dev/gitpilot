import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  }

  it('should render pagination with correct item range', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByText('1-10 of 50')).toBeInTheDocument()
  })

  it('should calculate item range correctly for middle page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)

    expect(screen.getByText('21-30 of 50')).toBeInTheDocument()
  })

  it('should calculate item range correctly for last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalItems={47} />)

    expect(screen.getByText('41-47 of 47')).toBeInTheDocument()
  })

  it('should disable previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)

    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0] // First button is previous
    expect(prevButton).toBeDisabled()
  })

  it('should enable previous button when not on first page', () => {
    render(<Pagination {...defaultProps} currentPage={2} />)

    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0]
    expect(prevButton).not.toBeDisabled()
  })

  it('should disable next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />)

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[1] // Second button is next
    expect(nextButton).toBeDisabled()
  })

  it('should enable next button when not on last page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[1]
    expect(nextButton).not.toBeDisabled()
  })

  it('should call onPageChange with previous page when previous button clicked', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()

    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0]) // Previous button
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange with next page when next button clicked', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()

    render(<Pagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1]) // Next button
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('should handle edge case with 0 items', () => {
    render(<Pagination {...defaultProps} totalItems={0} />)

    // When there are 0 items, startItem is still 1, but endItem is 0 (min of 10 and 0)
    expect(screen.getByText('1-0 of 0')).toBeInTheDocument()
  })

  it('should calculate correctly when endItem exceeds totalItems', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalItems={47} />)

    // Should show 41-47, not 41-50
    expect(screen.getByText('41-47 of 47')).toBeInTheDocument()
  })
})
