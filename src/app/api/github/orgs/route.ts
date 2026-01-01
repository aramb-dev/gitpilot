import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${session.accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [userRes, orgsRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers, cache: "no-store" }),
    fetch("https://api.github.com/user/orgs", { headers, cache: "no-store" }),
  ]);

  if (!userRes.ok || !orgsRes.ok) {
    return NextResponse.json(
      { error: "GitHub API error", status: 502 },
      { status: 502 }
    );
  }

  const [userData, orgsData] = await Promise.all([
    userRes.json(),
    orgsRes.json(),
  ]);

  const userOrg = {
    id: userData.id,
    login: userData.login,
    avatar_url: userData.avatar_url,
    description: userData.bio || "Personal Account",
  };

  const orgs = orgsData.map((org: any) => ({
    id: org.id,
    login: org.login,
    avatar_url: org.avatar_url,
    description: org.description,
  }));

  return NextResponse.json([userOrg, ...orgs]);
}
