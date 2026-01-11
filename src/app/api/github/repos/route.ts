import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAllRepos } from "@/lib/github/repos";
import { normalizeRepositories } from "@/lib/github/normalize";
import { ERROR_MESSAGES } from "@/lib/github/errors";
import type { ApiResponse } from "@/types/api-errors";
import type { Repository } from "@/types/repository";
import { getCached, setCache } from "@/db/cache";

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
    user?: { id?: string };
  }) | null;

  if (!session?.accessToken) {
    const response: ApiResponse<Repository[]> = {
      error: {
        code: 'UNAUTHORIZED',
        message: ERROR_MESSAGES.UNAUTHORIZED,
      },
    };
    return NextResponse.json(response, { status: 401 });
  }

  const userId = session.user?.id ?? "anonymous";
  const { searchParams } = new URL(req.url);
  const selectedOrgs = searchParams.get("orgs")?.split(",").filter(Boolean) || [];
  const skipCache = searchParams.get("refresh") === "true";
  
  const cacheKey = `repos:${selectedOrgs.sort().join(",")}`;

  if (!skipCache) {
    const cached = await getCached<Repository[]>(userId, cacheKey);
    if (cached && !cached.isStale) {
      const response: ApiResponse<Repository[]> = {
        data: cached.data,
        meta: { fromCache: true },
      };
      return NextResponse.json(response);
    }
  }

  try {
    const result = await fetchAllRepos(session.accessToken, selectedOrgs);

    const normalizedRepos = normalizeRepositories(result.repos);

    await setCache(userId, cacheKey, "repositories", normalizedRepos, {
      ttlMinutes: 5,
    });

    const warnings: string[] = [...result.warnings];

    if (result.errors.length > 0) {
      for (const orgError of result.errors) {
        warnings.push(`Failed to fetch repos from '${orgError.org}': ${orgError.error.message}`);
      }
    }

    const response: ApiResponse<Repository[]> = {
      data: normalizedRepos,
      ...(warnings.length > 0 && { warnings }),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Repository[]> = {
      error: {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error instanceof Error ? error.message : String(error),
      },
    };
    return NextResponse.json(response, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
  }) | null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { repos } = body;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'repos' array is required." },
        { status: 400 }
      );
    }

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${session.accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const results = await Promise.all(
      repos.map(async ({ owner, repo }: { owner: string; repo: string }) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            method: "DELETE",
            headers,
            cache: "no-store",
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: "Failed to delete" }));
            return {
              repo: `${owner}/${repo}`,
              status: "error",
              error: errorData.message || "Failed to delete repository",
            };
          }

          return {
            repo: `${owner}/${repo}`,
            status: "success",
            data: { full_name: `${owner}/${repo}` }
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

    return NextResponse.json({ success, errors });
  } catch (error) {
    return NextResponse.json(
      { error: "Bad Request" },
      { status: 400 }
    );
  }
}
