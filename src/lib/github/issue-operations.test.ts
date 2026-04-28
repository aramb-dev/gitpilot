import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  addAssignees,
  addLabels,
  closeIssue,
  executeBulkAction,
  lockIssue,
  removeAssignees,
  removeLabel,
  reopenIssue,
  setLabels,
  unlockIssue,
} from './issue-operations';

describe('closeIssue', () => {
  beforeEach(() => {});

  it('closes an issue without comment', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await closeIssue('token', 'owner', 'repo', 1);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toContain('/repos/owner/repo/issues/1');
    expect(call[1]?.method).toBe('PATCH');
  });

  it('adds comment before closing when provided', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await closeIssue('token', 'owner', 'repo', 1, 'Closing comment');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // First call should be comment
    expect(mockFetch.mock.calls[0][0]).toContain('/comments');
  });

  it('throws on API error', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' }),
        headers: { get: () => null },
      }),
    ) as any;
    global.fetch = mockFetch as any;

    await expect(closeIssue('token', 'owner', 'repo', 1)).rejects.toThrow('Forbidden');
  });
});

describe('reopenIssue', () => {
  beforeEach(() => {});

  it('reopens an issue', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await reopenIssue('token', 'owner', 'repo', 1);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.state).toBe('open');
  });
});

describe('addLabels', () => {
  beforeEach(() => {});

  it('adds labels to an issue', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await addLabels('token', 'owner', 'repo', 1, ['bug', 'help wanted']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.labels).toEqual(['bug', 'help wanted']);
  });
});

describe('removeLabel', () => {
  beforeEach(() => {});

  it('removes a label from an issue', async () => {
    const mockFetch = mock(() => Promise.resolve({ ok: true })) as any;
    global.fetch = mockFetch as any;

    await removeLabel('token', 'owner', 'repo', 1, 'bug');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain('/labels/bug');
    expect(mockFetch.mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('ignores 404 errors', async () => {
    const mockFetch = mock(() => Promise.resolve({ ok: false, status: 404 })) as any;
    global.fetch = mockFetch as any;

    await expect(removeLabel('token', 'owner', 'repo', 1, 'bug')).resolves.toBeUndefined();
  });
});

describe('setLabels', () => {
  beforeEach(() => {});

  it('replaces all labels on an issue', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await setLabels('token', 'owner', 'repo', 1, ['new-label']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][1]?.method).toBe('PUT');
  });
});

describe('addAssignees', () => {
  beforeEach(() => {});

  it('adds assignees to an issue', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await addAssignees('token', 'owner', 'repo', 1, ['user1', 'user2']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.assignees).toEqual(['user1', 'user2']);
  });
});

describe('removeAssignees', () => {
  beforeEach(() => {});

  it('removes assignees from an issue', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    await removeAssignees('token', 'owner', 'repo', 1, ['user1']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][1]?.method).toBe('DELETE');
  });
});

describe('lockIssue', () => {
  beforeEach(() => {});

  it('locks an issue without reason', async () => {
    const mockFetch = mock(() => Promise.resolve({ ok: true })) as any;
    global.fetch = mockFetch as any;

    await lockIssue('token', 'owner', 'repo', 1);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][1]?.method).toBe('PUT');
  });

  it('locks an issue with reason', async () => {
    const mockFetch = mock(() => Promise.resolve({ ok: true })) as any;
    global.fetch = mockFetch as any;

    await lockIssue('token', 'owner', 'repo', 1, 'spam');

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.lock_reason).toBe('spam');
  });
});

describe('unlockIssue', () => {
  beforeEach(() => {});

  it('unlocks an issue', async () => {
    const mockFetch = mock(() => Promise.resolve({ ok: true })) as any;
    global.fetch = mockFetch as any;

    await unlockIssue('token', 'owner', 'repo', 1);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain('/lock');
    expect(mockFetch.mock.calls[0][1]?.method).toBe('DELETE');
  });
});

describe('executeBulkAction', () => {
  beforeEach(() => {});

  it('executes action on multiple issues', async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as any;
    global.fetch = mockFetch as any;

    const issues = [
      { owner: 'owner', repo: 'repo1', number: 1 },
      { owner: 'owner', repo: 'repo2', number: 2 },
    ];

    const result = await executeBulkAction('token', issues, { type: 'close' });

    expect(result.total).toBe(2);
    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('handles partial failures', async () => {
    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' }),
        headers: { get: () => null },
      });
    }) as any;
    global.fetch = mockFetch as any;

    const issues = [
      { owner: 'owner', repo: 'repo1', number: 1 },
      { owner: 'owner', repo: 'repo2', number: 2 },
    ];

    const result = await executeBulkAction('token', issues, { type: 'close' });

    expect(result.total).toBe(2);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.results[1].error).toBe('Forbidden');
  });

  it('respects concurrency limit', async () => {
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const mockFetch = mock(() => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      return new Promise((resolve) => {
        setTimeout(() => {
          currentConcurrent--;
          resolve({ ok: true, json: () => Promise.resolve({}) });
        }, 10);
      });
    }) as any;
    global.fetch = mockFetch as any;

    const issues = Array.from({ length: 10 }, (_, i) => ({
      owner: 'owner',
      repo: 'repo',
      number: i + 1,
    }));

    await executeBulkAction('token', issues, { type: 'close' }, 3);

    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });
});
