import { describe, expect, it, mock } from "bun:test";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock getServerSession
mock.module("next-auth", () => ({
  getServerSession: (options: any) => Promise.resolve({
    accessToken: "mock-token"
  }),
}));

// Mock fetch
const originalFetch = global.fetch;
describe("Organizations API Route", () => {
  it("should fetch organizations and user from GitHub", async () => {
    global.fetch = mock((url) => {
      if (url === "https://api.github.com/user/orgs") {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 1, login: "org1", avatar_url: "url1", description: "desc1" }
        ]), { status: 200 }));
      }
      if (url === "https://api.github.com/user") {
        return Promise.resolve(new Response(JSON.stringify(
          { id: 999, login: "user1", avatar_url: "user_url", bio: "user bio" }
        ), { status: 200 }));
      }
      return Promise.reject("Unknown URL");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2); // User + 1 Org
    
    // Check User
    expect(data[0]).toEqual({
      id: 999,
      login: "user1",
      avatar_url: "user_url",
      description: "user bio" // Mapped from bio
    });

    // Check Org
    expect(data[1]).toEqual({
      id: 1,
      login: "org1",
      avatar_url: "url1",
      description: "desc1"
    });
  });

  it("should return 401 if unauthorized", async () => {
    // ... existing test ...
  });
});
