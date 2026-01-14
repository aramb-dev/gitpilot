import { describe, expect, it, mock, beforeEach } from "bun:test";
import { PATCH } from "./route";

// Mock getServerSession
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
}));

describe("Repo Archive API Route", () => {
  beforeEach(() => {
    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify({})))) as any;
  });

  it("should archive multiple repos", async () => {
    global.fetch = mock((url: string, options: any) => {
      if (url.includes("/repos/user/repo1") && options.method === "PATCH") {
        const body = JSON.parse(options.body);
        if (body.archived === true) {
             return Promise.resolve(new Response(JSON.stringify({ name: "repo1", archived: true })));
        }
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
    }) as any;

    const req = {
      json: async () => ({
        repos: [
          { owner: "user", repo: "repo1" },
        ],
      }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toHaveLength(1);
    expect(data.errors).toHaveLength(0);
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

    const response = await PATCH(req);
    expect(response.status).toBe(401);
  });

  it("should handle partial failures", async () => {
    // Reset mock
    mock.module("next-auth", () => ({
        getServerSession: () => Promise.resolve({ accessToken: "mock-token" }),
    }));

    global.fetch = mock((url: string) => {
        if (url.includes("repo1")) {
            return Promise.resolve(new Response(JSON.stringify({ name: "repo1", archived: true })));
        }
        return Promise.resolve(new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }));
    }) as any;

    const req = {
        json: async () => ({
            repos: [
              { owner: "user", repo: "repo1" },
              { owner: "user", repo: "fail-repo" },
            ],
        }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toHaveLength(1);
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].repo).toContain("fail-repo");
  });

      it("should handle network errors", async () => {
        global.fetch = mock(() => Promise.reject(new Error("Network Error"))) as any;
    const req = {
        json: async () => ({
            repos: [{ owner: "user", repo: "net-fail" }],
        }),
    } as any;

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].error).toBe("Network Error");
  });

  it("should return 400 if validation fails (empty repos)", async () => {
      const req = {
        json: async () => ({
            repos: []
        })
      } as any;
      
      const response = await PATCH(req);
      expect(response.status).toBe(400);
  });
});