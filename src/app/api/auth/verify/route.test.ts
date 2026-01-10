import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GET } from "./route";

// Mock getServerSession
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

describe("Token Verification API Route", () => {
  beforeEach(() => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
    }));
  });

  it("should return valid=true with user info when token is valid", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            id: 12345,
            login: "testuser",
            avatar_url: "https://avatars.githubusercontent.com/u/12345",
          }),
          {
            status: 200,
            headers: {
              "X-OAuth-Scopes": "repo, read:user, read:org",
              "X-RateLimit-Remaining": "4999",
              "X-RateLimit-Limit": "5000",
              "X-RateLimit-Reset": "1704067200",
            },
          }
        )
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.user.id).toBe(12345);
    expect(data.user.login).toBe("testuser");
    expect(data.scopes).toContain("repo");
    expect(data.scopes).toContain("read:user");
    expect(data.rateLimitRemaining).toBe(4999);
  });

  it("should return valid=false when no session exists", async () => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve(null),
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.valid).toBe(false);
    expect(data.error.code).toBe("TOKEN_REVOKED");
  });

  it("should return valid=false when GitHub returns 401", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Bad credentials" }), {
          status: 401,
        })
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.valid).toBe(false);
    expect(data.error.code).toBe("TOKEN_REVOKED");
  });

  it("should return valid=false on network error", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network failed")));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.valid).toBe(false);
    expect(data.error.code).toBe("NETWORK_ERROR");
  });

  it("should handle empty scopes header", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            id: 12345,
            login: "testuser",
            avatar_url: "https://avatars.githubusercontent.com/u/12345",
          }),
          { status: 200 }
        )
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.scopes).toEqual([]);
  });

  it("should handle GitHub 5xx errors", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Server error" }), {
          status: 500,
        })
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.valid).toBe(false);
    expect(data.error.code).toBe("NETWORK_ERROR");
  });
});
