import { Metadata } from 'next'
import { User, CreditCard, Bell, Github, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Settings - GitPilot',
    description: 'Manage your GitPilot account, subscription, and preferences'
}

export default function SettingsPage() {
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
                        <button className="w-full flex items-center px-4 py-3 bg-[#21262d] text-[#58a6ff] rounded-lg font-medium">
                            <User className="w-5 h-5 mr-3" />
                            Profile
                        </button>
                        <button className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors">
                            <CreditCard className="w-5 h-5 mr-3" />
                            Billing & Plan
                        </button>
                        <button className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 mr-3" />
                            Notifications
                        </button>
                        <button className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors">
                            <Github className="w-5 h-5 mr-3" />
                            GitHub Integration
                        </button>
                        <button className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors">
                            <Shield className="w-5 h-5 mr-3" />
                            Security
                        </button>
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">
                                Profile Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-[#58a6ff] flex items-center justify-center">
                                    <span className="text-white font-semibold text-xl">A</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Alex Doe</h3>
                                    <p className="text-gray-400">alex@example.com</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Change Photo
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white font-medium mb-2">First Name</label>
                                    <Input
                                        type="text"
                                        defaultValue="Alex"
                                        className="bg-gray-700 border-gray-600 focus:border-[#58a6ff]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Last Name</label>
                                    <Input
                                        type="text"
                                        defaultValue="Doe"
                                        className="bg-gray-700 border-gray-600 focus:border-[#58a6ff]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Email</label>
                                <Input
                                    type="email"
                                    defaultValue="alex@example.com"
                                    className="bg-gray-700 border-gray-600 focus:border-[#58a6ff]"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Organization</label>
                                <Input
                                    type="text"
                                    placeholder="Your organization name"
                                    className="bg-gray-700 border-gray-600 focus:border-[#58a6ff]"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span className="text-white font-medium">Pro Plan</span>
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                                        Active
                                    </Badge>
                                </div>
                                <div className="space-x-3">
                                    <Button variant="outline">
                                        Cancel
                                    </Button>
                                    <Button>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
