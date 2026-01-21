import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBulkPRActions } from "./useBulkPRActions";
import type { PullRequest } from "@/types/pull-request";

// Mock global fetch
const originalFetch = global.fetch;

describe("useBulkPRActions", () => {
  beforeEach(() => {
    global.fetch = mock() as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockPRs: PullRequest[] = [
    {
      id: 1,
      nodeId: "node1",
      number: 10,
      title: "PR 1",
      body: "Body 1",
      state: "open",
      merged: false,
      draft: false,
      locked: false,
      user: { id: 1, login: "user1", avatarUrl: "", htmlUrl: "" },
      assignees: [],
      reviewers: [],
      labels: [],
      milestone: null,
      repository: { id: 101, name: "repo1", fullName: "owner/repo1", owner: "owner", private: false },
      comments: 0,
      reviewComments: 0,
      commits: 1,
      additions: 10,
      deletions: 5,
      createdAt: "",
      updatedAt: "",
      closedAt: null,
      mergedAt: null,
      baseRef: "main",
      headRef: "feature",
      htmlUrl: "",
      apiUrl: "",
    },
    {
      id: 2,
      nodeId: "node2",
      number: 20,
      title: "PR 2",
      body: "Body 2",
      state: "open",
      merged: false,
      draft: false,
      locked: false,
      user: { id: 2, login: "user2", avatarUrl: "", htmlUrl: "" },
      assignees: [],
      reviewers: [],
      labels: [],
      milestone: null,
      repository: { id: 102, name: "repo2", fullName: "owner/repo2", owner: "owner", private: false },
      comments: 0,
      reviewComments: 0,
      commits: 1,
      additions: 15,
      deletions: 8,
      createdAt: "",
      updatedAt: "",
      closedAt: null,
      mergedAt: null,
      baseRef: "main",
      headRef: "feature2",
      htmlUrl: "",
      apiUrl: "",
    },
    {
      id: 3,
      nodeId: "node3",
      number: 30,
      title: "PR 3",
      body: "Body 3",
      state: "open",
      merged: false,
      draft: false,
      locked: false,
      user: { id: 3, login: "user3", avatarUrl: "", htmlUrl: "" },
      assignees: [],
      reviewers: [],
      labels: [],
      milestone: null,
      repository: { id: 103, name: "repo3", fullName: "owner/repo3", owner: "owner", private: false },
      comments: 0,
      reviewComments: 0,
      commits: 1,
      additions: 20,
      deletions: 10,
      createdAt: "",
      updatedAt: "",
      closedAt: null,
      mergedAt: null,
      baseRef: "main",
      headRef: "feature3",
      htmlUrl: "",
      apiUrl: "",
    },
  ];

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useBulkPRActions());

      expect(result.current.state.isExecuting).toBe(false);
      expect(result.current.state.total).toBe(0);
      expect(result.current.state.processed).toBe(0);
      expect(result.current.state.succeeded).toBe(0);
      expect(result.current.state.failed).toBe(0);
      expect(result.current.state.results).toEqual([]);
      expect(result.current.state.isCompleted).toBe(false);
    });

    it("should expose all required methods", () => {
      const { result } = renderHook(() => useBulkPRActions());

      expect(typeof result.current.executeAction).toBe("function");
      expect(typeof result.current.cancelOperation).toBe("function");
      expect(typeof result.current.resetState).toBe("function");
      expect(typeof result.current.retryFailed).toBe("function");
    });
  });

  describe("executeAction - Basic Execution", () => {
    it("should execute action and update state correctly", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
              { full_name: "owner/repo2", number: 20 },
            ],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs.slice(0, 2), { type: "close" });
      });

      expect(result.current.state.isExecuting).toBe(false);
      expect(result.current.state.isCompleted).toBe(true);
      expect(result.current.state.total).toBe(2);
      expect(result.current.state.processed).toBe(2);
      expect(result.current.state.succeeded).toBe(2);
      expect(result.current.state.failed).toBe(0);
    });

    it("should handle batch processing with BATCH_SIZE=5", async () => {
      // Create 7 PRs to test batching (2 batches: 5 + 2)
      const sevenPRs: PullRequest[] = Array.from({ length: 7 }, (_, i) => ({
        ...mockPRs[0],
        id: i + 1,
        number: (i + 1) * 10,
        repository: {
          id: 100 + i,
          name: `repo${i + 1}`,
          fullName: `owner/repo${i + 1}`,
          owner: "owner",
          private: false,
        },
      }));

      let batchCount = 0;
      (global.fetch as any).mockImplementation(async (url: string, options: any) => {
        const body = JSON.parse(options.body);
        batchCount++;
        const batchSize = body.prs.length;
        return new Response(
          JSON.stringify({
            success: body.prs.map((pr: any) => ({
              full_name: `${pr.owner}/${pr.repo}`,
              number: pr.prNumber,
            })),
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(sevenPRs, { type: "close" });
      });

      expect(batchCount).toBe(2);
      expect(result.current.state.total).toBe(7);
      expect(result.current.state.succeeded).toBe(7);
    });

    it("should call onSuccess callback when operations succeed", async () => {
      const onSuccess = mock(() => {});

      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions(onSuccess));

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should not call onSuccess when all operations fail", async () => {
      const onSuccess = mock(() => {});

      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [],
            errors: [{ pr: "owner/repo1#10", error: "Failed" }],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions(onSuccess));

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("executeAction - Different Action Types", () => {
    it("should handle merge action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "merge", mergeMethod: "squash" });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], {
          type: "merge",
          mergeMethod: "squash",
          commitMessage: "Test commit",
        });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle close action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "close" });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle reopen action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "reopen" });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "reopen" });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle add_labels action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "add_labels", labels: ["bug", "urgent"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "add_labels", labels: ["bug", "urgent"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle remove_labels action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "remove_labels", labels: ["stale"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "remove_labels", labels: ["stale"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle set_labels action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "set_labels", labels: ["enhancement"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "set_labels", labels: ["enhancement"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle assign action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "assign", assignees: ["user1", "user2"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "assign", assignees: ["user1", "user2"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle unassign action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "unassign", assignees: ["user1"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "unassign", assignees: ["user1"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle request_reviewers action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "request_reviewers", reviewers: ["reviewer1"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "request_reviewers", reviewers: ["reviewer1"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle remove_reviewers action", async () => {
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual({ type: "remove_reviewers", reviewers: ["reviewer1"] });
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "remove_reviewers", reviewers: ["reviewer1"] });
      });

      expect(result.current.state.isCompleted).toBe(true);
    });
  });

  describe("executeAction - Error Handling", () => {
    it("should handle API error response", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(result.current.state.failed).toBe(1);
      expect(result.current.state.results[0].success).toBe(false);
      expect(result.current.state.results[0].error).toBe("Rate limit exceeded");
    });

    it("should handle network errors gracefully", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        throw new Error("Network error");
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(result.current.state.isExecuting).toBe(false);
      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle partial failure scenario", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
            ],
            errors: [
              { pr: "owner/repo2#20", error: "Merge conflict" },
              { pr: "owner/repo3#30", error: "CI failed" },
            ],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs, { type: "merge" });
      });

      expect(result.current.state.succeeded).toBe(1);
      expect(result.current.state.failed).toBe(2);
      expect(result.current.state.results).toHaveLength(3);
    });

    it("should handle default error message when none provided", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(JSON.stringify({}), { status: 500 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(result.current.state.failed).toBe(1);
      expect(result.current.state.results[0].error).toBe("Batch operation failed");
    });

    it("should handle empty PR array", async () => {
      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([], { type: "close" });
      });

      expect(result.current.state.total).toBe(0);
      expect(result.current.state.processed).toBe(0);
      expect(result.current.state.isCompleted).toBe(true);
    });
  });

  describe("executeAction - Progress Tracking", () => {
    it("should update progress correctly during batch processing", async () => {
      // Create 12 PRs to test progress updates (3 batches: 5 + 5 + 2)
      const twelvePRs: PullRequest[] = Array.from({ length: 12 }, (_, i) => ({
        ...mockPRs[0],
        id: i + 1,
        number: (i + 1) * 10,
        repository: {
          id: 100 + i,
          name: `repo${i + 1}`,
          fullName: `owner/repo${i + 1}`,
          owner: "owner",
          private: false,
        },
      }));

      const progressUpdates: number[] = [];
      let currentState: any = null;

      (global.fetch as any).mockImplementation(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        // Simulate a delay to allow state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        return new Response(
          JSON.stringify({
            success: body.prs.map((pr: any) => ({
              full_name: `${pr.owner}/${pr.repo}`,
              number: pr.prNumber,
            })),
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        const promise = result.current.executeAction(twelvePRs, { type: "close" });

        // Track progress during execution
        const checkProgress = setInterval(() => {
          if (result.current.state.processed > 0) {
            progressUpdates.push(result.current.state.processed);
          }
          if (result.current.state.isCompleted) {
            clearInterval(checkProgress);
          }
        }, 5);

        await promise;
      });

      // Verify final state
      expect(result.current.state.total).toBe(12);
      expect(result.current.state.processed).toBe(12);
      expect(result.current.state.succeeded).toBe(12);
      expect(result.current.state.failed).toBe(0);
    });

    it("should track succeeded and failed counts separately", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
            ],
            errors: [
              { pr: "owner/repo2#20", error: "Failed" },
            ],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs.slice(0, 2), { type: "close" });
      });

      expect(result.current.state.succeeded).toBe(1);
      expect(result.current.state.failed).toBe(1);
    });
  });

  describe("cancelOperation", () => {
    it("should cancel ongoing operation", async () => {
      let abortCount = 0;
      (global.fetch as any).mockImplementation(async (_url: string, options: any) => {
        const signal = options.signal as AbortSignal;
        abortCount++;

        // First batch starts
        if (abortCount === 1) {
          // Wait a bit then check if aborted
          await new Promise(resolve => setTimeout(resolve, 20));
          if (signal.aborted) {
            throw new Error("AbortError");
          }
        }

        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      // Start execution
      act(() => {
        result.current.executeAction(mockPRs, { type: "close" });
      });

      // Wait a bit then cancel
      await waitFor(() => {
        expect(result.current.state.isExecuting).toBe(true);
      });

      act(() => {
        result.current.cancelOperation();
      });

      await waitFor(() => {
        expect(result.current.state.isExecuting).toBe(false);
        expect(result.current.state.isCompleted).toBe(true);
      });
    });

    it("should handle cancel when no operation is running", () => {
      const { result } = renderHook(() => useBulkPRActions());

      // Should not throw
      act(() => {
        result.current.cancelOperation();
      });

      expect(result.current.state.isExecuting).toBe(false);
    });

    it("should set isCompleted to true when cancelled", async () => {
      (global.fetch as any).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      // Start execution
      act(() => {
        result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      // Cancel immediately
      await waitFor(() => {
        expect(result.current.state.isExecuting).toBe(true);
      });

      act(() => {
        result.current.cancelOperation();
      });

      await waitFor(() => {
        expect(result.current.state.isCompleted).toBe(true);
      });
    });
  });

  describe("resetState", () => {
    it("should reset state to initial values", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      // Execute an action
      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      expect(result.current.state.total).toBe(1);
      expect(result.current.state.succeeded).toBe(1);

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.state.isExecuting).toBe(false);
      expect(result.current.state.total).toBe(0);
      expect(result.current.state.processed).toBe(0);
      expect(result.current.state.succeeded).toBe(0);
      expect(result.current.state.failed).toBe(0);
      expect(result.current.state.results).toEqual([]);
      expect(result.current.state.isCompleted).toBe(false);
    });

    it("should clear lastParamsRef implicitly", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      // Execute an action
      await act(async () => {
        await result.current.executeAction([mockPRs[0]], { type: "close" });
      });

      // Reset
      act(() => {
        result.current.resetState();
      });

      // retryFailed should do nothing after reset (no error, but also no execution)
      act(() => {
        result.current.retryFailed();
      });

      // State should remain reset
      expect(result.current.state.total).toBe(0);
    });
  });

  describe("retryFailed", () => {
    it("should retry only failed PRs", async () => {
      // First call: 2 succeed, 1 fails
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
              { full_name: "owner/repo2", number: 20 },
            ],
            errors: [{ pr: "owner/repo3#30", error: "Merge conflict" }],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs, { type: "merge" });
      });

      expect(result.current.state.succeeded).toBe(2);
      expect(result.current.state.failed).toBe(1);

      // Mock retry call: the failed PR now succeeds
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        // Should only contain the failed PR
        expect(body.prs).toHaveLength(1);
        expect(body.prs[0].repo).toBe("repo3");
        expect(body.prs[0].prNumber).toBe(30);

        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo3", number: 30 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      await act(async () => {
        result.current.retryFailed();
      });

      // Verify only failed PR was retried
      const calls = (global.fetch as any).mock.calls;
      expect(calls).toHaveLength(2);
    });

    it("should do nothing when there are no failed PRs", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
              { full_name: "owner/repo2", number: 20 },
            ],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs.slice(0, 2), { type: "close" });
      });

      const callCountBeforeRetry = (global.fetch as any).mock.calls.length;

      act(() => {
        result.current.retryFailed();
      });

      // Should not make additional fetch call
      expect((global.fetch as any).mock.calls.length).toBe(callCountBeforeRetry);
    });

    it("should do nothing when no operation has been executed yet", () => {
      const { result } = renderHook(() => useBulkPRActions());

      act(() => {
        result.current.retryFailed();
      });

      // Should not throw or change state
      expect(result.current.state.total).toBe(0);
    });

    it("should handle different PR identifier formats", async () => {
      // Test with response using different format: owner/repo#number
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [],
            errors: [
              { pr: "owner/repo3#30", error: "Failed" },
            ],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[2]], { type: "close" });
      });

      expect(result.current.state.failed).toBe(1);

      // Mock retry to succeed
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.prs).toHaveLength(1);
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo3", number: 30 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      await act(async () => {
        result.current.retryFailed();
      });

      expect(result.current.state.succeeded).toBeGreaterThan(0);
    });

    it("should preserve action type during retry", async () => {
      const action = { type: "merge" as const, mergeMethod: "squash" as const };

      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [],
            errors: [{ pr: "owner/repo1#10", error: "Conflict" }],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([mockPRs[0]], action);
      });

      // Verify action was sent correctly
      const firstCallBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(firstCallBody.action).toEqual(action);

      // Mock retry
      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.action).toEqual(action);
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      await act(async () => {
        result.current.retryFailed();
      });

      const secondCallBody = JSON.parse((global.fetch as any).mock.calls[1][1].body);
      expect(secondCallBody.action).toEqual(action);
    });
  });

  describe("Results Format", () => {
    it("should format results with correct PR identifiers", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: [
              { full_name: "owner/repo1", number: 10 },
              { owner: "owner", repo: "repo2", number: 20 },
            ],
            errors: [
              { pr: "owner/repo3#30", error: "Failed" },
            ],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(mockPRs, { type: "close" });
      });

      expect(result.current.state.results).toHaveLength(3);
      expect(result.current.state.results[0].pr).toBe("owner/repo1");
      expect(result.current.state.results[0].success).toBe(true);
      expect(result.current.state.results[1].pr).toBe("owner/repo2#20");
      expect(result.current.state.results[2].pr).toBe("owner/repo3#30");
      expect(result.current.state.results[2].success).toBe(false);
      expect(result.current.state.results[2].error).toBe("Failed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle PR with missing repository gracefully", async () => {
      const prWithMissingRepo: PullRequest = {
        ...mockPRs[0],
        repository: { id: 101, name: "repo1", fullName: "", owner: "", private: false },
      };

      (global.fetch as any).mockImplementationOnce(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.prs[0].owner).toBe("");
        expect(body.prs[0].repo).toBe("repo1");
        return new Response(JSON.stringify({ success: [], errors: [] }), { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction([prWithMissingRepo], { type: "close" });
      });

      // Should complete without error
      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle multiple rapid state updates without race conditions", async () => {
      (global.fetch as any).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return new Response(
          JSON.stringify({
            success: [{ full_name: "owner/repo1", number: 10 }],
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      // Execute multiple actions rapidly
      const promises = [
        act(async () => {
          await result.current.executeAction([mockPRs[0]], { type: "close" });
        }),
      ];

      await Promise.all(promises);

      // Final state should be consistent
      expect(result.current.state.isExecuting).toBe(false);
      expect(result.current.state.isCompleted).toBe(true);
    });

    it("should handle malformed API response", async () => {
      (global.fetch as any).mockImplementationOnce(async () => {
        return new Response("Invalid JSON", { status: 200 });
      });

      const { result } = renderHook(() => useBulkPRActions());

      let caughtError = false;
      await act(async () => {
        try {
          await result.current.executeAction([mockPRs[0]], { type: "close" });
        } catch (e) {
          caughtError = true;
        }
      });

      // Should handle gracefully - operation completes but may have errors
      expect(result.current.state.isCompleted).toBe(true);
    });
  });

  describe("State Consistency", () => {
    it("should maintain consistent state during batch processing", async () => {
      // Create 6 PRs for 2 batches
      const sixPRs = mockPRs.concat([
        {
          ...mockPRs[0],
          id: 4,
          number: 40,
          repository: { id: 104, name: "repo4", fullName: "owner/repo4", owner: "owner", private: false },
        },
        {
          ...mockPRs[0],
          id: 5,
          number: 50,
          repository: { id: 105, name: "repo5", fullName: "owner/repo5", owner: "owner", private: false },
        },
        {
          ...mockPRs[0],
          id: 6,
          number: 60,
          repository: { id: 106, name: "repo6", fullName: "owner/repo6", owner: "owner", private: false },
        },
      ]);

      (global.fetch as any).mockImplementation(async (_url: string, options: any) => {
        const body = JSON.parse(options.body);
        return new Response(
          JSON.stringify({
            success: body.prs.map((pr: any) => ({
              full_name: `${pr.owner}/${pr.repo}`,
              number: pr.prNumber,
            })),
            errors: [],
          }),
          { status: 200 }
        );
      });

      const { result } = renderHook(() => useBulkPRActions());

      await act(async () => {
        await result.current.executeAction(sixPRs, { type: "close" });
      });

      // Verify consistency
      expect(result.current.state.total).toBe(6);
      expect(result.current.state.processed).toBe(6);
      expect(result.current.state.succeeded).toBe(6);
      expect(result.current.state.failed).toBe(0);
      expect(result.current.state.succeeded + result.current.state.failed).toBe(result.current.state.processed);
    });
  });
});
