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
        <div className="space-y-6 font-mono">
            {/* Page Header */}
            <div className="border-b border-[#333] pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[#666] text-sm mb-2">$ ls members</p>
                        <h1 className="text-2xl font-bold text-white">// MEMBERS</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            PERMISSIONS
                        </Button>
                        <Button 
                            size="sm"
                            className="bg-[#00ff00] text-black font-bold hover:bg-[#00cc00]"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            INVITE_MEMBER
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16 bg-[#0d0d0d] border border-[#333]">
                <div className="inline-flex items-center justify-center w-20 h-20 border border-[#00ff00]/30 bg-[#00ff00]/5 mb-6">
                    <Users className="w-10 h-10 text-[#00ff00]" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-4 italic uppercase tracking-tighter">
                    // ORGANIZATION_MANAGEMENT_PENDING
                </h2>

                <p className="text-[#888] max-w-md mx-auto mb-8 text-sm">
                    &gt; Streamline member onboarding and permission management across all your projects.
                </p>

                {/* Feature Preview */}
                <Card className="max-w-2xl mx-auto bg-[#0a0a0a] border-[#333] rounded-none">
                    <CardHeader className="border-b border-[#333]">
                        <CardTitle className="text-sm font-bold text-white uppercase">
                            [PLANNED_FEATURES]
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            <div className="flex items-start space-x-3 group">
                                <UserPlus className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">BULK_INVITATIONS</p>
                                    <p className="text-[#666] text-xs">Invite multiple developers at once</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <Shield className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">PERMISSION_TEMPLATES</p>
                                    <p className="text-[#666] text-xs">Apply consistent roles across repos</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <Key className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">ACCESS_REVIEWS</p>
                                    <p className="text-[#666] text-xs">Audit and update member permissions</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <Mail className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">ONBOARDING_AUTO</p>
                                    <p className="text-[#666] text-xs">Automated welcome flows for new members</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-12">
                    <div className="bg-[#00ff00]/5 border border-[#00ff00]/20 p-4 max-w-md mx-auto mb-8">
                        <p className="text-[#00ff00] text-xs">
                            <span className="font-black mr-2 uppercase">[PRO_TIP]:</span>
                            Member management will integrate with your existing GitHub organization settings
                        </p>
                    </div>

                    <Button 
                        variant="outline"
                        className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] font-bold"
                    >
                        &gt; NOTIFY_ME_WHEN_AVAILABLE
                    </Button>
                </div>
            </div>
        </div>
    )
}