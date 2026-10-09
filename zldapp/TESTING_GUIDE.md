# Flutter Mobile App - Testing Guide

## 🚀 Quick Start

### 1. Run the App
```bash
cd d:\zldsystem\zldapp
flutter pub get
flutter run
```

### 2. Test Login
- **Email:** admin@zld.com
- **Password:** admin123

---

## 📋 Test Checklist

### ✅ Customer Booking Flow

#### Step 1: Service & Details
1. Open booking screen from customer home
2. Verify services load with "RWF" currency (not "RM")
3. Select a service
4. Fill in:
   - ✅ Full Name (required *)
   - ✅ Phone Number (required *)
   - ✅ Email (optional)
   - ✅ Service Address (required *)
   - ✅ Preferred Date (required *)
   - ✅ Additional Notes (optional)
5. Verify all field labels have icons:
   - Person icon for name
   - Phone icon for phone
   - Email icon for email
   - Location icon for address
   - Calendar icon for date
6. Try clicking "Continue" without filling required fields
   - Should show error message
7. Fill all required fields and click "Continue"
   - Should proceed to Step 2

#### Step 2: Upload Photos
1. Verify upload area displays
2. Click upload button
3. Select multiple photos
4. Verify photos appear in list
5. Try removing a photo
   - Should remove from list
6. Click "Continue" to Step 3

#### Step 3: Review & Confirm
1. Verify all entered data displays correctly:
   - Service name
   - Preferred date
   - Customer name
   - Phone number
   - Email (if entered)
   - Address
   - Notes (if entered)
   - Photo count (if uploaded)
2. Verify "What happens next?" info box shows
3. Click "Back" button
   - Should go to Step 2
4. Go forward again and click "Submit Booking"
5. Verify success message shows
6. Verify redirect to track page with booking ID

**Expected Result:** ✅ Booking created in Supabase

---

### ✅ Admin Screens - CRUD Operations

#### Customers Screen
1. Navigate to Admin → Customers
2. Verify FAB shows "Add Customer" with teal color
3. Click FAB
4. Fill customer form (name, phone, email, address)
5. Click Save
6. Verify customer appears in list
7. Click menu on customer card
8. Click Edit → Modify data → Save
9. Verify changes reflected
10. Click Delete → Confirm
11. Verify customer removed

**Expected Result:** ✅ Create, Read, Update, Delete all work

#### Services Screen
1. Navigate to Admin → Services
2. Verify FAB shows "Add Service" with teal color
3. Click FAB
4. Fill service form:
   - Name
   - Description
   - Base Price (in RWF)
   - Unit
   - Active toggle
5. Click Save
6. Verify service shows with RWF currency
7. Edit and Delete service
8. Verify operations work

**Expected Result:** ✅ CRUD works, currency shows as RWF

#### Bookings Screen
1. Navigate to Admin → Bookings
2. Verify FAB shows "Add Booking" with teal color
3. Verify status filter chips work (All, Pending, Confirmed, Cancelled)
4. Click on a booking
5. Try updating status
6. Verify status changes

**Expected Result:** ✅ Bookings load, filters work, status updates

#### Jobs Screen
1. Navigate to Admin → Jobs
2. Verify FAB shows "Add Job" with teal color
3. Verify status filters work
4. Click on a job
5. Try updating status
6. If changing to "In Progress", select weather condition
7. Navigate to job details

**Expected Result:** ✅ Jobs load, status updates, weather tracking works

#### Staff Screen
1. Navigate to Admin → Staff
2. Verify FAB shows "Add Staff" with teal color
3. Click FAB
4. Fill staff form:
   - Name
   - Phone
   - Email
   - Role
   - Hourly Rate (RWF)
5. Verify hourly rate shows with RWF currency
6. Click on staff member
7. Try marking attendance (Present, Absent, Leave)
8. Verify attendance badge updates

**Expected Result:** ✅ Staff CRUD works, attendance tracking works

#### Inventory Screen
1. Navigate to Admin → Inventory
2. Verify FAB shows "Add Inventory" with teal color
3. Click FAB
4. Fill inventory form:
   - Name
   - Category
   - Unit
   - Quantity
   - Unit Cost (RWF)
   - Reorder Level
5. Verify unit cost shows with RWF
6. Set quantity below reorder level
7. Verify low stock warning appears

**Expected Result:** ✅ Inventory CRUD works, low stock alerts work

#### Equipment Screen
1. Navigate to Admin → Equipment
2. Verify FAB shows "Add Equipment" with teal color
3. Click FAB
4. Fill equipment form:
   - Name
   - Type
   - Registration Number
   - Fuel Capacity
   - Status (Available, In Use, Maintenance)
5. Click Save
6. Verify status badge color matches status
7. Edit and change status
8. Verify status updates

**Expected Result:** ✅ Equipment CRUD works, status management works

#### Quotations Screen
1. Navigate to Admin → Quotations
2. Verify FAB shows "Add Quotation" with teal color
3. Click on a quotation
4. Verify modal shows:
   - Quotation number
   - Status badge
   - Valid until date
   - Items list
   - Subtotal, discount, tax
   - Final amount in RWF
5. Verify currency shows as RWF

**Expected Result:** ✅ Quotations load, details show correctly

#### Invoices Screen
1. Navigate to Admin → Invoices
2. Verify FAB shows "Generate Invoice" with teal color
3. Verify status filters work (All, Pending, Paid, Overdue)
4. Click on an invoice
5. Verify modal shows all details in RWF
6. If status is not "Paid", try recording payment
7. Enter amount and select payment method
8. Click Record
9. Verify invoice status changes to "Paid"

