'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  AlertCircle, 
  GitPullRequest, 
  Users, 
  Settings,
  Send,
  Search,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

// Mock data
const mockRepos = [
  { id: 1, name: 'gitpilot-landing', visibility: 'Public', stars: 128, updated: '2 hours ago' },
  { id: 2, name: 'project-nebula', visibility: 'Private', stars: 0, updated: '5 hours ago' },
  { id: 3, name: 'dotfiles', visibility: 'Private', stars: 12, updated: '1 day ago' },
  { id: 4, name: 'design-system-v2', visibility: 'Public', stars: 432, updated: '2 days ago' },
  { id: 5, name: 'api-gateway', visibility: 'Private', stars: 3, updated: '3 days ago' },
  { id: 6, name: 'mobile-app-ios', visibility: 'Private', stars: 1, updated: '5 days ago' },
  { id: 7, name: 'data-pipeline', visibility: 'Public', stars: 89, updated: '1 week ago' },
  { id: 8, name: 'legacy-website', visibility: 'Public', stars: 22, updated: '2 weeks ago' },
  { id: 9, name: 'infra-terraform', visibility: 'Private', stars: 5, updated: '1 month ago' },
  { id: 10, name: 'hackathon-project', visibility: 'Public', stars: 76, updated: '1 month ago' },
]

const sidebarItems = [
  { id: 'repositories', label: 'Repositories', icon: LayoutDashboard },
  { id: 'issues', label: 'Issues', icon: AlertCircle },
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
  { id: 'members', label: 'Members', icon: Users },
]

export default function Dashboard() {
  const [activePage, setActivePage] = useState('repositories')
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedRepos(mockRepos.map(repo => repo.id))
    } else {
      setSelectedRepos([])
    }
  }

  const handleSelectRepo = (repoId: number, checked: boolean) => {
    if (checked) {
      setSelectedRepos([...selectedRepos, repoId])
    } else {
      setSelectedRepos(selectedRepos.filter(id => id !== repoId))
      setSelectAll(false)
    }
  }

  const hasSelectedRepos = selectedRepos.length > 0

  const renderContent = () => {
    switch (activePage) {
      case 'repositories':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Repositories</h1>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    type="search" 
                    placeholder="Search repositories..."
                    className="bg-[#0d1117] border-gray-700 pl-10 w-64 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  variant="outline" 
                  disabled={!hasSelectedRepos}
                  className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                >
                  Make Private
                </Button>
                <Button 
                  variant="outline" 
                  disabled={!hasSelectedRepos}
                  className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                >
                  Archive
                </Button>
                <Button 
                  variant="destructive" 
                  disabled={!hasSelectedRepos}
                  className="bg-red-800/50 text-red-300 border-red-600/50 hover:bg-red-800/80 disabled:opacity-50"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Repositories Table */}
            <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#21262d] border-b border-gray-800">
                  <tr>
                    <th className="p-4 w-12">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="bg-gray-800 border-gray-600"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Visibility</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Stars</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRepos.map((repo) => (
                    <tr key={repo.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedRepos.includes(repo.id)}
                          onCheckedChange={(checked: boolean) => handleSelectRepo(repo.id, checked)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </td>
                      <td className="p-4 font-medium text-white">{repo.name}</td>
                      <td className="p-4">
                        <Badge 
                          variant={repo.visibility === 'Public' ? 'default' : 'secondary'}
                          className={repo.visibility === 'Public' 
                            ? 'bg-green-800/50 text-green-300 hover:bg-green-800/70' 
                            : 'bg-purple-800/50 text-purple-300 hover:bg-purple-800/70'
                          }
                        >
                          {repo.visibility}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-400">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
                          {repo.stars}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{repo.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center space-x-4">
              <span className="text-sm text-gray-400">1-10 of 128</span>
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )

      case 'issues':
        return (
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">Bulk Issue Management</h1>
            <p className="text-gray-400">
              This feature is coming soon! You&apos;ll be able to add labels, assignees, and close
              issues across multiple repositories at once.
            </p>
          </div>
        )

      case 'prs':
        return (
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">Bulk Pull Request Management</h1>
            <p className="text-gray-400">
              Soon, you&apos;ll be able to manage pull requests in bulk, including merging,
              closing, and adding reviewers.
            </p>
          </div>
        )

      case 'members':
        return (
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">Organization Member Management</h1>
            <p className="text-gray-400">
              Onboard new developers or change permissions for existing members across all
              your projects from this single panel.
            </p>
          </div>
        )

      case 'settings':
        return (
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
            <p className="text-gray-400">
              Manage your GitPilot account, subscription, and notification preferences here.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#161b22] border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Send className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">GitPilot</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-[#21262d] text-[#58a6ff] font-semibold'
                    : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setActivePage('settings')}
            className={`w-full flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
              activePage === 'settings'
                ? 'bg-[#21262d] text-[#58a6ff] font-semibold'
                : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
          <div className="flex items-center mt-4 p-2 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#58a6ff] flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-white">Alex Doe</p>
              <button className="text-xs text-gray-400 hover:text-red-500 transition">
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  )
}
