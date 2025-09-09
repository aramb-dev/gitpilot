import { Metadata } from 'next'
import { GitPullRequest, Filter, Search, GitMerge, MessageSquare, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Pull Requests - GitPilot',
    description: 'Review and manage pull requests across multiple repositories'
}

export default function PullRequestsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pull Requests</h1>
                        <p className="text-gray-400 mt-2">
                            Review, merge, and manage pull requests across all repositories
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button size="sm">
                            <Search className="w-4 h-4 mr-2" />
                            Search PRs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 mb-6">
                    <GitPullRequest className="w-10 h-10 text-purple-500" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-4">
                    Bulk PR Management Coming Soon
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Streamline your code review process with powerful bulk operations for pull requests.
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
                                <GitMerge className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Merge</p>
                                    <p className="text-gray-400 text-sm">Merge multiple ready PRs at once</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Eye className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Review Assignment</p>
                                    <p className="text-gray-400 text-sm">Assign reviewers to multiple PRs</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Close</p>
                                    <p className="text-gray-400 text-sm">Close outdated or duplicate PRs</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MessageSquare className="w-5 h-5 text-[#58a6ff] mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">Bulk Comments</p>
                                    <p className="text-gray-400 text-sm">Add comments to multiple PRs</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 space-x-4">
                    <Button variant="outline">
                        Notify Me When Available
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        Request Early Access
                    </Button>
                </div>
            </div>
        </div>
    )
}
