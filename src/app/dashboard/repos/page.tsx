import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { RepositoriesPage } from "@/components/dashboard/RepositoriesPage";
import { authOptions } from "@/lib/auth";
import type { Repository } from "@/types/dashboard";

export const metadata: Metadata = {
    title: 'Repositories - GitPilot',
    description: 'Manage and perform bulk operations on your GitHub repositories'
}

export default async function RepositoriesRoute() {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
        redirect("/api/auth/signin?callbackUrl=/dashboard/repos")
    }

    const res = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated&direction=desc",
        {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${session.accessToken}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
        }
    )

    if (!res.ok) {
        redirect("/api/auth/signin?callbackUrl=/dashboard/repos")
    }

    const data = (await res.json()) as Array<{
        id: number
        name: string
        full_name: string
        owner: {
            login: string
        }
        private: boolean
        stargazers_count: number
        updated_at: string
    }>

    const repositories: Repository[] = data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        full_name: repo.full_name,
        visibility: repo.private ? "Private" : "Public",
        stars: repo.stargazers_count,
        updated: new Date(repo.updated_at).toLocaleString(),
    }))

    return <RepositoriesPage repositories={repositories} />
}
