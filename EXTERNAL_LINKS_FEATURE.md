# External Links Management Feature

## Overview

The External Links feature allows admins to add custom links (blog posts, tips pages, resources, social media) that will appear in the footer and customer portal. Perfect for directing customers to helpful content like cleaning tips, pest prevention guides, FAQs, and more.

---

## ✅ What Has Been Added

### 1. Database Schema
**File:** `lib/supabase/add-external-links-system.sql`

**Table:** `external_links`
- Store unlimited custom links
- Categorize links (tips, blog, resources, social, help)
- Control where links appear (footer, customer portal)
- Enable/disable links without deleting
- Set display order
- Track creation and updates

### 2. TypeScript Types
**File:** `lib/types/external-links.ts`

Interfaces for:
- `ExternalLink` - Complete link data
- `CreateExternalLinkRequest` - Create new links
- `UpdateExternalLinkRequest` - Update existing links

### 3. API Routes
**Files:**
- `app/api/external-links/route.ts` - List & create links
- `app/api/external-links/[id]/route.ts` - Get, update, delete individual links

**Endpoints:**
```
GET    /api/external-links                List all links
GET    /api/external-links?category=tips  Filter by category
GET    /api/external-links?show_in_footer=true  Get footer links
POST   /api/external-links                Create new link
GET    /api/external-links/:id            Get single link
PATCH  /api/external-links/:id            Update link
DELETE /api/external-links/:id            Delete link
```

### 4. Admin Settings UI
**File:** `app/admin/settings/page.tsx` (Updated)

New "External Links" section with:
- ✅ Add new link form
- ✅ Title, URL, description fields
- ✅ Category selection (tips, blog, resources, help, social)
- ✅ Icon selection
- ✅ Visibility toggles (footer, customer portal)
- ✅ Link list with status badges
- ✅ Enable/disable links
- ✅ Delete links
- ✅ Real-time updates

### 5. Footer Component
**File:** `components/Footer.tsx`

Automatically displays:
- Active footer links grouped by category
- External link icons for new tab links
- Responsive layout
- Quick links section
- Copyright notice

---

## 🎯 Use Cases

### 1. Service Tips & Guides
Add links to blog posts with maintenance tips:
- "Cleaning Tips" → https://yourblog.com/cleaning-tips
- "Pest Prevention Guide" → https://yourblog.com/pest-prevention
- "Maintenance Best Practices" → https://yourblog.com/maintenance

### 2. Resources
Link to helpful resources:
- "Service Blog" → Your company blog
- "FAQ" → Frequently asked questions
- "Video Tutorials" → YouTube channel

### 3. Social Media
Connect customers with your social presence:
- Facebook, Instagram, Twitter, LinkedIn

### 4. Help & Support
- Live chat link
- Support portal
- Knowledge base

---

## 📋 Sample Data

The SQL migration includes sample links:

**Tips & Guides:**
- Cleaning Tips
- Pest Prevention Guide
- Maintenance Best Practices

**Resources:**
- Service Blog
- FAQ
- Video Tutorials

**Social Media:**
- Facebook
- Instagram
- Twitter

---

## 🚀 How to Use

### Step 1: Run Database Migration
```bash
psql -h your-db-host -d your-database -f lib/supabase/add-external-links-system.sql
```

Or paste the SQL into Supabase SQL Editor.

### Step 2: Access Settings
1. Login as admin
2. Go to `/admin/settings`
3. Scroll to "External Links" section

### Step 3: Add Your First Link
1. Click "Add Link" button
2. Fill in the form:
   - **Title:** "Cleaning Tips" (required)
   - **URL:** https://yourblog.com/cleaning-tips (required)
   - **Description:** "Learn how to maintain a clean home"
   - **Category:** Tips & Guides
   - **Icon:** lightbulb
   - **Show in Footer:** ✓
   - **Show in Customer Portal:** ✓
3. Click "Add Link"

### Step 4: Manage Links
- **Toggle Active/Inactive:** Click the status button
- **Delete Link:** Click the trash icon
- **View Link:** Click the URL to open in new tab

### Step 5: Add Footer to Your Pages
Import and use the Footer component:

```tsx
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <div>
      {/* Your page content */}
      <Footer />
    </div>
  );
}
```

---

## 🎨 Link Categories

