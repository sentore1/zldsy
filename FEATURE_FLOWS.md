# Feature Flows - Visual Guide

## 🎨 Service Image Upload Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN SERVICE FORM                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Admin selects image file
                              ▼
                    ┌─────────────────────┐
                    │  Image Preview      │
                    │  shown in form      │
                    └─────────────────────┘
                              │
                              │ 2. Admin clicks "Add Service"
                              ▼
                    ┌─────────────────────┐
                    │ Upload to API       │
                    │ /api/services/      │
                    │ upload-image        │
                    └─────────────────────┘
                              │
                              │ 3. Upload to Supabase Storage
                              ▼
                    ┌─────────────────────┐
                    │  Supabase Storage   │
                    │  service-photos/    │
                    │  services/          │
                    │  {timestamp}.jpg    │
                    └─────────────────────┘
                              │
                              │ 4. Get public URL
                              ▼
                    ┌─────────────────────┐
                    │ https://...         │
                    │ supabase.co/        │
                    │ storage/v1/object/  │
                    │ public/service-     │
                    │ photos/services/... │
                    └─────────────────────┘
                              │
                              │ 5. Save URL to database
                              ▼
                    ┌─────────────────────┐
                    │  services table     │
                    │  image_url = "..."  │
                    └─────────────────────┘
                              │
                              │ 6. Display on landing page
                              ▼
                    ┌─────────────────────┐
                    │  Customer sees      │
                    │  service with image │
                    └─────────────────────┘
```

## 💰 Price Display Decision Tree

```
                    ┌─────────────────────┐
                    │  Service Loaded     │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────────────┐
                    │ Check: display_price_type ?     │
                    └─────────────────────────────────┘
                        │                    │
            ┌───────────┴──────────┐        │
            │                      │        │
            ▼                      ▼        ▼
    ┌──────────────┐      ┌──────────────┐
    │   'single'   │      │   'range'    │
    └──────────────┘      └──────────────┘
            │                      │
            ▼                      ▼
    ┌──────────────┐      ┌──────────────────┐
    │ Display:     │      │ Display:         │
    │ RWF 25,000   │      │ RWF 10,000 -     │
    │              │      │     32,000       │
    │ (base_price) │      │                  │
    │              │      │ (min - max)      │
    │              │      │                  │
    │              │      │ + Helper text:   │
    │              │      │ "Price range     │
    │              │      │  based on        │
    │              │      │  requirements"   │
    └──────────────┘      └──────────────────┘
```

## 📝 Customer Action Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   LANDING PAGE                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │             Service Card                           │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │         [Service Image]                      │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  Category: Fumigation                             │    │
│  │  Home Fumigation                                  │    │
│  │  RWF 10,000 - 32,000 / sqm                       │    │
│  │                                                    │    │
│  │  ┌─────────────┐  ┌────────────────┐            │    │
│  │  │ Book Now    │  │ Request Quote  │            │    │
│  │  └─────────────┘  └────────────────┘            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
              │                        │
              │                        │
      Click "Book Now"        Click "Request Quote"
              │                        │
              ▼                        ▼
┌──────────────────────┐    ┌──────────────────────┐
│ /customer/booking    │    │ /customer/booking    │
│ ?service={id}        │    │ ?service={id}        │
│                      │    │ &requestQuote=true   │
└──────────────────────┘    └──────────────────────┘
              │                        │
              ▼                        ▼
┌──────────────────────┐    ┌──────────────────────┐
│ DIRECT BOOKING       │    │ QUOTE REQUEST        │
│                      │    │                      │
│ - Fill form          │    │ - Fill form          │
│ - Select date        │    │ - Add requirements   │
│ - Submit             │    │ - Submit             │
│                      │    │                      │
│ Status: "pending"    │    │ Status: "quote_      │
│                      │    │          requested"  │
└──────────────────────┘    └──────────────────────┘
              │                        │
              ▼                        ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Booking confirmed    │    │ Admin reviews        │
│ immediately          │    │ Admin generates      │
│                      │    │ quote                │
│                      │    │ Customer receives    │
│                      │    │ quote email          │
└──────────────────────┘    └──────────────────────┘
```

## 🔄 Complete Admin Workflow

```
                        ┌─────────────────────┐
                        │  Admin Dashboard    │
                        └─────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │  Services Page       │    │  Bookings Page       │
        └──────────────────────┘    └──────────────────────┘
                    │                           │
                    │                           │
        ┌───────────┴───────────┐              │
        ▼                       ▼              │
┌──────────────┐      ┌──────────────┐        │
│ Add Service  │      │ Edit Service │        │
└──────────────┘      └──────────────┘        │
        │                       │              │
        └───────────┬───────────┘              │
                    ▼                          │
        ┌──────────────────────┐              │
        │  Service Form        │              │
        │  ┌────────────────┐  │              │
        │  │ Name           │  │              │
        │  │ Description    │  │              │
        │  │ Category       │  │              │
        │  │                │  │              │
        │  │ [Upload Image] │  │              │
        │  │ ┌──────────┐   │  │              │
        │  │ │ Preview  │   │  │              │
        │  │ └──────────┘   │  │              │
        │  │                │  │              │
        │  │ Price Type:    │  │              │
        │  │ ○ Fixed Price  │  │              │
        │  │ ● Price Range  │  │              │
        │  │                │  │              │
        │  │ Min: 10000     │  │              │
        │  │ Max: 32000     │  │              │
        │  │                │  │              │
        │  │ Unit: per sqm  │  │              │
        │  │ ☑ Active       │  │              │
        │  │                │  │              │
        │  │ [Save Service] │  │              │
        │  └────────────────┘  │              │
        └──────────────────────┘              │
                    │                          │
                    ▼                          ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │  Service Saved       │    │  Quote Requests      │
        │  Image Uploaded      │    │  ┌────────────────┐  │
        │  Visible on Landing  │    │  │ Booking #123   │  │
        └──────────────────────┘    │  │ Status: Quote  │  │
                                     │  │ Requested      │  │
                                     │  │                │  │
                                     │  │ [Generate      │  │
                                     │  │  Quote]        │  │
                                     │  └────────────────┘  │
                                     └──────────────────────┘
                                                │
                                                ▼
                                     ┌──────────────────────┐
                                     │  Quotation Form      │
                                     │  Auto-filled from    │
                                     │  booking details     │
                                     │                      │
                                     │  Calculate price     │
                                     │  based on customer   │
                                     │  requirements        │
                                     │                      │
                                     │  [Generate PDF]      │
                                     │  [Send to Customer]  │
                                     └──────────────────────┘
```

