#!/bin/bash

# Script to create the directory structure for the GitPilot React App

# Define the root directory name
APP_ROOT="gitpilot-app"

echo "Creating directory structure for $APP_ROOT..."

# Create root directory
mkdir -p "$APP_ROOT"
cd "$APP_ROOT" || exit # Move into the app directory or exit if failed

# Create top-level directories and files
mkdir -p public \
         src/assets/images \
         src/assets/fonts \
         src/assets/icons \
         src/components/common \
         src/components/layout \
         src/components/features/dashboard \
         src/components/features/settings \
         src/components/features/auth \
         src/components/features/billing \
         src/hooks \
         src/pages \
         src/routes \
         src/services \
         src/store \
         src/styles \
         src/types \
         src/utils

# Create specific empty files
touch public/index.html \
      src/App.jsx \
      src/index.jsx \
      src/assets/.gitkeep \
      src/components/common/.gitkeep \
      src/components/layout/.gitkeep \
      src/components/features/dashboard/.gitkeep \
      src/components/features/settings/.gitkeep \
      src/components/features/auth/.gitkeep \
      src/components/features/billing/.gitkeep \
      src/hooks/.gitkeep \
      src/pages/LandingPage.jsx \
      src/pages/LoginPage.jsx \
      src/pages/DashboardPage.jsx \
      src/pages/SettingsPage.jsx \
      src/pages/BillingPage.jsx \
      src/pages/NotFoundPage.jsx \
      src/routes/index.js \
      src/services/auth.js \
      src/services/github.js \
      src/services/billing.js \
      src/store/index.js \
      src/store/authStore.js \
      src/store/userStore.js \
      src/store/uiStore.js \
      src/styles/global.css \
      src/styles/theme.js \
      src/styles/variables.css \
      src/types/index.ts \
      src/utils/helpers.js \
      src/utils/constants.js \
      src/utils/validators.js \
      .env \
      .eslintrc.js \
      .gitignore \
      babel.config.js \
      jsconfig.json \
      package.json \
      README.md

# Add .gitkeep to empty asset/component directories to ensure they are tracked by git
touch src/assets/images/.gitkeep \
      src/assets/fonts/.gitkeep \
      src/assets/icons/.gitkeep

echo "Directory structure and base files for $APP_ROOT created successfully."
echo "Note: Some files/folders are optional based on your specific setup (e.g., src/types for TypeScript, babel.config.js, src/styles/theme.js for CSS-in-JS)."

# Go back to the original directory
cd ..

exit 0
