# 📱 Mobile App Quick Test Guide

## ⚡ Quick Start

### 1. Run the Mobile App

```bash
cd d:\zldsystem\zldapp
flutter pub get
flutter run
```

**Expected:** App launches on your device/emulator

---

## ✅ Feature Test Checklist

### Authentication
- [ ] Launch app
- [ ] See login screen
- [ ] Enter credentials
- [ ] Successfully login
- [ ] Navigate to dashboard

### Dashboard
- [ ] See today's jobs count
- [ ] See ongoing services count
- [ ] See tomorrow's schedule
- [ ] See revenue/expenses/profit metrics
- [ ] Pull-to-refresh works

### Jobs Management
- [ ] Navigate to Jobs screen
- [ ] See list of jobs
- [ ] Tap any job card
- [ ] See job details
- [ ] Tap "View Details & Costs" button


### Job Cost Tracking (Critical Feature)
- [ ] Open job detail screen
- [ ] See profitability dashboard
- [ ] Revenue displays correctly
- [ ] Costs section shows labor/materials/equipment
- [ ] Profit/loss calculated correctly
- [ ] Profit margin shows percentage

### Add Staff to Job
- [ ] Tap "Add Staff" button
- [ ] See bottom sheet with staff list
- [ ] Select a staff member
- [ ] Enter hours worked (e.g., 8)
- [ ] See labor cost calculated automatically
- [ ] Tap Save/Confirm
- [ ] Staff appears in list
- [ ] Profitability updates immediately

### Add Materials to Job
- [ ] Tap "Add Material" button
- [ ] See inventory items
- [ ] Select a material
- [ ] Enter quantity used (e.g., 5)
- [ ] See cost calculated from inventory unit_cost
- [ ] Tap Save/Confirm
- [ ] Material appears in list
- [ ] Profitability updates immediately
- [ ] Check inventory quantity decreased

### Add Equipment to Job
- [ ] Tap "Add Equipment" button
- [ ] See equipment list
- [ ] Select equipment
- [ ] Enter fuel used (liters)
- [ ] Enter fuel cost
- [ ] Tap Save/Confirm
- [ ] Equipment appears in list
- [ ] Profitability updates immediately


### Cross-Platform Sync Test
1. **On Mobile:**
   - [ ] Add a staff member to a job
   - [ ] Note the job ID and profit amount

2. **On Web:**
   - [ ] Open web app (http://localhost:3000)
   - [ ] Navigate to same job
   - [ ] Verify staff member appears
   - [ ] Verify profit matches mobile

3. **On Web:**
   - [ ] Add a material to the job
   - [ ] Note the new cost

4. **On Mobile:**
   - [ ] Pull-to-refresh the job detail screen
   - [ ] Verify material appears
   - [ ] Verify costs updated

**Expected Result:** ✅ Data syncs instantly between platforms!

---

## 🐛 Common Issues & Fixes

### Issue: App won't launch
```bash
flutter doctor
flutter clean
flutter pub get
flutter run
```

### Issue: "Supabase URL/Key not found"
**Fix:** Update `lib/main.dart` with actual credentials:
```dart
await Supabase.initialize(
  url: 'https://ycngtmmoomwgmkabqasy.supabase.co',
  anonKey: 'your_actual_anon_key_here',
);
```

### Issue: No data showing
- Check internet connection
- Verify Supabase URL is correct
- Check if database has data
- Check app logs: `flutter logs`


### Issue: Compilation errors
```bash
flutter clean
flutter pub get
# Delete .dart_tool and build folders
flutter run
```

### Issue: Slow performance
- Use Release mode: `flutter run --release`
- Check device storage
- Restart device

---

## 📊 Performance Benchmarks

Expected performance on a mid-range device:

| Action | Expected Time |
|--------|---------------|
| App launch | < 2 seconds |
| Login | < 1 second |
| Load jobs list | < 500ms |
| Load job detail | < 1 second |
| Add staff/material | < 500ms |
| Pull-to-refresh | < 1 second |

---

## ✅ Success Criteria

Your mobile app is working well if:

1. ✅ App launches without crashes
2. ✅ Can login successfully
3. ✅ Dashboard shows correct metrics
4. ✅ Jobs list loads and displays
5. ✅ Job detail screen opens
6. ✅ Can add staff/materials/equipment
7. ✅ Profitability calculates correctly
8. ✅ Data syncs with web application
9. ✅ Pull-to-refresh works
10. ✅ Navigation is smooth

**If all checked:** 🎉 Your mobile app is working perfectly!

