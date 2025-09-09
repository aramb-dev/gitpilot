'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to repositories as the default dashboard view
        router.replace('/dashboard/repos')
    }, [router])

    // Show loading state while redirecting
    return (
        <div className="flex h-screen bg-gray-900 items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>
    )
}
