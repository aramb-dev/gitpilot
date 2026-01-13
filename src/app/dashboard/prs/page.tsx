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
        <div className="space-y-6 font-mono">
            {/* Page Header */}
            <div className="border-b border-[#333] pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[#666] text-sm mb-2">$ ls prs</p>
                        <h1 className="text-2xl font-bold text-white">// PULL_REQUESTS</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            FILTER
                        </Button>
                        <Button 
                            size="sm"
                            className="bg-[#00ff00] text-black font-bold hover:bg-[#00cc00]"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            SEARCH_PRS
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16 bg-[#0d0d0d] border border-[#333]">
                <div className="inline-flex items-center justify-center w-20 h-20 border border-purple-500/30 bg-purple-500/5 mb-6">
                    <GitPullRequest className="w-10 h-10 text-purple-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-4 italic uppercase tracking-tighter">
                    // BULK_PR_MANAGEMENT_PENDING
                </h2>

                <p className="text-[#888] max-w-md mx-auto mb-8 text-sm">
                    &gt; Streamline your code review process with powerful bulk operations for pull requests.
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
                                <GitMerge className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">BULK_MERGE</p>
                                    <p className="text-[#666] text-xs">Merge multiple ready PRs at once</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <Eye className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">REVIEW_ASSIGNMENT</p>
                                    <p className="text-[#666] text-xs">Assign reviewers to multiple PRs</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <X className="w-5 h-5 text-red-500 mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">BULK_CLOSE</p>
                                    <p className="text-[#666] text-xs">Close outdated or duplicate PRs</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <MessageSquare className="w-5 h-5 text-[#00ff00] mt-0.5 opacity-50 group-hover:opacity-100" />
                                <div>
                                    <p className="text-white font-bold text-sm">BULK_COMMENTS</p>
                                    <p className="text-[#666] text-xs">Add comments to multiple PRs</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-12 space-x-4">
                    <Button 
                        variant="outline"
                        className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] font-bold"
                    >
                        &gt; NOTIFY_ME
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 border border-purple-500">
                        REQUEST_EARLY_ACCESS
                    </Button>
                </div>
            </div>
        </div>
    )
}