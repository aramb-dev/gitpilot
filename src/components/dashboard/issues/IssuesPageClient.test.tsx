// @ts-nocheck
// @bun-test-dom
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IssuesPageClient } from './IssuesPageClient';

// Mock hooks
const mockUseIssues = mock(() => ({
  issues: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  hasNextPage: false,
  currentPage: 1,
  refetch: mock(() => {}),
  loadPage: mock(() => {}),
}));

const mockUseIssueFilters = mock(() => ({
  filters: { repos: ['owner/repo'] },
  setFilters: mock(() => {}),
}));

const mockUseBulkIssueActions = mock(() => ({
  selectedIssues: [],
  setSelectedIssues: mock(() => {}),
  clearSelection: mock(() => {}),
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

mock.module('@/hooks/useIssues', () => ({
  useIssues: mockUseIssues,
}));

mock.module('@/hooks/useIssueFilters', () => ({
  useIssueFilters: mockUseIssueFilters,
}));

mock.module('@/hooks/useBulkIssueActions', () => ({
  useBulkIssueActions: mockUseBulkIssueActions,
}));

mock.module('@/hooks/usePreferences', () => ({
  usePreferences: mockUsePreferences,
}));

// Mock sub-components to simplify testing
mock.module('./IssueList', () => ({
  IssueList: ({ issues, selectedIssues, onSelectionChange, onIssueClick }: any) => (
    <div data-testid="issue-list">
      {issues.map((issue: any) => (
        <div key={issue.id} data-testid={`issue-${issue.number}`}>
          <span>{issue.title}</span>
          <input
            type="checkbox"
            checked={selectedIssues.some((s: any) => s.id === issue.id)}
            onChange={() => {
              if (selectedIssues.some((s: any) => s.id === issue.id)) {
                onSelectionChange(selectedIssues.filter((s: any) => s.id !== issue.id));
              } else {
                onSelectionChange([...selectedIssues, issue]);
              }
            }}
          />
          <button onClick={() => onIssueClick(issue)}>preview</button>
        </div>
      ))}
    </div>
  ),
}));

mock.module('./IssueFilters', () => ({
  IssueFilters: ({ filters, onFiltersChange, availableRepos }: any) => (
    <div data-testid="issue-filters">
      <button
        onClick={() => onFiltersChange({ ...filters, repos: ['owner/repo'] })}
        data-testid="select-repo-btn"
      >
        Select Repo
      </button>
    </div>
  ),
}));

const mockIssues = [
  {
    id: 1,
    number: 101,
    title: 'Bug A',
    state: 'open',
    user: { id: 1, login: 'user1', avatarUrl: '' },
    labels: [{ id: 1, name: 'bug', color: 'red' }],
    assignees: [],
    repository: { owner: 'owner', name: 'repo', fullName: 'owner/repo' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: 2,
    htmlUrl: 'https://github.com/owner/repo/issues/101',
  },
  {
    id: 2,
    number: 102,
    title: 'Feature B',
    state: 'open',
    user: { id: 2, login: 'user2', avatarUrl: '' },
    labels: [{ id: 2, name: 'enhancement', color: 'blue' }],
    assignees: [{ id: 1, login: 'user1', avatarUrl: '' }],
    repository: { owner: 'owner', name: 'repo', fullName: 'owner/repo' },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    comments: 5,
    htmlUrl: 'https://github.com/owner/repo/issues/102',
  },
];

describe('IssuesPageClient', () => {
  beforeEach(() => {
    mockUseIssues.mockClear();
    mockUseIssueFilters.mockClear();
    mockUseBulkIssueActions.mockClear();
    mockUsePreferences.mockClear();

    mockUseIssues.mockReturnValue({
      issues: mockIssues,
      isLoading: false,
      error: null,
      totalCount: 2,
      hasNextPage: false,
      currentPage: 1,
      refetch: mock(() => {}),
      loadPage: mock(() => {}),
    });

    mockUseIssueFilters.mockReturnValue({
      filters: { repos: ['owner/repo'] },
      setFilters: mock(() => {}),
    });

    mockUseBulkIssueActions.mockReturnValue({
      selectedIssues: [],
      setSelectedIssues: mock(() => {}),
      clearSelection: mock(() => {}),
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
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders issues when repositories are selected', () => {
    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText('Bug A')).toBeTruthy();
    expect(screen.getByText('Feature B')).toBeTruthy();
  });

  it('shows select repositories prompt when no repos are selected', () => {
    mockUseIssueFilters.mockReturnValue({
      filters: { repos: [] },
      setFilters: mock(() => {}),
    });

    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText('// SELECT_REPOSITORIES')).toBeTruthy();
  });

  it('calls setFilters when repo selection changes', () => {
    const setFilters = mock(() => {});
    mockUseIssueFilters.mockReturnValue({
      filters: { repos: [] },
      setFilters,
    });

    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    const selectBtn = screen.getByTestId('select-repo-btn');
    fireEvent.click(selectBtn);

    expect(setFilters).toHaveBeenCalled();
  });

  it('shows error state and allows retry', () => {
    const refetch = mock(() => {});
    mockUseIssues.mockReturnValue({
      issues: [],
      isLoading: false,
      error: 'API Error',
      totalCount: 0,
      hasNextPage: false,
      currentPage: 1,
      refetch,
      loadPage: mock(() => {}),
    });

    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText(/API Error/)).toBeTruthy();
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it('handles issue selection', () => {
    const setSelectedIssues = mock(() => {});
    mockUseBulkIssueActions.mockReturnValue({
      selectedIssues: [],
      setSelectedIssues,
      clearSelection: mock(() => {}),
      state: { isExecuting: false, isCompleted: false, processed: 0, results: [] },
      executeAction: mock(() => {}),
      cancelOperation: mock(() => {}),
      resetState: mock(() => {}),
      retryFailed: mock(() => {}),
    });

    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(setSelectedIssues).toHaveBeenCalled();
  });

  it('shows bulk action modal when executing', () => {
    mockUseBulkIssueActions.mockReturnValue({
      selectedIssues: [mockIssues[0]],
      setSelectedIssues: mock(() => {}),
      clearSelection: mock(() => {}),
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

    render(<IssuesPageClient availableRepos={['owner/repo']} />);

    expect(screen.getByText('EXECUTING_BULK_ISSUE_ACTION')).toBeTruthy();
  });
});
