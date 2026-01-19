import { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IssuesPageClient } from '@/components/dashboard/issues/IssuesPageClient';
import { getCachedRepos } from '@/lib/github/repos-service';
import { getUserPreferences } from '@/db/preferences';

export const metadata: Metadata = {
  title: 'Issues - GitPilot',
  description: 'Manage issues across multiple repositories with bulk operations',
};

export default async function IssuesPage() {
  const session = await getAuthSession();

  if (!session?.accessToken || !session.user?.id) {
    redirect('/auth/signin');
  }

  // Get user preferences for selected organizations
  const prefs = await getUserPreferences(session.user.id);
  const selectedOrgs = prefs.selectedOrgs || [];

  // Fetch repositories from selected organizations with caching
  const result = await getCachedRepos(session.user.id, session.accessToken, selectedOrgs);
  const availableRepos = result.data.map(repo => repo.full_name);

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
