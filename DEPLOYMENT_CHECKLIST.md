# 🚀 Deployment Checklist

Use this checklist to ensure your Service Management System is production-ready.

## Pre-Deployment Checklist

### ✅ Development Complete

#### Code Quality
- [ ] All pages render without errors
- [ ] No console errors in browser
- [ ] TypeScript compiles without errors
- [ ] All imports are correct
- [ ] No unused variables or imports
- [ ] Code follows consistent formatting

#### Testing
- [ ] Manual testing of all pages completed
- [ ] All forms validate correctly
- [ ] All buttons and links work
- [ ] Mobile responsiveness tested
- [ ] Cross-browser testing done (Chrome, Firefox, Safari)
- [ ] Error handling implemented

#### Backend Integration
- [ ] Supabase database tables created
- [ ] Row Level Security policies set
- [ ] All API routes implemented
- [ ] Authentication working
- [ ] File upload functional
- [ ] CRUD operations tested

### ✅ Configuration

#### Environment Variables
- [ ] `.env.local` configured for development
- [ ] Production environment variables ready
- [ ] All API keys obtained
- [ ] Supabase credentials verified
- [ ] SMTP/email service configured
- [ ] Payment gateway credentials ready

#### Database
- [ ] Schema deployed to production database
- [ ] Indexes created for performance
- [ ] Sample data added (if needed)
- [ ] Backup strategy in place
- [ ] Migration scripts ready

### ✅ Security

#### Authentication
- [ ] Supabase Auth configured
- [ ] Admin routes protected
- [ ] Role-based access control implemented
- [ ] Password requirements set
- [ ] Session management configured

#### Data Protection
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] File upload validation

#### Secrets Management
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] API keys rotated
- [ ] Service role keys protected

### ✅ Performance

#### Optimization
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90

#### Caching
- [ ] Browser caching configured
- [ ] API response caching
- [ ] Static assets cached
- [ ] CDN configured (if using)

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all changes are committed
git status

# Create production branch
git checkout -b production

# Run build test
npm run build

# Fix any build errors
# Commit fixes
git add .
git commit -m "Production ready"

# Push to repository
git push origin production
```

### 2. Set Up Hosting (Vercel)

#### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASSWORD=your_password
   ```

6. Click "Deploy"

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to configure
```

### 3. Configure Domain

1. In Vercel dashboard, go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (up to 48 hours)

### 4. Set Up Production Database

```bash
# Run migrations in Supabase production
# 1. Go to Supabase project
# 2. Navigate to SQL Editor
# 3. Run schema.sql
# 4. Run seed.sql (if needed)
# 5. Enable Row Level Security
# 6. Set up automated backups
```

### 5. Configure Monitoring

#### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Configure in sentry.client.config.js
# and sentry.server.config.js
```

#### Analytics

```bash
# Option 1: Vercel Analytics (built-in)
# Enable in Vercel dashboard

# Option 2: Google Analytics
# Add tracking code to app/layout.tsx
```

### 6. Set Up Email Service

#### SendGrid
```bash
# Sign up at sendgrid.com
# Get API key
# Add to environment variables
SENDGRID_API_KEY=your_key
```

#### AWS SES
```bash
# Configure in AWS Console
# Get SMTP credentials
# Add to environment variables
```

### 7. Configure Payment Gateway

#### Stripe
```bash
npm install @stripe/stripe-js stripe

# Add to environment variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 8. Test Production Deployment

- [ ] Visit production URL
- [ ] Test customer booking flow
- [ ] Test admin dashboard
- [ ] Test authentication
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Test payment processing
- [ ] Test mobile responsiveness
- [ ] Check page load speeds
- [ ] Verify SSL certificate

## Post-Deployment

### Monitoring Setup

#### Daily Checks
- [ ] Error monitoring dashboard
- [ ] Uptime status
- [ ] Database connections
- [ ] API response times
- [ ] Payment gateway status

#### Weekly Checks
- [ ] User feedback
- [ ] Performance metrics
- [ ] Database size
- [ ] Backup verification
- [ ] Security logs

#### Monthly Checks
- [ ] Dependency updates
- [ ] Security patches
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] User analytics

### Backup Strategy

```bash
# Supabase Automated Backups
# 1. Go to Settings → Database
# 2. Enable Point-in-Time Recovery
# 3. Set retention period
# 4. Schedule regular backups

