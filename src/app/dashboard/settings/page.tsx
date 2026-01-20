'use client'

import { useState } from 'react'
import { User, CreditCard, Bell, Github, Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationSelector } from '@/components/dashboard/OrganizationSelector'
import { AccountProfile } from '@/components/dashboard/AccountProfile'
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus'
import { PermissionsDisplay } from '@/components/dashboard/PermissionsDisplay'
import { OrganizationAccessList } from '@/components/dashboard/OrganizationAccessList'
import { AccountDangerZone } from '@/components/dashboard/AccountDangerZone'
import { UserPreferences } from '@/components/dashboard/UserPreferences'
import { AuditLogTable } from '@/components/dashboard/AuditLogTable'

type Tab = 'account' | 'github' | 'billing' | 'notifications' | 'security'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('account')

    const tabs = [
        { id: 'account' as const, name: 'account', icon: User },
        { id: 'github' as const, name: 'github', icon: Github },
        { id: 'billing' as const, name: 'billing', icon: CreditCard },
        { id: 'notifications' as const, name: 'notify', icon: Bell },
        { id: 'security' as const, name: 'security', icon: Shield },
    ]

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
                            const Icon = tab.icon
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
                                    <Icon className="w-4 h-4 mr-3" />
                                    [{tab.name}]
                                </button>
                            )
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

                    {activeTab === 'security' && <AuditLogTable />}

                    {activeTab === 'billing' && (
                        <Card className="bg-[#0d0d0d] border-[#333]">
                            <CardHeader>
                                <CardTitle className="text-lg font-mono text-white">[billing_status]</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 border border-[#333] bg-[#111]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[#888] text-sm">CURRENT_PLAN</span>
                                        <span className="text-[#00ff00] font-bold border border-[#00ff00] px-2 py-1 text-xs">HACKER_FREE</span>
                                    </div>
                                    <p className="text-[#666] text-sm">
                                        You are currently on the free tier. Upgrade for unlimited history and advanced automation.
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
                                <CardTitle className="text-lg font-mono text-white">[notification_channels]</CardTitle>
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
    )
}