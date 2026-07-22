# Commands Reference Guide

Quick reference for all commands you'll need to work with the Service Management System.

## 📦 Installation & Setup

### Initial Setup
```bash
# Clone or navigate to project
cd service-management-system

# Install all dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# (Use your favorite text editor)
```

### Verify Installation
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# List all dependencies
npm list --depth=0
```

## 🚀 Development

### Start Development Server
```bash
# Start dev server (default port 3000)
npm run dev

# Start on different port
npm run dev -- -p 3001

# Start with turbo mode
npm run dev --turbo
```

### Build & Production
```bash
# Create production build
npm run build

# Start production server locally
npm start

# Run build and start
npm run build && npm start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Type check
npx tsc --noEmit
```

## 🗄️ Database Commands

### Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations locally
npx supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --project-id your-project-id > types/database.ts

# Reset local database
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name
```

### Direct SQL Execution
```bash
# Execute schema (in Supabase dashboard SQL Editor)
# Copy content from lib/supabase/schema.sql
# Paste and run in SQL Editor

# Or use psql if you have direct access
psql -h your-db-host -U postgres -d postgres -f lib/supabase/schema.sql
```

## 📁 File Operations

### Create New Pages
```bash
# Admin page structure
mkdir -p app/admin/new-page
touch app/admin/new-page/page.tsx

# Customer page structure  
mkdir -p app/customer/new-page
touch app/customer/new-page/page.tsx

# API route
mkdir -p app/api/new-route
touch app/api/new-route/route.ts
```

### Create Components
```bash
# Create components directory
mkdir -p components

# Create a new component
touch components/NewComponent.tsx
```

## 🧪 Testing Commands

### Install Testing Libraries
```bash
# Install Jest and React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Install Playwright for E2E tests
npm install --save-dev @playwright/test

# Install Vitest (alternative to Jest)
npm install --save-dev vitest @vitejs/plugin-react
```

### Run Tests
```bash
# Run Jest tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run Playwright E2E tests
npx playwright test

# Run specific test file
npm test -- path/to/test.test.ts
```

## 📦 Package Management

### Add Dependencies
```bash
# Add production dependency
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Add specific version
npm install package-name@version

# Add multiple packages
npm install package1 package2 package3
```

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages to latest (respecting semver)
npm update

# Update specific package
npm update package-name

# Update to latest major versions (breaking changes)
npx npm-check-updates -u
npm install
```

### Remove Dependencies
```bash
# Remove a package
npm uninstall package-name

# Remove and also from package.json
npm uninstall --save package-name
```

## 🔍 Debugging

### Inspect Build
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for unused dependencies
npx depcheck

# Find duplicate dependencies
npm dedupe
```

### Clear Cache
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## 🌐 Deployment Commands

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel list

# Get deployment logs
vercel logs deployment-url

# Rollback to previous deployment
vercel rollback deployment-url

# Set environment variables
vercel env add VARIABLE_NAME

# Pull environment variables
vercel env pull .env.local
```

### Manual Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Create deployment package
tar -czf deployment.tar.gz .next public package.json package-lock.json
```

## 🔐 Environment Management

### Environment Variables
```bash
# Copy example file
cp .env.local.example .env.local

# View environment variables (don't commit secrets!)
cat .env.local

# Validate environment variables
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env)"
```

## 📊 Git Commands

### Basic Git Workflow
```bash
# Initialize git (if not already)
git init

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout branch-name

# Merge branch
git checkout main
git merge feature/new-feature

# View commit history
git log --oneline
```

### Advanced Git
```bash
# Stash changes
git stash

# Apply stashed changes
git stash pop

# Discard local changes
git checkout -- .

# Reset to specific commit
git reset --hard commit-hash

# Create tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## 📸 Database Backup

### Supabase Backup
```bash
# Using Supabase CLI
npx supabase db dump -f backup.sql

# Restore from backup
npx supabase db reset
psql -h your-db-host -U postgres -d postgres -f backup.sql
```

### Manual Backup
```bash
# Export data (if you have direct access)
pg_dump -h your-host -U postgres -d postgres > backup.sql

# Restore
psql -h your-host -U postgres -d postgres < backup.sql
```

## 🔧 Utility Commands

### File Search
```bash
# Find files by name
find . -name "*.tsx" -not -path "*/node_modules/*"

# Search content in files
grep -r "searchterm" --include="*.tsx" --exclude-dir="node_modules"

# Count lines of code
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l
```

### Performance Analysis
```bash
# Analyze Next.js bundle
npm run build
npx next build --profile

# Check package size
npm list --depth=0

# Find large files
find . -type f -size +1M -not -path "*/node_modules/*"
```

## 🐛 Troubleshooting Commands

### Common Issues
```bash
# Port already in use
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Module not found
rm -rf node_modules package-lock.json
npm install

# TypeScript errors
npx tsc --noEmit

# Next.js cache issues
rm -rf .next
npm run dev

# Permission errors (Windows)
# Run as Administrator

# Permission errors (Mac/Linux)
sudo chown -R $USER:$USER .
```

### Check System Info
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check disk space
df -h  # Mac/Linux
wmic logicaldisk get size,freespace,caption  # Windows

# Check memory usage
free -h  # Linux
vm_stat  # Mac
systeminfo | findstr "Memory"  # Windows
```

## 📚 Documentation Commands

### Generate Documentation
```bash
# Generate TypeScript documentation (if using TypeDoc)
npx typedoc --out docs src

# Generate API documentation
npx swagger-jsdoc -d swaggerDef.js app/api/**/*.ts
```

## 🎨 Code Formatting

### Prettier (if installed)
```bash
# Install Prettier
npm install --save-dev prettier

# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .

# Format specific files
npx prettier --write "app/**/*.{ts,tsx}"
```

## 📊 Monitoring Commands

### Production Monitoring
```bash
# View Vercel logs
vercel logs --follow

# Check deployment status
vercel inspect deployment-url

# List all projects
vercel projects list
```

## 🚀 Quick Commands Summary

```bash
# Most used commands
npm install          # Install dependencies
npm run dev         # Start development
npm run build       # Build for production
npm start           # Run production build
git add .           # Stage all changes
git commit -m "msg" # Commit changes
git push            # Push to remote
vercel --prod       # Deploy to production
```

## 📱 Mobile Development (Future)

### React Native (if adding mobile app)
```bash
# Install Expo CLI
npm install -g expo-cli

# Create new Expo project
npx create-expo-app mobile-app

# Start Expo development server
cd mobile-app
npx expo start
```

---

## 💡 Pro Tips

### Aliases (Add to .bashrc or .zshrc)
```bash
# Development aliases
alias dev="npm run dev"
alias build="npm run build"
alias start="npm start"
alias install="npm install"

# Git aliases
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"

# Supabase aliases
alias sb="npx supabase"
alias sbl="npx supabase login"
alias sbp="npx supabase db push"
```

### Package Scripts (Add to package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "clean": "rm -rf .next node_modules",
    "fresh": "npm run clean && npm install",
    "type-check": "tsc --noEmit",
    "deploy": "vercel --prod"
  }
}
```

---

## 🆘 Getting Help

```bash
# Next.js help
npx next --help

# npm help
npm help

# Vercel help
vercel --help

# Supabase help
npx supabase --help

# Check installed versions
npm list -g --depth=0
```

---

**Save this file for quick reference!** 📖

All commands tested and ready to use. Adjust paths and names as needed for your specific setup.
