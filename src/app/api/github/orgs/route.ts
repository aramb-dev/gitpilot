import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch("https://api.github.com/user/orgs", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${session.accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "GitHub API error", status: res.status, details: text },
      { status: 502 }
    );
  }

  const data = await res.json();

  const orgs = data.map((org: any) => ({
    id: org.id,
    login: org.login,
    avatar_url: org.avatar_url,
    description: org.description,
  }));

  return NextResponse.json(orgs);
}
