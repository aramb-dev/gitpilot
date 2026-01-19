import { Metadata } from 'next'
import { MembersPageClient } from '@/components/dashboard/members/MembersPageClient'

export const metadata: Metadata = {
    title: 'Members - GitPilot',
    description: 'Manage organization members and permissions across repositories'
}

export default function MembersPage() {
    return (
        <div className="space-y-6">
            <MembersPageClient />
        </div>
    )
}