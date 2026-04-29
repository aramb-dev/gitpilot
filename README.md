# GitPilot

## Bulk GitHub Management Made Easy

GitPilot is a powerful bulk management tool for GitHub repositories, issues, pull requests, and organization members. Built for developers and teams who need to perform operations at scale.

## 🚀 Features

- **Bulk Repository Management**: Change visibility, archive, or delete multiple repos at once
- **Bulk Issue Management**: Close/reopen issues, manage labels and assignees in bulk
- **Bulk Pull Request Management**: Merge, close, or update PRs across repositories
- **Organization Member Management**: Invite, remove, and update member roles
- **Smart Filtering & Search**: Find exactly what you need with powerful filters and saved presets
- **Audit Logging**: Track all bulk operations for accountability
- **GitHub OAuth**: Secure, seamless authentication with your existing GitHub account

## ✨ Why GitPilot?

Managing GitHub resources one by one is tedious and time-consuming. GitPilot provides bulk operations through an intuitive interface—saving hours of manual work for developers with dozens of repositories or teams managing org-wide resources.

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Radix UI primitives
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: Neon Postgres + Drizzle ORM
- **Package Manager**: Bun
- **Linting**: Biome
- **Testing**: Vitest + Playwright

## 🔑 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- GitHub account
- Neon database (free tier works)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gitpilot.git
   cd gitpilot
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=random_secret_string
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_CLIENT_ID=your_github_oauth_app_id
   GITHUB_CLIENT_SECRET=your_github_oauth_app_secret
   ```

4. Set up the database:
   ```bash
   bun run db:push
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

## 📊 Project Structure

```
gitpilot/
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   ├── components/     # React components (UI, dashboard, landing)
│   ├── db/             # Database schema, migrations, and utilities
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Shared utilities and helpers
│   └── types/          # TypeScript type definitions
├── docs/               # Documentation and planning
├── specs/              # Feature specifications
├── public/             # Static assets
└── ... (config files)
```

## 🔄 Deployment

GitPilot can be deployed to any platform supporting Next.js:

```bash
bun run build
bun run start
```

### Database Commands

- `bun run db:generate` - Generate migrations
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema changes
- `bun run db:studio` - Open Drizzle Studio

### Verification

Before committing, run:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

## 🛠️ Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [GitHub API](https://docs.github.com/en/rest)
- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Neon](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Radix UI](https://www.radix-ui.com/)

---

Made with ❤️ by the GitPilot Team