**Expected Result:** ✅ Invoices load, payment recording works

#### Payments Screen
1. Navigate to Admin → Payments
2. Verify FAB shows "Record Payment" with teal color
3. Verify "Total Collected" shows at top in RWF
4. Verify payments list shows:
   - Amount in RWF
   - Payment method
   - Date
   - Transaction reference (if any)

**Expected Result:** ✅ Payments display correctly with RWF

---

### ✅ Currency Verification

**Check these screens show "RWF" not "RM":**
- [ ] Customer Home - Service prices
- [ ] Booking Screen - Service selection
- [ ] Services Screen - Base prices
- [ ] Staff Screen - Hourly rates
- [ ] Inventory Screen - Unit costs
- [ ] Quotations Screen - All amounts
- [ ] Invoices Screen - All amounts
- [ ] Payments Screen - All amounts

---

### ✅ Theme & Colors

**Verify teal color (#28A8AC) appears in:**
- [ ] All FloatingActionButtons
- [ ] Progress indicators in booking flow
- [ ] Active step indicators
- [ ] Primary buttons
- [ ] Active states
- [ ] Focus states
- [ ] App bar (if styled)

---

### ✅ Icons Verification

**Booking Screen Step 1 should have:**
- [ ] Person icon for "Full Name"
- [ ] Phone icon for "Phone Number"
- [ ] Email icon for "Email Address"
- [ ] Location icon for "Service Address"
- [ ] Calendar icon for "Preferred Date"

**All Admin FABs should have:**
- [ ] Plus (+) icon
- [ ] Descriptive label

---

### ✅ Data Loading

**Verify data loads correctly:**
- [ ] Login successful
- [ ] Dashboard shows stats
- [ ] Customer home shows active services
- [ ] All admin screens load their data
- [ ] No infinite loading states
- [ ] Error messages are user-friendly

---

### ✅ Validation & Errors

**Test form validation:**
- [ ] Required fields show error if empty
- [ ] Email validation (if implemented)
- [ ] Phone validation (if implemented)
- [ ] Number fields only accept numbers
- [ ] Date picker prevents past dates
- [ ] Success messages show after operations
- [ ] Error messages show on failures

---

## 🐛 Known Issues / TODO

### Photo Upload
- ✅ UI implemented (select, preview, remove)
- ⏳ Backend upload to Supabase Storage - TODO
- ⏳ Store photo URLs in booking - TODO

### Form Dialogs (Placeholder onPressed handlers)
- ⏳ "Add Booking" form in bookings screen - TODO
- ⏳ "Add Job" form in jobs screen - TODO
- ⏳ "Add Quotation" form in quotations screen - TODO
- ⏳ "Generate Invoice" form in invoices screen - TODO
- ⏳ "Record Payment" form in payments screen - TODO

*These show placeholder SnackBars - implementation needed*

---

## 📊 Test Results Template

### Date: __________
### Tester: __________

| Feature | Status | Notes |
|---------|--------|-------|
| Booking Step 1 | ⬜ Pass / ⬜ Fail | |
| Booking Step 2 | ⬜ Pass / ⬜ Fail | |
| Booking Step 3 | ⬜ Pass / ⬜ Fail | |
| Customers CRUD | ⬜ Pass / ⬜ Fail | |
| Services CRUD | ⬜ Pass / ⬜ Fail | |
| Bookings CRUD | ⬜ Pass / ⬜ Fail | |
| Jobs CRUD | ⬜ Pass / ⬜ Fail | |
| Staff CRUD | ⬜ Pass / ⬜ Fail | |
| Inventory CRUD | ⬜ Pass / ⬜ Fail | |
| Equipment CRUD | ⬜ Pass / ⬜ Fail | |
| Quotations View | ⬜ Pass / ⬜ Fail | |
| Invoices View | ⬜ Pass / ⬜ Fail | |
| Payments View | ⬜ Pass / ⬜ Fail | |
| Currency (RWF) | ⬜ Pass / ⬜ Fail | |
| Theme (Teal) | ⬜ Pass / ⬜ Fail | |
| Icons Present | ⬜ Pass / ⬜ Fail | |
| Data Loading | ⬜ Pass / ⬜ Fail | |

---

## 🎯 Critical Tests (Must Pass)

1. **Login** - Can access admin dashboard
2. **Booking Submission** - Can create booking successfully
3. **Currency Display** - All prices show RWF
4. **Theme Colors** - Teal color throughout
5. **FABs Present** - All 10 admin screens have FABs
6. **Data Loading** - No blank/error screens
7. **Form Validation** - Required fields enforced
8. **CRUD Operations** - Create, edit, delete work on existing forms

---

## 📱 Device Testing

### Test on:
- [ ] Android Emulator
- [ ] Android Device
- [ ] iOS Simulator (if Mac available)
- [ ] iOS Device (if available)

### Screen Sizes:
- [ ] Phone (small)
- [ ] Phone (large)
- [ ] Tablet

---

## 💡 Tips

1. **Hot Reload**: Press `r` in terminal for hot reload
2. **Hot Restart**: Press `R` for hot restart (needed for color changes)
3. **Clear Data**: Uninstall and reinstall app to clear cache
4. **Console**: Watch terminal for errors
5. **Supabase**: Check Supabase dashboard for data verification

---

## 📞 Support

**Issues?** Check:
1. Flutter version: `flutter --version`
2. Dependencies: `flutter pub get`
3. Supabase connection
4. Environment variables
5. Console errors

**Common Fixes:**
- Clean build: `flutter clean && flutter pub get`
- Restart IDE
- Restart emulator/device
- Check network connection

---

**Happy Testing! 🎉**
