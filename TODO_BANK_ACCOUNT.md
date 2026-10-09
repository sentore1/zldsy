# ⚠️ URGENT TODO: Update Bank Account Number

## What Needs to Be Done

The Terms & Conditions currently have a placeholder `[Account Number]` that needs to be replaced with the actual ZLD Hub bank account number.

---

## Files to Update

### 1. Web App
**File:** `app/customer/booking/page.tsx`

**Location:** Inside the `TermSection` component for "Payment Terms" (around line 570)

**Current Text:**
```typescript
Bank: Bank of Kigali (BK)
Account Name: ZLD Hub Ltd
Account Number: [Account Number]
```

**Action Required:**
Replace `[Account Number]` with the actual account number.

---

### 2. Mobile App
**File:** `zldapp/lib/screens/customer/booking_screen.dart`

**Location:** Inside the `_buildTermSection` call for "Payment Terms" (around line 815)

**Current Text:**
```dart
'Bank: Bank of Kigali (BK)\n'
'Account Name: ZLD Hub Ltd\n'
'Account Number: [Account Number]\n\n'
```

**Action Required:**
Replace `[Account Number]` with the actual account number.

---

## How to Find and Replace

### Option 1: Using Search in Code Editor
1. Open your code editor (VS Code, Android Studio, etc.)
2. Use "Find in Files" (Ctrl+Shift+F or Cmd+Shift+F)
3. Search for: `[Account Number]`
4. Replace both occurrences with the actual account number

### Option 2: Using Command Line
```bash
# Search for the placeholder
grep -r "\[Account Number\]" app/ zldapp/

# Or use PowerShell on Windows
Select-String -Path "app\customer\booking\page.tsx","zldapp\lib\screens\customer\booking_screen.dart" -Pattern "\[Account Number\]"
```

---

## Example Replacement

**Before:**
```
Account Number: [Account Number]
```

**After (example - use your actual number):**
```
Account Number: 1234567890
```

---

## Verification Steps

After updating:

1. **Web App:**
   - Start the dev server: `npm run dev`
   - Navigate to: http://localhost:3000/customer/booking
   - Fill out the booking form to Step 3
   - Click "Terms and Conditions"
   - Scroll to "Payment Terms" section
   - **Verify:** Actual account number is displayed (no brackets)

2. **Mobile App:**
   - Start the app: `cd zldapp && flutter run`
   - Navigate to: Book a Service → Step 3
   - Tap "Terms and Conditions"
   - Scroll to "Payment Terms" section
   - **Verify:** Actual account number is displayed (no brackets)

3. **Build Test:**
   ```bash
   # Web
   npm run build
   
   # Mobile
   cd zldapp
   flutter build apk --debug
   ```
   
   Both should build without errors.

---

## Security Note

⚠️ **IMPORTANT:** 
- Bank account numbers are sensitive information
- Make sure they're correct before deploying to production
- Consider whether this information should be:
  - Hardcoded in the application (current approach)
  - Stored in environment variables
  - Fetched from a database/CMS
  - Displayed only after authentication

For production, you may want to move this to:
- `.env.local` file (web app)
- `constants.dart` file (mobile app)
- Or fetch from your database/backend

---

## Status

- [ ] Account number obtained from finance/admin
- [ ] Web app updated (`app/customer/booking/page.tsx`)
- [ ] Mobile app updated (`zldapp/lib/screens/customer/booking_screen.dart`)
- [ ] Verified in web app dev environment
- [ ] Verified in mobile app
- [ ] Build tested successfully
- [ ] Ready for deployment

---

## Contact

If you need help getting the actual account number, contact:
- Finance Department
- ZLD Hub Management
- Bank of Kigali (BK) - for account verification

---

**Created:** January 2025
**Priority:** HIGH
**Due:** Before production deployment
