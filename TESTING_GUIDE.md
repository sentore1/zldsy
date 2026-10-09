# Testing Guide - Service Categories & Terms Updates

## 🚀 Quick Start

### Web Application
```bash
npm run dev
```
Then open: http://localhost:3000

### Mobile Application
```bash
cd zldapp
flutter pub get
flutter run
```

---

## 📋 Test Scenarios

### Test 1: Terms & Conditions Checkbox (Web App)

**Steps:**
1. Navigate to http://localhost:3000/customer/booking
2. Fill in Step 1 (Service & Details):
   - Select any service
   - Enter name: "Test User"
   - Enter phone: "+250 788 123 456"
   - Enter address: "KG 123 St, Kigali"
   - Select a future date
3. Click "Continue to Upload Photos"
4. Click "Continue" (skip photo upload)
5. **VERIFY**: On Step 3, the Terms & Conditions checkbox should be **UNCHECKED**
6. Try clicking "Submit Booking" without checking the box
7. **VERIFY**: An alert should appear: "Please agree to the Terms and Conditions to continue"
8. Click the "Terms and Conditions" link
9. **VERIFY**: A modal dialog opens with all updated terms
10. **VERIFY**: Check for these specific sections:
    - Payment Terms: Bank account details and 5% daily penalty
    - Cancellation Policy: Clear timeframes (48h, 24-48h, <24h)
    - Service Guarantee: 24-hour reporting requirement
    - Customer Responsibility: Supervisor requirement and property security
11. Click "I Agree" button in modal
12. **VERIFY**: Modal closes and checkbox is now checked
13. Click "Submit Booking"
14. **VERIFY**: Booking submits successfully

---

### Test 2: Terms & Conditions Checkbox (Mobile App)

**Steps:**
1. Launch the mobile app
2. Navigate to Customer → Book a Service
3. Fill in Step 1:
   - Select any service
   - Enter name: "Test User"
   - Enter phone: "+250 788 123 456"
   - Enter address: "KG 123 St, Kigali"
   - Select a future date
4. Click "Continue to Upload Photos"
5. Click "Continue" (skip photo upload)
6. **VERIFY**: On Step 3, the Terms & Conditions checkbox should be **UNCHECKED**
7. Try tapping "Submit Booking" without checking the box
8. **VERIFY**: An error snackbar appears: "Please agree to the Terms and Conditions to continue"
9. Tap the "Terms and Conditions" text
10. **VERIFY**: A dialog opens with all updated terms
11. **VERIFY**: Check for these specific sections:
    - Payment Terms: Bank account details and 5% daily penalty
    - Cancellation Policy: Clear timeframes
    - Service Guarantee: 24-hour reporting requirement
    - Customer Responsibility: Supervisor requirement
12. Tap "I Agree" button
13. **VERIFY**: Dialog closes and checkbox is now checked
14. Tap "Submit Booking"
15. **VERIFY**: Booking submits successfully

---

### Test 3: Phone Number Format Guidance (Web App)

**Steps:**
1. Navigate to http://localhost:3000/customer/booking
2. Look at the "Phone Number *" field
3. **VERIFY**: Placeholder text shows: "+250 7XX XXX XXX"
4. **VERIFY**: Helper text below field shows: "Use format: +250 7XX XXX XXX for tracking your booking"
5. Navigate to http://localhost:3000/customer/track
6. Look at the search input field
7. **VERIFY**: Helper text shows: "Enter the phone number you used when booking (e.g., +250 7XX XXX XXX)..."

---

### Test 4: Phone Number Format Guidance (Mobile App)

**Steps:**
1. Navigate to Customer → Book a Service
2. Look at the "Phone Number *" field
3. **VERIFY**: Placeholder text shows: "+250 7XX XXX XXX"
4. **VERIFY**: Helper text below field shows: "Use format: +250 7XX XXX XXX for tracking"
5. Navigate to Customer → Track My Booking
6. Look at the phone number input field
7. **VERIFY**: Helper text shows: "Use format: +250 7XX XXX XXX for tracking"

---

### Test 5: Updated Terms Content (Web App)

**Steps:**
1. Navigate to http://localhost:3000/customer/booking
2. Complete Steps 1-2 to reach Step 3
3. Click "Terms and Conditions" link
4. **VERIFY** each section contains updated content:

**Payment Terms:**
- ✓ Contains bank account information
- ✓ Mentions "Bank: Bank of Kigali (BK)"
- ✓ Mentions "5% per day" penalty
- ✓ Mentions "beyond the agreed payment date"

**Cancellation Policy:**
- ✓ States "in writing (email, SMS, or through our app)"
- ✓ Shows "More than 48 hours: No charge"
- ✓ Shows "24-48 hours: 50% cancellation fee"
- ✓ Shows "Less than 24 hours: 100% cancellation fee"

**Service Guarantee:**
- ✓ Contains "within 24 hours of service completion"
- ✓ Contains "NOT reported within 24 hours will not be considered"
- ✓ Contains "deemed accepted and satisfactory"

