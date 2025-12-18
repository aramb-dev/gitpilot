# GitHub OAuth Setup (GitPilot)

This project uses **NextAuth (GitHub Provider)** for sign-in and for calling the GitHub API on your behalf.

## 1) Create the GitHub OAuth App

1. Go to GitHub:
   - https://github.com/settings/developers
2. Click:
   - **OAuth Apps**
   - **New OAuth App**

Fill in the fields like this (recommended defaults for local dev):

- **Application name**
  - `GitPilot (Local)`
- **Homepage URL**
  - `http://localhost:3000`
- **Application description**
  - `GitPilot is a bulk GitHub repository manager. Sign in with GitHub to list and manage your repositories from a single dashboard.`
- **Authorization callback URL**
  - `http://localhost:3000/api/auth/callback/github`

Create the app.

## 2) Copy your Client ID + Client Secret

After creating the OAuth App:

- Copy the **Client ID**
- Click **Generate a new client secret** and copy the **Client Secret**

Keep the Client Secret private.

## 3) Add environment variables

Create a file named **`.env.local`** in the project root (do not commit it).

Add:

```bash
# GitHub OAuth
GITHUB_ID=YOUR_CLIENT_ID
GITHUB_SECRET=YOUR_CLIENT_SECRET

# NextAuth secret (required)
# Use either one; this repo reads NEXTAUTH_SECRET first, then AUTH_SECRET
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET
# AUTH_SECRET=YOUR_RANDOM_SECRET

# Recommended (especially for production)
NEXTAUTH_URL=http://localhost:3000
```

To generate a strong secret on macOS:

```bash
openssl rand -base64 32
```

## 4) Restart the dev server

Environment variables are only read on startup.

Restart your dev server after editing `.env.local`.

## 5) Verify sign-in

1. Open `http://localhost:3000`
2. Click **Sign in with GitHub**
3. You should be redirected back to `/dashboard`

## Notes

- This app requests GitHub OAuth scopes: `read:user repo`.
  - `repo` is required to read **private repos**.
- If you deploy, update:
  - **Homepage URL**
  - **Authorization callback URL**
  - `NEXTAUTH_URL`
  to match your production domain.
