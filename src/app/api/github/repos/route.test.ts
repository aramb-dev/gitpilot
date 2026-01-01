import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GET, DELETE } from "./route";

// Mock getServerSession
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

describe("Repositories API Route", () => {
  beforeEach(() => {
    mock.module("next-auth", () => ({
      getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
    }));
    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify({}))));
  });

  describe("GET", () => {
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

    it("should return 401 if unauthorized", async () => {
      mock.module("next-auth", () => ({
        getServerSession: () => Promise.resolve(null),
      }));

      const req = { url: "http://localhost/api/github/repos" } as any;
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it("should return 502 if GitHub API fails", async () => {
       global.fetch = mock(() => Promise.reject(new Error("GitHub down")));
       const req = { url: "http://localhost/api/github/repos" } as any;
       const response = await GET(req);
       expect(response.status).toBe(502);
    });
  });

  describe("DELETE", () => {
    it("should delete multiple repos", async () => {
      global.fetch = mock((url: string, options: any) => {
        if (options.method === "DELETE") {
          return Promise.resolve(new Response(null, { status: 204 }));
        }
        return Promise.resolve(new Response(null, { status: 404 }));
      });

      const req = {
        json: async () => ({
          repos: [
            { owner: "user", repo: "repo1" },
            { owner: "user", repo: "repo2" },
          ],
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toHaveLength(2);
      expect(data.errors).toHaveLength(0);
    });

    it("should handle partial failures in deletion", async () => {
      global.fetch = mock((url: string) => {
        if (url.includes("repo1")) {
          return Promise.resolve(new Response(null, { status: 204 }));
        }
        return Promise.resolve(new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }));
      });

      const req = {
        json: async () => ({
          repos: [
            { owner: "user", repo: "repo1" },
            { owner: "user", repo: "fail-repo" },
          ],
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toHaveLength(1);
      expect(data.errors).toHaveLength(1);
    });

    it("should return 401 if unauthorized", async () => {
      mock.module("next-auth", () => ({
        getServerSession: () => Promise.resolve(null),
      }));

      const req = {
        json: async () => ({
          repos: [{ owner: "user", repo: "repo1" }],
        }),
      } as any;

      const response = await DELETE(req);
      expect(response.status).toBe(401);
    });

    it("should return 400 if validation fails (empty repos)", async () => {
      // Reset mock
      mock.module("next-auth", () => ({
        getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
      }));

      const req = {
        json: async () => ({
          repos: []
        })
      } as any;

      const response = await DELETE(req);
      expect(response.status).toBe(400);
    });

    it("should handle network errors", async () => {
      global.fetch = mock(() => Promise.reject(new Error("Network Error")));

      const req = {
        json: async () => ({
          repos: [{ owner: "user", repo: "net-fail" }],
        }),
      } as any;

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.errors).toHaveLength(1);
      expect(data.errors[0].error).toBe("Network Error");
    });
  });
});