## 🗄️ Database Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    SERVICES TABLE                        │
│                                                          │
│  id                  UUID PRIMARY KEY                    │
│  name                VARCHAR                             │
│  description         TEXT                                │
│  category            VARCHAR                             │
│  unit                VARCHAR                             │
│  ─────────────────────────────────────────────────────  │
│  image_url           TEXT (NEW!)                         │
│  ─────────────────────────────────────────────────────  │
│  display_price_type  'single' | 'range' (NEW!)          │
│  base_price          DECIMAL (for single pricing)        │
│  min_price           DECIMAL (NEW! for range)            │
│  max_price           DECIMAL (NEW! for range)            │
│  ─────────────────────────────────────────────────────  │
│  is_active           BOOLEAN                             │
│  created_at          TIMESTAMP                           │
│  updated_at          TIMESTAMP                           │
└─────────────────────────────────────────────────────────┘
                              │
                              │ Referenced by
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    BOOKINGS TABLE                        │
│                                                          │
│  id                  UUID PRIMARY KEY                    │
│  customer_id         UUID → customers                    │
│  service_id          UUID → services                     │
│  booking_date        TIMESTAMP                           │
│  preferred_date      TIMESTAMP                           │
│  status              VARCHAR                             │
│                      - 'pending' (direct booking)        │
│                      - 'quote_requested' (quote)         │
│                      - 'confirmed'                       │
│                      - 'cancelled'                       │
│                      - 'completed'                       │
│  notes               TEXT                                │
└─────────────────────────────────────────────────────────┘
```

## 📊 Price Type Examples

```
┌───────────────────────────────────────────────────────────────┐
│                      PRICE TYPE: SINGLE                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Database Values:                                              │
│    display_price_type: 'single'                               │
│    base_price: 25000                                          │
│    min_price: null                                            │
│    max_price: null                                            │
│                                                                │
│  Display on Landing Page:                                      │
│    ┌────────────────────────────────────┐                    │
│    │ RWF 25,000 / per service           │                    │
│    └────────────────────────────────────┘                    │
│                                                                │
│  Use Case:                                                     │
│    Fixed-price services where cost doesn't vary               │
│    (e.g., standard car wash, basic consultation)              │
│                                                                │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      PRICE TYPE: RANGE                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Database Values:                                              │
│    display_price_type: 'range'                                │
│    base_price: 10000 (set to min for compatibility)          │
│    min_price: 10000                                           │
│    max_price: 32000                                           │
│                                                                │
│  Display on Landing Page:                                      │
│    ┌────────────────────────────────────┐                    │
│    │ RWF 10,000 - 32,000 / per sqm      │                    │
│    │ Price range based on requirements  │                    │
│    └────────────────────────────────────┘                    │
│                                                                │
│  Use Case:                                                     │
│    Variable-cost services                                     │
│    (e.g., fumigation based on area, renovation by scope)      │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 User Journey Summary

### **Admin Journey:**
```
Login → Services → Add/Edit → Upload Image → Set Price (Fixed/Range) → Save
                                      ↓
                            Service appears on landing page
                                      ↓
                            Customers can book or request quotes
                                      ↓
                         Manage bookings and generate quotes
```

### **Customer Journey (Book Now):**
```
Landing Page → See Service with Image → Click "Book Now" 
     ↓
Booking Form → Fill Details → Submit → Immediate Confirmation
```

### **Customer Journey (Request Quote):**
```
Landing Page → See Service with Price Range → Click "Request Quote"
     ↓
Booking Form → Fill Details + Requirements → Submit → Wait for Quote
     ↓
Receive Quote Email → Review → Accept/Reject
     ↓
If Accepted → Booking Confirmed
```

## 🔐 Security & Storage

```
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE STORAGE                        │
│                                                          │
│  Bucket: service-photos                                  │
│  ├── services/                                          │
│  │   ├── 1703001234567-abc123.jpg                       │
│  │   ├── 1703001234568-def456.png                       │
│  │   └── ...                                            │
│                                                          │
│  Security:                                               │
│  ✓ Public read access (anyone can view)                 │
│  ✓ Authenticated write (only logged-in admins)          │
│  ✓ File type validation (images only)                   │
│  ✓ File size limit (5MB max)                            │
│  ✓ Automatic URL generation                             │
│                                                          │
│  Public URL Format:                                      │
│  https://{project}.supabase.co/storage/v1/object/       │
│  public/service-photos/services/{filename}               │
└─────────────────────────────────────────────────────────┘
```

---

These visual flows help understand how all the new features work together!
