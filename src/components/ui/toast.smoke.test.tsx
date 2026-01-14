import { expect, it, describe, mock } from "bun:test";
import { toast } from "sonner";

mock.module("sonner", () => {
  const toastMock: any = (message: string) => {};
  toastMock.success = mock(() => {});
  toastMock.error = mock(() => {});
  return { toast: toastMock };
});

describe("Toast System", () => {
  it("should have toast function available", () => {
    expect(toast).toBeDefined();
    expect(typeof toast).toBe("function");
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
  });
});
