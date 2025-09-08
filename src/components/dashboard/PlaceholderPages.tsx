export function IssuesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Bulk Issue Management</h1>
            <p className="text-gray-400">
                This feature is coming soon! You&apos;ll be able to add labels, assignees, and close
                issues across multiple repositories at once.
            </p>
        </div>
    )
}

export function PullRequestsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Bulk Pull Request Management</h1>
            <p className="text-gray-400">
                Soon, you&apos;ll be able to manage pull requests in bulk, including merging,
                closing, and adding reviewers.
            </p>
        </div>
    )
}

export function MembersPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Organization Member Management</h1>
            <p className="text-gray-400">
                Onboard new developers or change permissions for existing members across all
                your projects from this single panel.
            </p>
        </div>
    )
}

export function SettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
            <p className="text-gray-400">
                Manage your GitPilot account, subscription, and notification preferences here.
            </p>
        </div>
    )
}
