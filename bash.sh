#!/bin/bash

# Create directories
mkdir -p public
mkdir -p src/assets/{images,fonts,icons}
mkdir -p src/components/{common,layout}
mkdir -p src/components/features/{dashboard,settings,auth,billing}
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/routes
mkdir -p src/services
mkdir -p src/store
mkdir -p src/styles
mkdir -p src/types
mkdir -p src/utils

# Create public files
touch public/index.html

# Create page files
touch src/pages/LandingPage.jsx
touch src/pages/LoginPage.jsx
touch src/pages/DashboardPage.jsx
touch src/pages/SettingsPage.jsx
touch src/pages/BillingPage.jsx
touch src/pages/NotFoundPage.jsx

# Create route file
touch src/routes/index.js

# Create service files
touch src/services/auth.js
touch src/services/github.js
touch src/services/billing.js

# Create store files
touch src/store/index.js
touch src/store/authStore.js
touch src/store/userStore.js
touch src/store/uiStore.js

# Create style files
touch src/styles/global.css
touch src/styles/theme.js
touch src/styles/variables.css

# Create type file
touch src/types/index.ts

# Create utility files
touch src/utils/helpers.js
touch src/utils/constants.js
touch src/utils/validators.js

# Create root application files
touch src/App.jsx
touch src/index.jsx

# Create root project files
touch .env
touch .eslintrc.js
touch .gitignore
touch babel.config.js
touch jsconfig.json
touch package.json
touch README.md

echo "GitPilot app directory structure created successfully!"
