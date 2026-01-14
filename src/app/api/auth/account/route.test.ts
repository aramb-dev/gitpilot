import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GET } from "./route";

mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

const createMockGitHubUser = () => ({
  id: 12345,
  login: "testuser",
  name: "Test User",
  email: "test@example.com",
  avatar_url: "https://avatars.githubusercontent.com/u/12345",
  html_url: "https://github.com/testuser",
  bio: "A test user",
  company: "Test Corp",
  location: "Test City",
  public_repos: 10,
  total_private_repos: 5,
  plan: { name: "pro", space: 0, collaborators: 0, private_repos: 0 },
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2024-01-15T12:00:00Z",
});

describe("Account API Route", () => {
  beforeEach(() => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
    }));
  });

  it("should return normalized account data", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(createMockGitHubUser()), { status: 200 })
      )
    ) as any;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(12345);
    expect(json.data.login).toBe("testuser");
    expect(json.data.name).toBe("Test User");
    expect(json.data.avatarUrl).toBe("https://avatars.githubusercontent.com/u/12345");
    expect(json.data.publicRepos).toBe(10);
    expect(json.data.privateRepos).toBe(5);
    expect(json.data.plan).toBe("pro");
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
    ) as any;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 502 on network error", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network failed"))) as any;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error.code).toBe("NETWORK_ERROR");
  });

  it("should return 502 on GitHub 5xx error", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Server error" }), {
          status: 500,
        })
      )
    ) as any;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error.code).toBe("NETWORK_ERROR");
  });
});
