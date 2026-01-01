import { describe, expect, it, mock } from "bun:test";
import { GET } from "./route";

// Mock getServerSession
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

describe("Repositories API Route", () => {
  it("should fetch repos for user and multiple orgs", async () => {
    global.fetch = mock((url: string) => {
      if (url.includes("/user/repos")) {
        return Promise.resolve(new Response(JSON.stringify([{ id: 1, name: "user-repo", full_name: "user/user-repo", owner: { login: "user" }, private: false, stargazers_count: 5, updated_at: "2023-01-01T00:00:00Z" }])));
      }
      if (url.includes("/orgs/org1/repos")) {
        return Promise.resolve(new Response(JSON.stringify([{ id: 2, name: "org1-repo", full_name: "org1/org1-repo", owner: { login: "org1" }, private: true, stargazers_count: 10, updated_at: "2023-01-02T00:00:00Z" }])));
      }
      return Promise.resolve(new Response(JSON.stringify([])));
    });

    const req = { url: "http://localhost/api/github/repos?orgs=org1" } as any;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    // Sorted by updated_at desc, so org1-repo (Jan 2) should be first
    expect(data[0].name).toBe("org1-repo");
    expect(data[1].name).toBe("user-repo");
  });

  it("should handle empty orgs list", async () => {
    global.fetch = mock((url: string) => {
      if (url.includes("/user/repos")) {
        return Promise.resolve(new Response(JSON.stringify([{ id: 1, name: "user-repo", full_name: "user/user-repo", owner: { login: "user" }, private: false, stargazers_count: 5, updated_at: "2023-01-01T00:00:00Z" }])));
      }
      return Promise.resolve(new Response(JSON.stringify([])));
    });

    const req = { url: "http://localhost/api/github/repos" } as any;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("user-repo");
  });
});
