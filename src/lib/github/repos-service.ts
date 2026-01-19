import { fetchAllRepos } from "./repos";
import { normalizeRepositories } from "./normalize";
import { getCached, setCache } from "@/db/cache";
import type { Repository } from "@/types/repository";

export interface GetCachedReposResult {
  data: Repository[];
  warnings: string[];
  fromCache: boolean;
}

export async function getCachedRepos(
  userId: string,
  accessToken: string,
  selectedOrgs: string[] = [],
  skipCache = false
): Promise<GetCachedReposResult> {
  const cacheKey = `repos:${selectedOrgs.sort().join(",")}`;

  if (!skipCache) {
    const cached = await getCached<Repository[]>(userId, cacheKey);
    if (cached && !cached.isStale) {
      return {
        data: cached.data,
        warnings: [],
        fromCache: true,
      };
    }
  }

  const result = await fetchAllRepos(accessToken, selectedOrgs);
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

  return {
    data: normalizedRepos,
    warnings,
    fromCache: false,
  };
}
