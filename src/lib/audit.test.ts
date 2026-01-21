import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

// Import the db module to access its mocks
import { db } from "../db/index.js";

// Import after mocking is set up in test-setup.ts
import { logAudit } from "./audit";

describe("logAudit", () => {
  // Get reference to the mock values function
  let mockValues: ReturnType<typeof mock>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Clear all previous mock calls
    (db.insert as any).mockClear();
    console.error = mock(() => { });

    // Create fresh mocks for each test
    mockValues = mock(() => Promise.resolve(undefined));

    // Reset the db.insert mock to return an object that matches Drizzle's chained API
    (db.insert as any).mockImplementation(() => {
      const query = {
        values: mockValues,
        onConflictDoNothing: mock(() => query),
        onConflictDoUpdate: mock(() => query),
        returning: mock(() => Promise.resolve([{}])),
        execute: mock(() => Promise.resolve()),
        then: mock((resolve: any) => resolve([{}])),
      };
      return query;
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  const baseParams = {
    userId: "user-123",
    action: "bulk_close_pr",
    resourceType: "pull_request",
  };

  describe("Successful Logging", () => {
    it("should log audit event with all required fields", async () => {
      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {
        count: 5,
        success: 5,
        failed: 0,
      });

      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          userId: "user-123",
          action: "bulk_close_pr",
          resourceType: "pull_request",
          details: {
            count: 5,
            success: 5,
            failed: 0,
          },
        })
      );
    });

    it("should generate a valid UUID for id field", async () => {
      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {});

      const valuesCall = mockValues.mock.calls[0][0];
      expect(valuesCall.id).toMatch(/^[0-9a-f-]{36}$/); // UUID v4 format
    });

    it("should handle complex details with nested objects", async () => {
      const complexDetails = {
        count: 3,
        targets: [
          { owner: "acme", repo: "repo1", number: 10 },
          { owner: "acme", repo: "repo2", number: 20 },
          { owner: "acme", repo: "repo3", number: 30 },
        ],
        metadata: {
          duration: 1234,
          batchSize: 5,
        },
      };

      await logAudit(baseParams.userId, "bulk_merge_pr", baseParams.resourceType, complexDetails);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          details: complexDetails,
        })
      );
    });

    it("should handle array details", async () => {
      const arrayDetails = ["repo1", "repo2", "repo3"];

      await logAudit(baseParams.userId, "bulk_delete", "repository", arrayDetails);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          details: arrayDetails,
        })
      );
    });

    it("should handle primitive details (string, number, boolean)", async () => {
      await logAudit(baseParams.userId, "user_login", "session", "success");

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          details: "success",
        })
      );
    });
  });

  describe("Different Action Types", () => {
    it("should log PR bulk operations", async () => {
      const prActions = ["bulk_close_pr", "bulk_merge_pr", "bulk_reopen_pr", "bulk_add_labels", "bulk_remove_labels"];

      for (const action of prActions) {
        await logAudit(baseParams.userId, action, "pull_request", { count: 1 });
      }

      expect(db.insert).toHaveBeenCalledTimes(prActions.length);
    });

    it("should log issue bulk operations", async () => {
      await logAudit(baseParams.userId, "bulk_close_issue", "issue", { count: 5 });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "bulk_close_issue",
          resourceType: "issue",
        })
      );
    });

    it("should log repository operations", async () => {
      const repoActions = ["bulk_delete", "bulk_archive", "bulk_visibility_change"];

      for (const action of repoActions) {
        await logAudit(baseParams.userId, action, "repository", { count: 2 });
      }

      expect(db.insert).toHaveBeenCalledTimes(repoActions.length);
    });

    it("should log member operations", async () => {
      await logAudit(baseParams.userId, "remove_member", "member", {
        targetUser: "user-456",
        role: "member",
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "remove_member",
          resourceType: "member",
        })
      );
    });

    it("should log organization operations", async () => {
      await logAudit(baseParams.userId, "update_member_role", "organization", {
        targetUser: "user-789",
        fromRole: "member",
        toRole: "admin",
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update_member_role",
          resourceType: "organization",
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should not throw when database insert fails", async () => {
      mockValues.mockRejectedValueOnce(new Error("Database connection lost"));

      // Should not throw - function catches errors and returns undefined
      const result = await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, { count: 1 });
      expect(result).toBeUndefined();
    });

    it("should log error to console when insert fails", async () => {
      mockValues.mockRejectedValueOnce(new Error("Connection error"));

      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, { count: 1 });

      expect(console.error).toHaveBeenCalledWith(
        "Failed to log audit event:",
        expect.any(Error)
      );
    });

    it("should handle rejection with specific error messages", async () => {
      mockValues.mockRejectedValueOnce(new Error("Constraint violation: user_id not found"));

      await logAudit("invalid-user", baseParams.action, baseParams.resourceType, {});

      expect(console.error).toHaveBeenCalled();
    });

    it("should handle malformed data gracefully", async () => {
      mockValues.mockRejectedValueOnce(new Error("JSONB size limit exceeded"));

      const largeDetails = {
        data: "x".repeat(10_000_000), // Very large string
      };

      // Should not throw - function catches errors
      const result = await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, largeDetails);
      expect(result).toBeUndefined();
    });
  });

  describe("Input Validation", () => {
    it("should handle empty userId", async () => {
      await logAudit("", baseParams.action, baseParams.resourceType, {});

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "",
        })
      );
    });

    it("should handle special characters in action name", async () => {
      await logAudit(baseParams.userId, "action-with-special-chars-@#$", baseParams.resourceType, {});

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "action-with-special-chars-@#$",
        })
      );
    });

    it("should handle very long resource type names", async () => {
      const longResourceType = "a".repeat(1000);

      await logAudit(baseParams.userId, baseParams.action, longResourceType, {});

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: longResourceType,
        })
      );
    });

    it("should handle null and undefined in details", async () => {
      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, null as any);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          details: null,
        })
      );

      mockValues.mockClear();

      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, undefined as any);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          details: undefined,
        })
      );
    });
  });

  describe("Silent Failure Behavior", () => {
    it("should always resolve successfully even on database errors", async () => {
      mockValues.mockRejectedValueOnce(new Error("Any error"));

      const result = await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {});

      // Promise should resolve (not reject) - function returns undefined on error
      expect(result).toBeUndefined();
    });

    it("should continue operation flow without interruption", async () => {
      mockValues.mockRejectedValueOnce(new Error("DB error"));

      let operationCompleted = false;

      // Simulate a real operation flow
      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {});
      operationCompleted = true;

      expect(operationCompleted).toBe(true);
    });

    it("should handle multiple concurrent log failures", async () => {
      mockValues.mockRejectedValue(new Error("DB error"));

      const promises = [
        logAudit("user1", "action1", "resource1", {}),
        logAudit("user2", "action2", "resource2", {}),
        logAudit("user3", "action3", "resource3", {}),
      ];

      // All promises should resolve (not throw)
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large details object", async () => {
      const largeDetails = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `item-${i}`,
          data: "some data",
        })),
      };

      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, largeDetails);

      expect(mockValues).toHaveBeenCalled();
    });

    it("should handle unicode characters in all parameters", async () => {
      await logAudit("用户-123", "操作", "资源", {
        message: "你好世界 🌍",
        emoji: "🚀",
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "用户-123",
          action: "操作",
          resourceType: "资源",
        })
      );
    });

    it("should handle numeric userId (edge case for typing)", async () => {
      await logAudit("123" as any, baseParams.action, baseParams.resourceType, {});

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "123",
        })
      );
    });

    it("should handle multiple rapid calls", async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        logAudit(`user-${i}`, `action-${i}`, "resource", { index: i })
      );

      await Promise.all(promises);

      expect(db.insert).toHaveBeenCalledTimes(100);
    });
  });

  describe("Database Schema Compliance", () => {
    it("should include all required fields for audit_logs table", async () => {
      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {
        count: 5,
      });

      const insertCall = mockValues.mock.calls[0][0];

      // Verify all required schema fields are present
      expect(insertCall).toHaveProperty("id");
      expect(insertCall).toHaveProperty("userId");
      expect(insertCall).toHaveProperty("action");
      expect(insertCall).toHaveProperty("resourceType");
      expect(insertCall).toHaveProperty("details");

      // Verify types
      expect(typeof insertCall.id).toBe("string");
      expect(typeof insertCall.userId).toBe("string");
      expect(typeof insertCall.action).toBe("string");
      expect(typeof insertCall.resourceType).toBe("string");
      expect(typeof insertCall.details).toBe("object");
    });

    it("should generate UUID using crypto.randomUUID", async () => {
      const originalRandomUUID = crypto.randomUUID;
      const mockRandomUUID = mock(() => "test-uuid-12345");
      crypto.randomUUID = mockRandomUUID as any;

      await logAudit(baseParams.userId, baseParams.action, baseParams.resourceType, {});

      const insertCall = mockValues.mock.calls[0][0];
      expect(insertCall.id).toBe("test-uuid-12345");

      crypto.randomUUID = originalRandomUUID;
    });
  });
});
