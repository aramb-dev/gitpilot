import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GET } from "./route";

mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

describe("Organization Status API Route", () => {
  beforeEach(() => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
    }));
  });

  it("should return org statuses for user's organizations", async () => {
    const mockOrgs = [
      { id: 1, login: "org1", avatar_url: "https://example.com/1", description: "Org 1" },
      { id: 2, login: "org2", avatar_url: "https://example.com/2", description: "Org 2" },
    ];

    global.fetch = mock((url: string) => {
      if (url.includes("/user/orgs")) {
        return Promise.resolve(
          new Response(JSON.stringify(mockOrgs), { status: 200 })
        );
      }
      if (url.includes("/repos")) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      if (url.includes("/memberships")) {
        return Promise.resolve(
          new Response(JSON.stringify({ role: "member" }), { status: 200 })
        );
      }
      return Promise.resolve(new Response("{}", { status: 200 }));
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].login).toBe("org1");
    expect(json.data[1].login).toBe("org2");
  });

  it("should return 401 when no session exists", async () => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve(null),
    }));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 401 when GitHub returns 401", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Bad credentials" }), {
          status: 401,
        })
      )
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return empty array when user has no orgs", async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("should return 502 on network error", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network failed")));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error.code).toBe("NETWORK_ERROR");
  });
});
