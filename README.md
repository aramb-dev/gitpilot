# GitPilot

## Bulk GitHub Repository Management Made Easy

GitPilot is an efficient, bulk management solution for GitHub repositories. It allows developers and organizations to perform repository operations at scale, saving valuable time and streamlining GitHub workflows.

![GitPilot Banner](https://placeholder-for-gitpilot-banner.com)

## 🚀 Features

- **Bulk Visibility Management**: Change multiple repositories from public to private (or vice versa) with just a few clicks
- **Bulk Repository Deletion**: Clean up your GitHub account by removing multiple repositories at once
- **Smart Filtering**: Find exactly what you need with powerful search and filtering options
- **Intuitive Interface**: Manage everything from a single, elegant dashboard

## ✨ Why GitPilot?

Managing GitHub repositories one by one can be tedious and time-consuming, especially for users and organizations with numerous repositories. GitPilot solves this problem by providing bulk operations with a user-friendly interface.

## 💻 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Frontend**: React 19.2.0 with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with dark theme
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner toast library
- **Authentication**: GitHub OAuth (planned)
- **API Integration**: GitHub API (planned)
- **Hosting**: Netlify

## 🔑 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- GitHub account
- Firebase account (for development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gitpilot.git
   cd gitpilot
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   See `.env.example` for all required environment variables including:
   - GitHub OAuth credentials
   - NextAuth.js configuration
   - Database connection (when implemented)
   - Optional: Sentry, Google Analytics

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint for code quality checks

## 📊 Project Structure

```
gitpilot/
├── public/                      # Static assets (images, icons)
├── src/
│   ├── app/                     # Next.js App Router (file-based routing)
│   │   ├── layout.tsx           # Root layout with Providers
│   │   ├── page.tsx             # Landing page (marketing)
│   │   ├── globals.css          # Global styles & Tailwind theme
│   │   └── dashboard/           # Dashboard routes
│   │       ├── layout.tsx       # Dashboard layout with Sidebar & ErrorBoundary
│   │       ├── page.tsx         # Dashboard home (redirects to /repos)
│   │       ├── repos/           # Repository management
│   │       ├── issues/          # Issues management (coming soon)
│   │       ├── prs/             # Pull requests (coming soon)
│   │       ├── members/         # Team members (coming soon)
│   │       └── settings/        # User settings
│   │
│   ├── components/              # Reusable React components
│   │   ├── ErrorBoundary.tsx    # Error boundary for graceful errors
│   │   ├── Providers.tsx        # Global providers (Toaster)
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   ├── Breadcrumbs.tsx  # Dynamic breadcrumbs
│   │   │   ├── RepositoriesPage.tsx
│   │   │   ├── RepositoryTable.tsx
│   │   │   ├── RepositoryRow.tsx
│   │   │   ├── RepositoryActions.tsx
│   │   │   └── Pagination.tsx
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── checkbox.tsx
│   │       ├── badge.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── loading.tsx
│   │       └── empty-state.tsx
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── dashboard.ts
│   ├── data/                    # Mock data (temporary)
│   │   └── dashboard.ts
│   └── lib/                     # Utility functions
│       └── utils.ts             # cn() helper for class merging
│
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── components.json              # shadcn/ui configuration
├── CLAUDE.md                    # AI assistant documentation
└── CODE_REVIEW.md               # Code review report
```

## 💰 Pricing Plans

| Feature                    | Free Plan                  | Paid Plan                 |
| -------------------------- | -------------------------- | ------------------------- |
| Bulk Repository Management | Personal repositories only | Organization repositories |
| Repository Filters         | Basic                      | Advanced                  |
| Number of Operations       | Limited                    | Unlimited                 |
| Support                    | Standard                   | Priority                  |

## 🔄 Deployment

GitPilot is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify for continuous deployment.

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
- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [ShadCN UI](https://ui.shadcn.com/)

---

Made with ❤️ by the GitPilot Team