### Available Categories:
1. **tips** - Tips & Guides (Blue badge)
2. **blog** - Blog posts (Purple badge)
3. **resources** - Resources & Downloads (Gray badge)
4. **help** - Help & Support (Gray badge)
5. **social** - Social Media (Pink badge)
6. **other** - Other links (Gray badge)

### Icons:
Common Material Icons you can use:
- `lightbulb` - Tips
- `article` - Blog
- `help_outline` - Help
- `video_library` - Videos
- `book` - Guides
- `facebook`, `instagram`, `twitter` - Social media

---

## 🔧 API Examples

### Get All Active Footer Links
```typescript
const response = await fetch('/api/external-links?show_in_footer=true&is_active=true');
const links = await response.json();
```

### Create New Link
```typescript
const response = await fetch('/api/external-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Cleaning Tips',
    url: 'https://yourblog.com/cleaning-tips',
    description: 'Learn how to maintain a clean home',
    category: 'tips',
    icon: 'lightbulb',
    show_in_footer: true,
    show_in_customer_portal: true,
  }),
});
```

### Update Link
```typescript
const response = await fetch('/api/external-links/link-id', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    is_active: false,
  }),
});
```

### Delete Link
```typescript
const response = await fetch('/api/external-links/link-id', {
  method: 'DELETE',
});
```

---

## 🎨 UI Features

### Settings Page
- **Add Link Button:** Purple button in top right
- **Add Form:** Expandable form with all fields
- **Link Cards:** Display all links with status
- **Category Badges:** Color-coded by category
- **Status Badges:** Green (Active) / Red (Inactive)
- **Action Buttons:** Toggle status, Delete
- **External Link Icon:** Opens links in new tab

### Footer
- **Grouped by Category:** Links organized by category
- **Responsive Grid:** 4 columns on desktop, stacks on mobile
- **External Link Icons:** Shows when link opens new tab
- **Hover Effects:** Smooth transitions
- **Quick Links:** Always includes Home, Customer Portal, Admin Login

---

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Public can only view active links
- ✅ Only authenticated admins can manage links
- ✅ URL validation on creation
- ✅ XSS protection (links open in new tab with noopener noreferrer)

---

## 📱 Mobile Responsive

The footer automatically adapts:
- **Desktop:** 4-column grid layout
- **Tablet:** 2-column grid layout
- **Mobile:** Single column stack

---

## 🎯 Real-World Example

**Your cleaning service company might add:**

**Tips & Guides Category:**
1. "How to Keep Your House Clean Between Services" → Blog post URL
2. "Stain Removal Guide" → PDF download link
3. "Seasonal Cleaning Checklist" → Blog post URL

**Help Category:**
1. "FAQ" → FAQ page
2. "Contact Support" → Support form
3. "Service Areas" → Coverage map

**Social Category:**
1. "Follow us on Facebook" → Facebook page
2. "See Our Work on Instagram" → Instagram profile
3. "Reviews on Google" → Google Business page

---

## ✅ Testing Checklist

- [ ] Run SQL migration successfully
- [ ] Access `/admin/settings`
- [ ] See "External Links" section
- [ ] Click "Add Link" button
- [ ] Fill form and create link
- [ ] See link appear in list
- [ ] Toggle link status (active/inactive)
- [ ] Click link URL (opens in new tab)
- [ ] Delete a link
- [ ] Add Footer component to a page
- [ ] Verify links appear in footer
- [ ] Test responsive layout on mobile
- [ ] Verify only active links show in footer

---

## 🚀 Next Steps

1. **Run the database migration**
2. **Add your first links** in Settings
3. **Add Footer component** to your pages
4. **Customize** the footer styling if needed
5. **Update sample links** with your actual URLs

---

## 💡 Tips

- Use descriptive titles (what customers will see)
- Keep descriptions short and helpful
- Choose appropriate categories for organization
- Use `open_in_new_tab: true` for external sites
- Regularly review and update links
- Disable outdated links instead of deleting (keeps history)
- Order links by importance using display_order field

---

## 📝 Summary

You now have a complete external links management system that lets you:

✅ Add unlimited custom links from admin settings
✅ Categorize links (tips, blog, resources, social, help)
✅ Control where links appear (footer, customer portal)
✅ Enable/disable links without deleting
✅ Automatically display active links in footer
✅ Direct customers to helpful resources

Perfect for providing cleaning tips, pest prevention guides, FAQs, blog posts, and more! 🎉
