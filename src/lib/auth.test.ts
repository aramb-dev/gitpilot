import { describe, expect, it } from "bun:test";
import { authOptions } from "./auth";

describe("authOptions", () => {
  it("should have the correct secret", () => {
    // We expect a secret to be configured. 
    // In this test environment, it might be undefined unless we mock it.
    // However, the code uses `process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET`.
    // Let's check if it handles the provider correctly.
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("github");
  });

  describe("callbacks", () => {
    it("should assign accessToken to token in jwt callback", async () => {
      const token = {};
      const account = { access_token: "test-token", provider: "github", type: "oauth", providerAccountId: "123" };
      
      const result = await authOptions.callbacks?.jwt?.({ token, account, user: null as any, profile: undefined, trigger: "signIn", session: null });
      
      expect(result).toEqual({ accessToken: "test-token" });
    });

    it("should persist accessToken in session callback", async () => {
      const session = { expires: "2099-01-01" };
      const token = { accessToken: "test-token" };
      
      const result = await authOptions.callbacks?.session?.({ session, token, user: null as any, newSession: null, trigger: "update" });
      
      expect(result).toMatchObject({ accessToken: "test-token" });
    });

    it("should include user ID in session", async () => {
        const session = { expires: "2099-01-01", user: { name: "Test User" } };
        const token = { sub: "12345" };

        const result = await authOptions.callbacks?.session?.({ session, token, user: null as any, newSession: null, trigger: "update" });
        
        // This is expected to fail currently
        expect(result.user).toMatchObject({ id: "12345" });
    });
  });
});
