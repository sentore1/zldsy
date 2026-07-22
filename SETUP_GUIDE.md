# Service Management System - Complete Setup Guide

This guide will walk you through setting up the Service Management System from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Project Setup](#project-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 18 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** or **yarn**
  - Comes with Node.js
  - Verify: `npm --version`

- **Git** (optional, for version control)
  - Download from [git-scm.com](https://git-scm.com/)

- **Supabase Account** (free tier available)
  - Sign up at [supabase.com](https://supabase.com)

## Supabase Setup

### Step 1: Create a New Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: service-management-system
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free (or choose a paid plan)
4. Click "Create new project"
5. Wait for the project to be provisioned (takes 1-2 minutes)

### Step 2: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Long string starting with `eyJ...` (keep secret!)

### Step 3: Set Up Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire content from `lib/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. Wait for execution to complete
7. Verify tables were created:
   - Go to **Table Editor**
   - You should see all tables listed

### Step 4: Enable Storage (Optional)

For photo uploads:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named "service-photos"
3. Set it to **Public** (or configure policies for private access)
4. Note the bucket URL for later use

### Step 5: Configure Authentication (Optional)

1. Go to **Authentication** → **Providers**
2. Enable Email provider (enabled by default)
3. Optionally enable:
   - Google OAuth
   - Facebook OAuth
   - Other providers as needed

## Project Setup

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd service-management-system

# Install dependencies
npm install

# This will install:
# - Next.js and React
# - Supabase client
# - Tailwind CSS
# - TypeScript
# - All required packages
```

### Step 2: Verify Installation

```bash
# Check for any dependency issues
npm list

# Update if needed
npm update
```

## Database Configuration

### Step 1: Seed Initial Data (Optional)

Create a file `lib/supabase/seed.sql` with sample data:

```sql
-- Insert sample services
INSERT INTO services (name, description, base_price, unit, category, is_active) VALUES
('Cleaning Service', 'Professional cleaning for homes and offices', 50.00, 'per sqm', 'Cleaning', true),
('Fumigation', 'Complete pest control and fumigation services', 80.00, 'per property', 'Pest Control', true),
('Security Services', 'Professional security guard services', 100.00, 'per day', 'Security', true),
('Maintenance', 'General maintenance and repairs', 60.00, 'per hour', 'Maintenance', true),
('Landscaping', 'Garden and landscape maintenance', 70.00, 'per sqm', 'Landscaping', true),
('Construction Support', 'Construction site support services', 150.00, 'per day', 'Construction', true);

-- Insert sample staff
INSERT INTO staff (name, email, phone, role, hourly_rate, is_active) VALUES
('Mike Johnson', 'mike@example.com', '+1234567890', 'Lead Technician', 25.00, true),
('Sarah Williams', 'sarah@example.com', '+1234567891', 'Assistant', 18.00, true),
('Tom Brown', 'tom@example.com', '+1234567892', 'Supervisor', 30.00, true),
('John Davis', 'john@example.com', '+1234567893', 'Technician', 22.00, true);
```

Run this in Supabase SQL Editor.

### Step 2: Set Up Row Level Security (RLS)

The schema already includes basic RLS setup. To customize:

```sql
-- Example: Allow authenticated users to view services
CREATE POLICY "Allow public read access to services" ON services
    FOR SELECT USING (true);

-- Example: Only admins can insert services
CREATE POLICY "Admin can insert services" ON services
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );
```

## Environment Variables

### Step 1: Create `.env.local` File

In the project root, create `.env.local`:

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional - Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional - WhatsApp API
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_number_id

# Optional - Weather API
WEATHER_API_KEY=your_openweather_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Update Configuration

Replace placeholder values with your actual credentials:

1. **Supabase URL and Keys**: From Step 2 of Supabase Setup
2. **SMTP Settings** (for email):
   - Gmail: Use app-specific password
   - SendGrid: Use API key
   - Other: Check provider documentation
3. **WhatsApp API**: Sign up at [developers.facebook.com](https://developers.facebook.com)
4. **Weather API**: Get free key from [openweathermap.org](https://openweathermap.org/api)

### Step 3: Verify Environment Variables

```bash
# Check if variables are loaded
npm run dev

# Should start without errors
# Check terminal for any missing variable warnings
```

## Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Server will start at http://localhost:3000
```

### Access the Application

Open your browser and navigate to:

- **Home Page**: http://localhost:3000
- **Customer Portal**: http://localhost:3000/customer
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Booking**: http://localhost:3000/customer/booking
- **Track Service**: http://localhost:3000/customer/track

### Build for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm start
```

## Testing

### Manual Testing Checklist

#### Customer Portal
- [ ] Can view services list
- [ ] Can create a booking
- [ ] Can upload photos
- [ ] Can track service status

#### Admin Dashboard
- [ ] Can view dashboard stats
- [ ] Can manage customers
- [ ] Can manage services
- [ ] Can manage jobs
- [ ] Can view invoices

### Test Data

Use the seed data from Database Configuration to test features.

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: ./
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
   
3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site

### Other Deployment Options

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Railway
1. Install Railway CLI
2. Run `railway login`
3. Run `railway init`
4. Run `railway up`

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Error

**Error**: "Failed to fetch" or "Network error"

**Solution**:
- Check your Supabase URL and keys
- Verify project is active in Supabase dashboard
- Check internet connection
- Verify RLS policies allow access

#### 2. Database Table Not Found

**Error**: "relation does not exist"

**Solution**:
- Run the schema.sql file again
- Check SQL Editor for errors
- Verify all tables were created in Table Editor

#### 3. Environment Variables Not Loading

**Error**: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution**:
- Ensure `.env.local` file exists in root directory
- Restart development server after adding variables
- Check for typos in variable names
- Use `NEXT_PUBLIC_` prefix for client-side variables

#### 4. Build Errors

**Error**: "Module not found" or "Cannot find module"

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 5. TypeScript Errors

**Error**: Type errors during build

**Solution**:
- Check `types/index.ts` matches your database schema
- Run `npm run build` to see all errors
- Update types as needed

### Getting Help

If you encounter issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Check the [Supabase documentation](https://supabase.com/docs)
3. Search for similar issues on GitHub
4. Create an issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## Next Steps

After successful setup:

1. **Customize the application**:
   - Update branding and colors
   - Modify service offerings
   - Adjust pricing logic

2. **Add features**:
   - Implement payment gateway
   - Add email notifications
   - Set up SMS alerts

3. **Secure the application**:
   - Set up proper authentication
   - Configure RLS policies
   - Add role-based access control

4. **Monitor and maintain**:
   - Set up error tracking (Sentry)
   - Monitor performance (Vercel Analytics)
   - Regular backups of Supabase data

## Conclusion

You now have a fully functional Service Management System! 

For questions or support, refer to the main README.md or create an issue in the repository.

Happy coding! 🚀
