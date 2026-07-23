# 🎯 Quick Reference Card

## ⚡ 3-Step Setup

```
1. Run: INSTALL_DEPENDENCIES.bat
2. Run SQL: lib\supabase\setup-storage.sql
3. Edit: .env.local (add Gmail credentials)
```

---

## 🔑 Login Credentials

```
URL: http://localhost:3000/login
Email: admin@zldsystem.com
Password: admin123
```

---

## 🎨 New Features - Where to Find Them

### Bookings Page → Generate Quotation
```
Admin → Bookings → Click 📄 icon
✅ Creates quotation with pricing & QR code
```

### Jobs Page → Generate Invoice
```
Admin → Jobs → Mark "Completed" → Click "Generate Invoice"
✅ Creates invoice with full cost breakdown
```

### Invoices Page → Record Payment
```
Admin → Invoices → Click "💳 Record Payment"
✅ Records payment & updates status
```

---

## 📊 Complete Workflow

```
1. Booking Created
   ↓
2. Click "Generate Quotation" → ✅ Quotation sent
   ↓
3. Customer accepts (API ready)
   ↓
4. Job Created → Staff completes
   ↓
5. Mark job "Completed"
   ↓
6. Click "Generate Invoice" → ✅ Invoice sent
   ↓
7. Customer pays
   ↓
8. Click "Record Payment" → ✅ Payment recorded
   ↓
9. ✅ DONE!
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| npm install fails | `npm cache clean --force` |
| Email not sending | Check Gmail App Password in .env.local |
| Photos not uploading | Run setup-storage.sql in Supabase |
| Buttons not showing | Hard refresh: Ctrl + Shift + R |
| API errors | Check .env.local has all keys |

---

## 📝 Key Files

```
Configuration:
├── .env.local (Gmail credentials)
└── lib/supabase/setup-storage.sql (Storage setup)

New Buttons Added:
├── app/admin/bookings/page.tsx (Generate Quotation)
├── app/admin/jobs/page.tsx (Generate Invoice)
└── app/admin/invoices/page.tsx (Record Payment)

API Routes:
├── app/api/quotations/generate/route.ts
├── app/api/invoices/generate/route.ts
└── app/api/payments/process/route.ts
```

---

## ✅ Test Checklist

- [ ] Create booking
- [ ] Generate quotation
- [ ] Create job from booking
- [ ] Mark job completed
- [ ] Generate invoice
- [ ] Record payment
- [ ] Check email received

---

## 🚀 Start Command

```bash
npm run dev
```

---

## 📞 Quick Help

- Full Guide: `START_HERE_FINAL.md`
- Setup Details: `SETUP_COMPLETE.md`
- What Fixed: `FIXES_COMPLETED.md`