**Customer Responsibility:**
- ✓ Contains "IMPORTANT - Property Security" section
- ✓ Contains "MUST provide a supervisor"
- ✓ Contains "WITHOUT the presence of your designated supervisor"
- ✓ Contains "ZLD Hub will NOT be held responsible"

---

### Test 6: Updated Terms Content (Mobile App)

**Steps:**
1. Navigate to Customer → Book a Service
2. Complete Steps 1-2 to reach Step 3
3. Tap "Terms and Conditions"
4. **VERIFY** the same content as Test 5 above

---

### Test 7: Service Categories Constants

**Web App:**
```bash
# Check if the file exists
cat lib/constants/service-categories.ts
```

**VERIFY:**
- ✓ File contains 4 service categories
- ✓ Categories: "Cleaning and Fumigation", "Maintenance and Renovations", "Gardening and Landscaping", "Moving and Property Management"

**Mobile App:**
```bash
cd zldapp
cat lib/config/service_categories.dart
```

**VERIFY:**
- ✓ File contains 4 service categories
- ✓ Same category names as web app

---

## ⚠️ Known Issues / TODO

### 1. Bank Account Number Placeholder
**Status**: Needs to be replaced

**Files to update:**
- `app/customer/booking/page.tsx` - Line in TermSection for "Payment Terms"
- `zldapp/lib/screens/customer/booking_screen.dart` - Line in _buildTermSection for "Payment Terms"

**Search for:**
```
Account Number: [Account Number]
```

**Replace with actual account number**

---

### 2. Service Categories Implementation
**Status**: Constants created, UI implementation pending

**Next Steps:**
1. Update admin service creation form to use new categories
2. Update service listing pages to show categories
3. Add category filtering in customer service browsing
4. Group services by category in display

**Files to potentially update:**
- `app/admin/services/page.tsx`
- `app/customer/page.tsx`
- `zldapp/lib/screens/admin/services_screen.dart`
- `zldapp/lib/screens/customer/home_screen.dart`

---

## 🐛 Regression Testing

After implementing these changes, verify these existing features still work:

### Web App
- [ ] Admin login works
- [ ] Admin can view bookings
- [ ] Admin can create/edit services
- [ ] Customer can create bookings (end-to-end)
- [ ] Customer can track bookings by phone
- [ ] Customer can track bookings by booking ID
- [ ] Invoice generation works
- [ ] Payment processing works

### Mobile App
- [ ] Customer can create bookings (end-to-end)
- [ ] Customer can track bookings by phone
- [ ] Admin login works (if implemented)
- [ ] Photo upload works
- [ ] Feedback submission works

---

## 📊 Test Results Template

Copy and fill out after testing:

```
## Test Results - [Date]

### Web App
- [ ] Test 1: Terms checkbox (unchecked by default) - PASS/FAIL
- [ ] Test 2: Terms modal content - PASS/FAIL
- [ ] Test 3: Phone format guidance (booking) - PASS/FAIL
- [ ] Test 4: Phone format guidance (tracking) - PASS/FAIL
- [ ] Test 5: Terms content verification - PASS/FAIL
- [ ] Test 6: Booking submission validation - PASS/FAIL

### Mobile App
- [ ] Test 1: Terms checkbox (unchecked by default) - PASS/FAIL
- [ ] Test 2: Terms dialog content - PASS/FAIL
- [ ] Test 3: Phone format guidance (booking) - PASS/FAIL
- [ ] Test 4: Phone format guidance (tracking) - PASS/FAIL
- [ ] Test 5: Terms content verification - PASS/FAIL
- [ ] Test 6: Booking submission validation - PASS/FAIL

### Service Categories
- [ ] Constants files created - PASS/FAIL
- [ ] Categories correctly defined - PASS/FAIL

### Regression Tests
- [ ] No existing features broken - PASS/FAIL

### Issues Found:
[List any issues discovered during testing]

### Notes:
[Any additional observations or comments]
```

---

## 🔍 Code Review Checklist

- [ ] Terms & Conditions checkbox defaults to `false` (unchecked)
- [ ] Terms modal/dialog includes all updated sections
- [ ] Bank account information is visible in Payment Terms
- [ ] 5% daily penalty clause is mentioned
- [ ] 24-hour reporting requirement is clear
- [ ] Supervisor requirement is emphasized
- [ ] Phone format shows "+250 7XX XXX XXX"
- [ ] Validation prevents submission without terms agreement
- [ ] Service category constants are properly structured
- [ ] No TypeScript/Dart compilation errors
- [ ] Build succeeds without errors
- [ ] No console warnings in browser

---

## 📝 Sign-off

**Tester Name:** _______________
**Date:** _______________
**Environment:** Production / Staging / Development
**Status:** All Tests Passed / Issues Found (see above)
**Approved for Deployment:** YES / NO

---

## 🆘 Support

If you encounter issues:
1. Check browser/app console for errors
2. Verify database connection
3. Check API endpoints are responding
4. Review implementation summary: `IMPLEMENTATION_SUMMARY.md`
5. Check modified files for syntax errors

For questions, contact the development team.
