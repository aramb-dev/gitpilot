import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { useBulkRepoActions } from "./useBulkRepoActions";
import type { Repository } from "@/types/repository";

// Mock global fetch
const originalFetch = global.fetch;

describe("useBulkRepoActions", () => {
  beforeEach(() => {
    global.fetch = mock() as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockRepos: Repository[] = [
    { id: 1, name: "repo1", owner: "owner", full_name: "owner/repo1", visibility: "public" } as any,
    { id: 2, name: "repo2", owner: "owner", full_name: "owner/repo2", visibility: "public" } as any,
  ];

  it("should handle partial failure and allow retry", async () => {
    // First call: repo1 succeeds, repo2 fails
    (global.fetch as any).mockImplementationOnce(async (url: string) => {
      return new Response(JSON.stringify({
        success: [{ full_name: "owner/repo1" }],
        errors: [{ repo: "owner/repo2", error: "Failed" }]
      }), { status: 200 });
    });

    const { result } = renderHook(() => useBulkRepoActions());

    await act(async () => {
      await result.current.executeAction(mockRepos, "archive");
    });

    expect(result.current.state.succeeded).toBe(1);
    expect(result.current.state.failed).toBe(1);
    expect(result.current.state.results).toHaveLength(2);
    expect(result.current.state.results.find(r => r.repo === "owner/repo2")?.success).toBe(false);

    // Mock retry call: repo2 succeeds this time
    (global.fetch as any).mockImplementationOnce(async () => {
      return new Response(JSON.stringify({
        success: [{ full_name: "owner/repo2" }],
        errors: []
      }), { status: 200 });
    });

    // Execute retry
    await act(async () => {
      result.current.retryFailed();
    });

    // Assert fetch was called with only repo2
    const calls = (global.fetch as any).mock.calls;
    expect(calls).toHaveLength(2);
    
    // Check the body of the second call
    const secondCallBody = JSON.parse(calls[1][1].body);
    expect(secondCallBody.repos).toHaveLength(1);
    expect(secondCallBody.repos[0].repo).toBe("repo2");
  });
});
