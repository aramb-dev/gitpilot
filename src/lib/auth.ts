import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user repo read:org delete_repo admin:org",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger }) {
      // On initial sign-in, store access token and connected timestamp
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.connectedAt = new Date().toISOString();
        
        // Store the requested scopes (we know what we asked for)
        token.scopes = ["read:user", "repo", "read:org", "delete_repo", "admin:org"];
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.scopes) {
        session.scopes = token.scopes as string[];
      }
      if (token.connectedAt) {
        session.connectedAt = token.connectedAt as string;
      }
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
