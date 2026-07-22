# Login Troubleshooting Guide

## Problem: Login Not Working

I've fixed the authentication system. Here's what was wrong and how to test:

### What Was Fixed:

1. **Cookie Setting**: Login now sets a cookie (not just localStorage)
2. **Middleware Check**: Simplified to only check cookie
3. **Logout**: Now properly clears both localStorage and cookie

---

## 🔧 Quick Fix Steps

### Step 1: Restart Development Server

**IMPORTANT**: You must restart the dev server for middleware changes to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then start again:
npm run dev
```

### Step 2: Clear Browser Data

1. **Open Browser DevTools** (F12)
2. **Go to Application tab** (Chrome) or Storage tab (Firefox)
3. **Clear everything**:
   - Cookies → Delete all for localhost:3000
   - Local Storage → Delete all for localhost:3000
   - Session Storage → Delete all for localhost:3000

**OR** Use Incognito/Private window (easier!)

### Step 3: Test Login

1. **Go to**: http://localhost:3000/login
2. **Enter credentials**:
   - Email: `admin@zldsystem.com`
   - Password: `admin123`
3. **Click "Sign In"**
4. **Should redirect to**: http://localhost:3000/admin/dashboard

---

## 🐛 Debugging Steps

### Check 1: Is the Server Running?

```bash
# You should see:
▲ Next.js 16.2.10
- Local:        http://localhost:3000
```

### Check 2: Test Login Page Loads

Visit: http://localhost:3000/login

**Expected**: See login form with demo credentials box

### Check 3: Try Logging In

1. Enter credentials (exactly as shown)
2. Click Sign In
3. **Open DevTools Console** (F12 → Console tab)
4. Look for any errors

### Check 4: Check Cookie After Login

After clicking "Sign In":

1. **Open DevTools → Application → Cookies**
2. **Look for**: `isAuthenticated` cookie
3. **Value should be**: `true`

If cookie is not there, the issue is in the login process.

### Check 5: Test Direct Admin Access

After login, try visiting:
```
http://localhost:3000/admin/dashboard
```

**Should see**: Admin dashboard
**Should NOT see**: Redirect to login

---

## 🔍 Common Issues & Solutions

### Issue 1: "Page keeps redirecting to login"

**Cause**: Cookie not being set properly

**Solution**:
1. Clear all browser data
2. Restart dev server
3. Try in Incognito window
4. Check browser console for errors

### Issue 2: "Cannot access admin pages"

**Cause**: Middleware not detecting cookie

**Solution**:
1. **MUST restart dev server** (middleware changes require restart)
2. Login again
3. Check cookie exists in DevTools

### Issue 3: "Wrong credentials error doesn't show"

**Cause**: Form submission issue

**Solution**:
1. Check browser console for JavaScript errors
2. Make sure you're using exact credentials:
   - `admin@zldsystem.com`
   - `admin123`

### Issue 4: "Login button does nothing"

**Cause**: JavaScript not loading

**Solution**:
1. Check browser console for errors
2. Hard refresh page (Ctrl+F5)
3. Clear browser cache

---

## 📋 Testing Checklist

Run through this checklist:

- [ ] Dev server is running (`npm run dev`)
- [ ] Server was **restarted** after code changes
- [ ] Browser data cleared (or using Incognito)
- [ ] Visiting http://localhost:3000/login shows login form
- [ ] Using exact credentials: `admin@zldsystem.com` / `admin123`
- [ ] No errors in browser console
- [ ] Cookie appears in DevTools after login
- [ ] Redirects to /admin/dashboard after successful login

---

## 🧪 Manual Test

Try this step-by-step:

```bash
# 1. Stop dev server
Ctrl+C

# 2. Start dev server
npm run dev

# 3. Wait for "Ready" message
# ✓ Ready in 2.3s

# 4. Open INCOGNITO/PRIVATE window
# 5. Go to: http://localhost:3000/login
# 6. Enter: admin@zldsystem.com
# 7. Enter: admin123
# 8. Click "Sign In"
# 9. Should redirect to dashboard
```

---

## 🔬 Debug Mode

If still not working, let's check what's happening:

### Add Console Logs

Open `app/login/page.tsx` and look at the `handleLogin` function.

Add this right after the credentials check:

```typescript
if (email === "admin@zldsystem.com" && password === "admin123") {
  console.log("✓ Credentials correct");
  console.log("✓ Setting localStorage");
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userEmail", email);
  
  console.log("✓ Setting cookie");
  document.cookie = "isAuthenticated=true; path=/; max-age=86400";
  
  console.log("✓ Redirecting to admin");
  router.push("/admin/dashboard");
}
```

Then login and check console for these messages.

---

## 🆘 Still Not Working?

### Option 1: Use Direct Links (Bypass for Testing)

Temporarily comment out the middleware check:

In `middleware.ts`, change:
```typescript
if (pathname.startsWith('/admin')) {
  // Comment out these lines temporarily
  // const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  // if (!isAuthenticated) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
}
```

Then you can access admin directly to test services page.

### Option 2: Simple Alternative Auth

Replace login logic with simpler version:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (email === "admin@zldsystem.com" && password === "admin123") {
    localStorage.setItem("isAuthenticated", "true");
    document.cookie = "isAuthenticated=true; path=/;";
    window.location.href = "/admin/dashboard"; // Use window.location instead of router
  } else {
    alert("Wrong credentials");
  }
};
```

---

## ✅ Success Indicators

You'll know login is working when:

1. ✅ After login, see admin dashboard (not login page)
2. ✅ Can navigate to /admin/services
3. ✅ See your email in sidebar
4. ✅ Can click logout and go back to login page
5. ✅ Cookie `isAuthenticated=true` exists in DevTools

---

## 📞 Quick Help Commands

```bash
# Restart server (fixes most issues)
Ctrl+C
npm run dev

# Clear Next.js cache
npm run dev -- --turbo --force

# Check if port is in use
netstat -ano | findstr :3000

# Kill process on port 3000 (if stuck)
# Find PID from above command, then:
taskkill /PID <pid_number> /F
```

---

## 🎯 What Should Happen

**Correct Flow:**

1. Visit `/login` → See login form ✓
2. Enter credentials → Click Sign In ✓
3. Set cookie `isAuthenticated=true` ✓
4. Redirect to `/admin/dashboard` ✓
5. Middleware checks cookie → Allows access ✓
6. Can navigate admin pages freely ✓
7. Click logout → Clear cookie & localStorage ✓
8. Redirect to `/login` ✓
9. Try accessing `/admin/*` → Redirect to login ✓

---

## 🔑 Credentials Reference

**Copy-paste these exactly:**

```
Email: admin@zldsystem.com
Password: admin123
```

**Case sensitive!** Make sure:
- Email is lowercase
- Password is all lowercase and numeric

---

## 💡 Pro Tips

1. **Always use Incognito** when testing auth
2. **Restart server** after middleware changes
3. **Check DevTools Console** for errors
4. **Check DevTools Application** for cookies
5. **Hard refresh** page if styles look broken (Ctrl+F5)

---

## 🚀 After Login Works

Once login works, you can:

1. Manage services dynamically
2. Add/edit/delete services
3. See changes in database
4. View services on customer portal
5. Test all admin features

**Next file to read:** `AUTHENTICATION_GUIDE.md`

---

**Most Common Fix:** Restart dev server + Clear browser data!

Good luck! 🎉
