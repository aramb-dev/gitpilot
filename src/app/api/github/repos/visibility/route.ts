import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RepoParams {
  owner: string;
  repo: string;
}

interface RequestBody {
  repos: RepoParams[];
  visibility: "public" | "private";
}

export async function PATCH(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
  }) | null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: RequestBody = await req.json();
    const { repos, visibility } = body;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'repos' array is required." },
        { status: 400 }
      );
    }

    if (!visibility || (visibility !== "public" && visibility !== "private")) {
      return NextResponse.json(
        { error: "Invalid request: 'visibility' must be 'public' or 'private'." },
        { status: 400 }
      );
    }

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${session.accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    const isPrivate = visibility === "private";

    const results = await Promise.all(
      repos.map(async ({ owner, repo }) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ private: isPrivate }),
            cache: "no-store",
          });

          if (!res.ok) {
            const errorData = await res.json();
            return {
              repo: `${owner}/${repo}`,
              status: "error",
              error: errorData.message || "Failed to update visibility",
            };
          }

          const data = await res.json();
          return {
            repo: `${owner}/${repo}`,
            status: "success",
            data: {
                name: data.name,
                full_name: data.full_name,
                private: data.private
            }
          };
        } catch (error) {
          return {
            repo: `${owner}/${repo}`,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown network error",
          };
        }
      })
    );

    const success = results.filter((r) => r.status === "success").map((r) => r.data);
    const errors = results.filter((r) => r.status === "error");

    if (success.length > 0) {
      const userId = (session.user as any)?.id ?? "anonymous";
      await import("@/db/cache").then(m => m.invalidateCacheByPrefix(userId, "repos:"));
    }

    return NextResponse.json({ success, errors });
  } catch (error) {
     // Likely JSON parse error or other unexpected issues
    return NextResponse.json(
      { error: "Bad Request" },
      { status: 400 }
    );
  }
}