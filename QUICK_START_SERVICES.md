# Quick Start: Adding Services with Images

## 🚀 3-Step Setup

### Step 1: Run Database Scripts (One-time)
Open your Supabase SQL Editor and run these two scripts:

1. **Update Services Schema**
   ```sql
   -- Copy and run: lib/supabase/update-services-schema.sql
   ```

2. **Setup Storage Bucket**
   ```sql
   -- Copy and run: lib/supabase/setup-storage.sql
   ```

### Step 2: Start Your Development Server
```bash
npm run dev
```

### Step 3: Add Your First Service
1. Go to: `http://localhost:3000/admin`
2. Login with your credentials
3. Click **Services** in sidebar
4. Click **Add Service** button
5. Fill in the form:
   - Name: "Home Fumigation"
   - Description: "Professional pest control for homes"
   - Category: "Fumigation"
   - Unit: "per sqm"
   - Price Type: "Price Range"
   - Min Price: 10000
   - Max Price: 32000
   - Upload an image
   - Check "Active"
6. Click **Add Service**

### Step 4: View on Landing Page
Go to: `http://localhost:3000`

You should see your service with image, description, and pricing!

---

## ✅ That's It!

Your service with image is now visible to customers on the landing page.

**What works now:**
- ✓ Add/Edit/Delete services
- ✓ Upload images
- ✓ Display on landing page
- ✓ Category filtering
- ✓ Book Now functionality
- ✓ Request Quote functionality

---

## 📸 Image Tips

**Best Results:**
- Use 800x600px images
- Keep files under 2MB
- Use JPEG format
- Well-lit, clear photos

**Supported Formats:**
- JPEG / JPG
- PNG
- GIF
- WebP

**File Size Limit:** 5MB

---

## ❓ Need Help?

See **SERVICE_IMAGES_GUIDE.md** for detailed documentation.

**Common Issues:**

**Q: Service not showing on landing page?**  
A: Check "Active" checkbox when adding/editing service

**Q: Image upload fails?**  
A: Make sure file is under 5MB and in JPEG/PNG format

**Q: Login page shows error?**  
A: Restart dev server (`npm run dev`)

---

## 🎯 Example Services to Add

### Fumigation Service
```
Name: Home Fumigation
Category: Fumigation
Description: Professional pest control and fumigation
Price: Range (10,000 - 32,000)
Unit: per sqm
Image: fumigation-service.jpg
```

### Cleaning Service
```
Name: Deep House Cleaning
Category: Cleaning
Description: Thorough cleaning of entire house
Price: Fixed (25,000)
Unit: per house
Image: cleaning-service.jpg
```

### Plumbing Service
```
Name: Plumbing Repair
Category: Maintenance
Description: Expert plumbing repairs and installation
Price: Range (5,000 - 50,000)
Unit: per job
Image: plumbing-service.jpg
```

---

Happy service management! 🎉
