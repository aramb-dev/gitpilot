import { Metadata } from 'next'
import { AlertCircle, Filter, Search, Tag, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Issues - GitPilot',
    description: 'Manage issues across multiple repositories with bulk operations'
}

export default function IssuesPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Issues</h1>
                        <p className="text-gray-400 mt-2">
                            Triage and manage issues across all your repositories
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button size="sm">
                            <Search className="w-4 h-4 mr-2" />
                            Search Issues
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 mb-6">
                    <AlertCircle className="w-10 h-10 text-orange-500" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-4">
                    Bulk Issue Management Coming Soon
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Soon you&apos;ll be able to manage issues across multiple repositories with powerful bulk operations.
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
                                <Tag className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Labeling</p>
                                    <p className="text-gray-400 text-sm">Add or remove labels across multiple issues</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Assignment</p>
                                    <p className="text-gray-400 text-sm">Assign issues to team members</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Close</p>
                                    <p className="text-gray-400 text-sm">Close multiple issues at once</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Search className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Advanced Filtering</p>
                                    <p className="text-gray-400 text-sm">Find issues by status, label, assignee</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8">
                    <Button variant="outline">
                        Notify Me When Available
                    </Button>
                </div>
            </div>
        </div>
    )
}
