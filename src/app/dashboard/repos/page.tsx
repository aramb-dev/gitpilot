import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RepositoriesPage } from '@/components/dashboard/RepositoriesPage';
import { getAuthSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Repositories - GitPilot',
  description: 'Manage and perform bulk operations on your GitHub repositories',
};

export default async function RepositoriesRoute() {
  const session = await getAuthSession();

  if (!session?.accessToken) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/repos');
  }

  return <RepositoriesPage />;
}
