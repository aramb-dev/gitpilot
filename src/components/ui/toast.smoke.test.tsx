import { expect, it, describe } from "bun:test";
import { toast } from "sonner";

describe("Toast System", () => {
  it("should have toast function available", () => {
    expect(toast).toBeDefined();
    expect(typeof toast).toBe("function");
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
  });
});
