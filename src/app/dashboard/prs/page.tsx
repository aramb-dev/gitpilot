import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PRsPageClient } from '@/components/dashboard/prs/PRsPageClient';
import { getUserPreferences } from '@/db/preferences';
import { getAuthSession } from '@/lib/auth';
import { getCachedRepos } from '@/lib/github/repos-service';

export const metadata: Metadata = {
  title: 'Pull Requests - GitPilot',
  description: 'Manage pull requests across multiple repositories with bulk operations',
};

export default async function PullRequestsPage() {
  const session = await getAuthSession();

  if (!session?.accessToken || !session.user?.id) {
    redirect('/auth/signin');
  }

  // Get user preferences for selected organizations
  const prefs = await getUserPreferences(session.user.id);
  const selectedOrgs = prefs.selectedOrgs || [];

  // Fetch repositories from selected organizations with caching
  const result = await getCachedRepos(session.user.id, session.accessToken, selectedOrgs);
  const availableRepos = result.data.map((repo) => repo.full_name);

  return (
    <div className="space-y-6">
      {/* PRs Content */}
      <PRsPageClient availableRepos={availableRepos} />
    </div>
  );
}
