'use client';

import { Search } from 'lucide-react';
import { SessionProvider } from 'next-auth/react';
import { BootSequence } from '@/components/dashboard/BootSequence';
import { Breadcrumbs } from '@/components/dashboard/Breadcrumbs';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { sidebarItems } from '@/data/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BootSequence>
        <div className="flex h-screen bg-[#0a0a0a] font-mono relative overflow-hidden">
          {/* Scanline overlay for dashboard */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#000_1px,#000_2px)] z-10" />

          <Sidebar sidebarItems={sidebarItems} />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top bar with breadcrumbs and global search */}
            <header className="flex-shrink-0 border-b border-[#333] px-8 py-4 flex items-center justify-between bg-[#0d0d0d]">
              <Breadcrumbs />
              <div className="relative w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] group-focus-within:text-[#00ff00] transition-colors" />
                <Input
                  placeholder="search_database..."
                  className="pl-10 bg-[#1a1a1a] border-[#333] text-sm h-9 focus-visible:ring-1 focus-visible:ring-[#00ff00] focus-visible:border-[#00ff00] text-[#888] placeholder:text-[#666] transition-all"
                />
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto p-8 relative z-0">{children}</main>
          </div>
        </div>
      </BootSequence>
    </SessionProvider>
  );
}
