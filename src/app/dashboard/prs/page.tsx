import { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PRsPageClient } from '@/components/dashboard/prs/PRsPageClient';

export const metadata: Metadata = {
  title: 'Pull Requests - GitPilot',
  description: 'Manage pull requests across multiple repositories with bulk operations',
};

async function getRepositories(accessToken: string): Promise<string[]> {
  try {
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const repos = await response.json();
    return repos.map((repo: { full_name: string }) => repo.full_name);
  } catch {
    return [];
  }
}

export default async function PullRequestsPage() {
  const session = await getAuthSession();

  if (!session?.accessToken) {
    redirect('/auth/signin');
  }

  const availableRepos = await getRepositories(session.accessToken);

  return (
    <div className="space-y-6">
      {/* PRs Content */}
      <PRsPageClient availableRepos={availableRepos} />
    </div>
  );
}