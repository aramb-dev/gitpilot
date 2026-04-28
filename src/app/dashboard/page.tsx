'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to repositories as the default dashboard view
    router.replace('/dashboard/repos');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex h-screen bg-[#0a0a0a] items-center justify-center font-mono">
      <div className="text-[#00ff00] flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-[#00ff00]/30 border-t-[#00ff00] animate-spin"></span>
        [initializing_dashboard...]
      </div>
    </div>
  );
}
