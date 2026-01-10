'use client'

import { useState } from 'react'
import { User, CreditCard, Bell, Github, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationSelector } from '@/components/dashboard/OrganizationSelector'
import { AccountProfile } from '@/components/dashboard/AccountProfile'
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus'
import { PermissionsDisplay } from '@/components/dashboard/PermissionsDisplay'
import { OrganizationAccessList } from '@/components/dashboard/OrganizationAccessList'
import { AccountDangerZone } from '@/components/dashboard/AccountDangerZone'

type Tab = 'account' | 'github' | 'billing' | 'notifications' | 'security'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('account')

    const tabs = [
        { id: 'account', name: 'Account', icon: User },
        { id: 'github', name: 'GitHub Integration', icon: Github },
        { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
    ] as const

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                        <p className="text-gray-400 mt-2">
                            Manage your account, subscription, and notification preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Categories */}
                <div className="lg:col-span-1">
                    <nav className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-[#21262d] text-[#58a6ff]'
                                        : 'text-gray-400 hover:bg-gray-800'
                                }`}
                            >
                                <tab.icon className="w-5 h-5 mr-3" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2">
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <AccountProfile />
                            <ConnectionStatus />
                            <PermissionsDisplay />
                            <OrganizationAccessList />
                            <AccountDangerZone />
                        </div>
                    )}

                    {activeTab === 'github' && <OrganizationSelector />}

                    {activeTab !== 'account' && activeTab !== 'github' && (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    {tabs.find(t => t.id === activeTab)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 italic">This section is under construction.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
