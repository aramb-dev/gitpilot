gitpilot-app/
├── public/             # Static assets served directly (index.html, favicon, etc.)
│   ├── index.html
│   └── ...
├── src/                # Main application source code
│   ├── assets/         # Static assets processed by the build tool (images, fonts, icons)
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # General-purpose, shared components (Button, Input, Modal)
│   │   ├── layout/     # Layout components (Header, Footer, Sidebar, PageWrapper)
│   │   └── features/   # Feature-specific components (e.g., RepoList, CommitGraph)
│   │       ├── dashboard/
│   │       ├── settings/
│   │       ├── auth/
│   │       └── billing/
│   ├── hooks/          # Custom React hooks (e.g., useAuth, useApi, useDebounce)
│   ├── pages/          # Page-level components, mapped to routes
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── BillingPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── routes/         # Routing configuration (e.g., using React Router)
│   │   └── index.js    # Defines application routes
│   ├── services/       # API interaction logic (fetching data, etc.)
│   │   ├── auth.js     # Authentication related API calls
│   │   ├── github.js   # GitHub API related calls
│   │   └── billing.js  # Billing related API calls
│   ├── store/          # Global state management (e.g., Zustand)
│   │   ├── index.js    # Main store setup/export
│   │   ├── authStore.js
│   │   ├── userStore.js
│   │   └── uiStore.js
│   ├── styles/         # Global styles, themes, variables
│   │   ├── global.css
│   │   ├── theme.js    # Theme configuration (if using CSS-in-JS)
│   │   └── variables.css # CSS custom properties
│   ├── types/          # TypeScript type definitions (if using TypeScript)
│   │   ├── index.ts
│   │   └── ...
│   ├── utils/          # Utility functions and helpers
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── validators.js
│   ├── App.jsx         # Root application component (routing, global layout)
│   └── index.jsx       # Application entry point (renders App)
├── .env                # Environment variables
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore rules
├── babel.config.js     # Babel configuration (if needed)
├── jsconfig.json       # JS path aliases and settings (or tsconfig.json for TS)
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation
└── yarn.lock or package-lock.json # Lockfile for dependencies
