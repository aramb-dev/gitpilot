# Technology Stack - GitPilot

## Core Technologies
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Provides static typing for better developer experience and code reliability.
- **Frontend Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) - React framework for building performant web applications with server-side capabilities.
- **Library**: [React 19](https://react.dev/) - Modern UI library for building component-based interfaces.
- **Package Manager & Runtime**: [Bun](https://bun.sh/) - Extremely fast JavaScript all-in-one toolset.

## UI & Styling
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - Accessible and customizable UI components built on top of [Radix UI](https://www.radix-ui.com/).
- **Icons**: [Lucide React](https://lucide.dev/) - Clean and consistent icon set for the dashboard.
- **Utilities**: `tailwind-merge`, `clsx`, `class-variance-authority` - For managing dynamic CSS classes efficiently.

## Backend & Integration
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) - Flexible authentication solution for Next.js, configured for GitHub OAuth.
- **API Integration**: GitHub REST API - Used for performing bulk repository operations.
