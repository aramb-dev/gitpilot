'use client';

import { AlertTriangle, Bell, CreditCard, Shield, User } from 'lucide-react';
import { useState } from 'react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import { AccountDangerZone } from '@/components/dashboard/AccountDangerZone';
import { AccountProfile } from '@/components/dashboard/AccountProfile';
import { ApiResilienceMetrics } from '@/components/dashboard/ApiResilienceMetrics';
import { AuditLogTable } from '@/components/dashboard/AuditLogTable';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { OrganizationAccessList } from '@/components/dashboard/OrganizationAccessList';
import { OrganizationSelector } from '@/components/dashboard/OrganizationSelector';
import { PermissionsDisplay } from '@/components/dashboard/PermissionsDisplay';
import { UserPreferences } from '@/components/dashboard/UserPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Tab = 'account' | 'github' | 'billing' | 'notifications' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const tabs = [
    { id: 'account' as const, name: 'account', icon: User },
    { id: 'github' as const, name: 'github', icon: GithubIcon },
    { id: 'billing' as const, name: 'billing', icon: CreditCard },
    { id: 'notifications' as const, name: 'notify', icon: Bell },
    { id: 'security' as const, name: 'security', icon: Shield },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="border-b border-[#333] pb-6">
        <p className="text-[#666] text-sm mb-2">$ vim settings</p>
        <h1 className="text-2xl font-bold text-white">// SETTINGS</h1>
      </div>

      {/* Settings Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Categories */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 font-mono text-sm transition-all ${
                    activeTab === tab.id
                      ? 'text-[#00ff00] bg-[#00ff00]/5 border-l-2 border-[#00ff00]'
                      : 'text-[#888] hover:text-white hover:bg-[#1a1a1a] border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />[{tab.name}]
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <AccountProfile />
              <UserPreferences />
              <ConnectionStatus />
              <PermissionsDisplay />
              <OrganizationAccessList />
              <AccountDangerZone />
            </div>
          )}

          {activeTab === 'github' && <OrganizationSelector />}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <ApiResilienceMetrics />
              <AuditLogTable />
            </div>
          )}

          {activeTab === 'billing' && (
            <Card className="bg-[#0d0d0d] border-[#333]">
              <CardHeader>
                <CardTitle className="text-lg font-mono text-white">[billing_status]</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-[#333] bg-[#111]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#888] text-sm">CURRENT_PLAN</span>
                    <span className="text-[#00ff00] font-bold border border-[#00ff00] px-2 py-1 text-xs">
                      HACKER_FREE
                    </span>
                  </div>
                  <p className="text-[#666] text-sm">
                    You are currently on the free tier. Upgrade for unlimited history and advanced
                    automation.
                  </p>
                  <button className="mt-4 w-full py-2 bg-[#333] text-[#888] cursor-not-allowed text-xs font-mono uppercase">
                    Upgrade (Coming Soon)
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-[#0d0d0d] border-[#333]">
              <CardHeader>
                <CardTitle className="text-lg font-mono text-white">
                  [notification_channels]
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-[#333] bg-[#111]">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-[#888]" />
                      <span className="text-sm text-[#ccc]">Email Notifications</span>
                    </div>
                    <span className="text-[#00ff00] text-xs">ENABLED</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#333] bg-[#111]">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#888]" />
                      <span className="text-sm text-[#ccc]">Critical Alerts</span>
                    </div>
                    <span className="text-[#00ff00] text-xs">ENABLED</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
