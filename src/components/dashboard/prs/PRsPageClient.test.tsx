// @ts-nocheck
// @bun-test-dom
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PRsPageClient } from './PRsPageClient';

// Mock hooks
const mockUsePullRequests = mock(() => ({
  pullRequests: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  refetch: mock(() => {}),
}));

const mockUseBulkPRActions = mock(() => ({
  state: {
    isExecuting: false,
    isCompleted: false,
    processed: 0,
    results: [],
  },
  executeAction: mock(() => {}),
  cancelOperation: mock(() => {}),
  resetState: mock(() => {}),
  retryFailed: mock(() => {}),
}));

const mockUsePreferences = mock(() => ({
  preferences: { itemsPerPage: 25 },
  isLoading: false,
}));

mock.module('@/hooks/usePullRequests', () => ({
  usePullRequests: mockUsePullRequests,
}));

mock.module('@/hooks/useBulkPRActions', () => ({
  useBulkPRActions: mockUseBulkPRActions,
}));

mock.module('@/hooks/usePreferences', () => ({
  usePreferences: mockUsePreferences,
}));

// Mock sub-components
mock.module('./PRCardGrid', () => ({
  PRCardGrid: ({ pullRequests, selectedPRs, onSelectPR }: any) => (
    <div data-testid="pr-card-grid">
      {pullRequests.map((pr: any) => (
        <div key={pr.id} data-testid={`pr-${pr.id}`}>
          <span>{pr.title}</span>
          <input
            type="checkbox"
            checked={selectedPRs.includes(pr.id)}
            onChange={(e) => onSelectPR(pr, e.target.checked)}
          />
        </div>
      ))}
    </div>
  ),
}));

mock.module('./PRFilters', () => ({
  PRFilters: ({ filters, onFiltersChange }: any) => (
    <div data-testid="pr-filters">
      <button
        onClick={() => onFiltersChange({ ...filters, repos: ['owner/repo'] })}
        data-testid="select-repo-btn"
      >
        Select Repo
      </button>
    </div>
  ),
}));

mock.module('./PRMergeModal', () => ({
  PRMergeModal: ({ isOpen, onConfirm }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="merge-modal">
        <button onClick={() => onConfirm('merge', 'Commit message')}>Confirm Merge</button>
      </div>
    );
  },
}));

const mockPRs = [
  {
    id: 1,
    number: 201,
    title: 'Fix bug',
    state: 'open',
    draft: false,
    user: { id: 1, login: 'user1', avatarUrl: '' },
    labels: [],
    assignees: [],
    requestedReviewers: [],
    repository: { owner: 'owner', name: 'repo', fullName: 'owner/repo' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    htmlUrl: 'https://github.com/owner/repo/pull/201',
    diffUrl: '',
    patchUrl: '',
    isMergeable: true,
  },
];

describe('PRsPageClient', () => {
  beforeEach(() => {
    mockUsePullRequests.mockClear();
    mockUseBulkPRActions.mockClear();

    mockUsePullRequests.mockReturnValue({
      pullRequests: mockPRs,
      isLoading: false,
      error: null,
      totalCount: 1,
      refetch: mock(() => {}),
    });

    mockUseBulkPRActions.mockReturnValue({
      state: { isExecuting: false, isCompleted: false, processed: 0, results: [] },
      executeAction: mock(() => {}),
      cancelOperation: mock(() => {}),
      resetState: mock(() => {}),
      retryFailed: mock(() => {}),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders PRs when repositories are selected', () => {
    render(<PRsPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText('Fix bug')).toBeTruthy();
  });

  it('shows select repositories prompt when no repos are selected', () => {
    // We need to trigger the initial state where filters.repos is empty
    // The component has a useEffect that initializes it if availableRepos is provided
    // So to test this, we might need to pass empty availableRepos or mock the state
    render(<PRsPageClient availableRepos={[]} />);

    expect(screen.getByText('// SELECT_REPOSITORIES')).toBeTruthy();
  });

  it('handles PR selection', () => {
    render(<PRsPageClient availableRepos={['owner/repo']} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // After selection, the bulk action bar should appear
    expect(screen.getByText(/PRs_SELECTED/)).toBeTruthy();
  });

  it('opens merge modal and executes action', async () => {
    const executeAction = mock(() => {});
    mockUseBulkPRActions.mockReturnValue({
      state: { isExecuting: false, isCompleted: false, processed: 0, results: [] },
      executeAction,
      cancelOperation: mock(() => {}),
      resetState: mock(() => {}),
      retryFailed: mock(() => {}),
    });

    render(<PRsPageClient availableRepos={['owner/repo']} />);

    // Select PR
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click Merge button in BulkActionBar
    const mergeBtn = screen.getByRole('button', { name: /merge/i });
    fireEvent.click(mergeBtn);

    // Confirm in modal
    const confirmBtn = screen.getByText('Confirm Merge');
    fireEvent.click(confirmBtn);

    expect(executeAction).toHaveBeenCalled();
  });

  it('shows bulk operation modal when executing', () => {
    mockUseBulkPRActions.mockReturnValue({
      state: {
        isExecuting: true,
        isCompleted: false,
        processed: 0,
        results: [],
      },
      executeAction: mock(() => {}),
      cancelOperation: mock(() => {}),
      resetState: mock(() => {}),
      retryFailed: mock(() => {}),
    });

    render(<PRsPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText('EXECUTING_BULK_PR_ACTION')).toBeTruthy();
  });
});
