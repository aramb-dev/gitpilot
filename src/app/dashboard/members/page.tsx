import { Metadata } from 'next'
import { Users, UserPlus, Shield, Mail, Settings, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Members - GitPilot',
    description: 'Manage organization members and permissions across repositories'
}

export default function MembersPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Members</h1>
                        <p className="text-gray-400 mt-2">
                            Manage team members and their access across all repositories
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Permissions
                        </Button>
                        <Button size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                    <Users className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-4">
                    Organization Management Coming Soon
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Streamline member onboarding and permission management across all your projects.
                </p>

                {/* Feature Preview */}
                <Card className="max-w-2xl mx-auto bg-gray-800/50 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">
                            Planned Features:
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <UserPlus className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Invitations</p>
                                    <p className="text-gray-400 text-sm">Invite multiple developers at once</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Permission Templates</p>
                                    <p className="text-gray-400 text-sm">Apply consistent roles across repos</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Key className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Access Reviews</p>
                                    <p className="text-gray-400 text-sm">Audit and update member permissions</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Onboarding Automation</p>
                                    <p className="text-gray-400 text-sm">Automated welcome flows for new members</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto mb-6">
                        <p className="text-blue-400 text-sm">
                            <Badge variant="secondary" className="mr-2">Pro Tip:</Badge>
                            Member management will integrate with your existing GitHub organization settings
                        </p>
                    </div>

                    <Button variant="outline">
                        Notify Me When Available
                    </Button>
                </div>
            </div>
        </div>
    )
}
