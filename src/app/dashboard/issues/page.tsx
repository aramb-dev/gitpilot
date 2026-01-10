import { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IssuesPageClient } from '@/components/dashboard/issues/IssuesPageClient';

export const metadata: Metadata = {
  title: 'Issues - GitPilot',
  description: 'Manage issues across multiple repositories with bulk operations',
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

export default async function IssuesPage() {
  const session = await getAuthSession();

  if (!session?.accessToken) {
    redirect('/auth/signin');
  }

  const availableRepos = await getRepositories(session.accessToken);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Issues</h1>
          <p className="text-gray-400 mt-2">
            Triage and manage issues across all your repositories
          </p>
        </div>
      </div>

      {/* Issues Content */}
      <IssuesPageClient availableRepos={availableRepos} />
    </div>
  );
}