# Manual Backup
# Export database periodically
# Store in secure location
```

### Documentation Updates

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document API endpoints
- [ ] Update environment variables list

## Rollback Plan

### If Deployment Fails

```bash
# Revert to previous deployment in Vercel
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "..." → "Promote to Production"

# Or using CLI
vercel rollback
```

### If Critical Bug Found

```bash
# 1. Create hotfix branch
git checkout production
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# 3. Test locally
# 4. Deploy hotfix
git push origin hotfix/critical-bug
vercel --prod

# 5. Merge to main
git checkout main
git merge hotfix/critical-bug
git push
```

## Maintenance Schedule

### Daily
- Monitor error logs
- Check uptime status
- Review user activity

### Weekly
- Review performance metrics
- Check database health
- Update dependencies (if security patches)

### Monthly
- Full security audit
- Performance optimization
- Database cleanup
- Cost analysis
- Backup verification

### Quarterly
- Major dependency updates
- Feature reviews
- User feedback analysis
- Scalability assessment

## Common Issues & Solutions

### Issue: Build Fails

**Solution**:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment Variables Not Loading

**Solution**:
- Verify all variables are in Vercel dashboard
- Check spelling and format
- Redeploy after updating

### Issue: Database Connection Fails

**Solution**:
- Verify Supabase URL and keys
- Check network/firewall settings
- Verify database is active
- Check connection string

### Issue: Slow Performance

**Solution**:
- Check Lighthouse score
- Optimize images
- Enable caching
- Use CDN for static assets
- Optimize database queries

## Success Metrics

Track these KPIs post-deployment:

### Technical
- [ ] Uptime > 99.9%
- [ ] Page load time < 3 seconds
- [ ] Error rate < 0.1%
- [ ] API response time < 500ms
- [ ] Lighthouse score > 90

### Business
- [ ] Successful bookings per day
- [ ] Customer satisfaction score
- [ ] Invoice payment rate
- [ ] Staff utilization rate
- [ ] Revenue vs targets

## Support Plan

### Level 1: User Support
- Email: support@yourdomain.com
- Response time: 24 hours
- In-app chat support

### Level 2: Technical Support
- Email: tech@yourdomain.com
- Response time: 4 hours
- On-call engineer

### Level 3: Emergency Support
- Phone: +1-XXX-XXX-XXXX
- Response time: 1 hour
- 24/7 availability

## Compliance

- [ ] GDPR compliance (if EU users)
- [ ] Data privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] Accessibility standards met (WCAG 2.1 Level AA)

## Launch Communication

### Internal
- [ ] Team notified of launch
- [ ] Training completed
- [ ] Support docs ready
- [ ] Escalation process defined

### External
- [ ] Customers notified
- [ ] Website updated
- [ ] Social media announcement
- [ ] Press release (if applicable)

---

## Final Checklist Before Going Live

- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Database deployed and tested
- [ ] Authentication working
- [ ] Payment gateway tested
- [ ] Email notifications working
- [ ] Monitoring configured
- [ ] Backup strategy active
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Error tracking active
- [ ] Performance optimized
- [ ] Mobile tested
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Support team ready
- [ ] Rollback plan documented

---

**Ready to deploy?** 🚀

Run through this checklist one more time, then click that deploy button!

**After deployment:**
- Monitor closely for first 24 hours
- Have team on standby
- Keep rollback plan ready
- Celebrate your launch! 🎉
