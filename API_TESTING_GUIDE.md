# API Testing Guide

This guide provides comprehensive examples for testing all API endpoints in your Service Management System.

## Prerequisites

1. **Start the development server:**
```bash
npm run dev
```

2. **Set up Supabase:**
- Create a Supabase project
- Run the schema.sql file
- Configure .env.local with your credentials

3. **Install a REST client:**
- Use Postman, Insomnia, or Thunder Client (VS Code extension)
- Or use curl from command line

## Base URL
```
http://localhost:3000/api
```

---

## 1. Services API

### Create a Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Residential Fumigation",
    "description": "Complete fumigation service for residential properties",
    "base_price": 150.00,
    "unit": "per sqm",
    "category": "Fumigation",
    "is_active": true
  }'
```

### Get All Services
```bash
curl http://localhost:3000/api/services
```

### Get Services by Category
```bash
curl "http://localhost:3000/api/services?category=Fumigation&is_active=true"
```

### Update a Service
```bash
curl -X PATCH http://localhost:3000/api/services/SERVICE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "base_price": 175.00,
    "description": "Updated description"
  }'
```

### Delete a Service
```bash
curl -X DELETE http://localhost:3000/api/services/SERVICE_ID
```

---

## 2. Customers API

### Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main Street, Apt 4B, New York, NY 10001"
  }'
```

### Get All Customers
```bash
curl http://localhost:3000/api/customers
```

### Search Customers
```bash
curl "http://localhost:3000/api/customers?search=john"
```

### Get Single Customer
```bash
curl http://localhost:3000/api/customers/CUSTOMER_ID
```

### Update Customer
```bash
curl -X PATCH http://localhost:3000/api/customers/CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-0456",
    "address": "456 New Address, City, State 12345"
  }'
```

---

## 3. Bookings API

### Create a Booking (New Customer)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_info": {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+1-555-0789",
      "address": "789 Oak Avenue, Los Angeles, CA 90001"
    },
    "service_id": "SERVICE_ID",
    "preferred_date": "2024-08-15T10:00:00Z",
    "notes": "Need fumigation for 2-bedroom apartment. Pet-friendly chemicals preferred."
  }'
```

### Create a Booking (Existing Customer)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_ID",
    "service_id": "SERVICE_ID",
    "preferred_date": "2024-08-20T14:00:00Z",
    "notes": "Follow-up service"
  }'
```

### Get All Bookings
```bash
curl http://localhost:3000/api/bookings
```

### Get Bookings by Status
```bash
curl "http://localhost:3000/api/bookings?status=pending"
```

### Get Customer's Bookings
```bash
curl "http://localhost:3000/api/bookings?customer_id=CUSTOMER_ID"
```

### Get Single Booking
```bash
curl http://localhost:3000/api/bookings/BOOKING_ID
```

### Update Booking Status
```bash
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "notes": "Confirmed by customer via phone"
  }'
```

---

## 4. Quotations API

### Auto-Generate Quotation from Booking
```bash
curl -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID"
  }'
```

### Create Custom Quotation
```bash
curl -X POST http://localhost:3000/api/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID",
    "quotation_number": "QUO-2024-001",
    "total_amount": 500.00,
    "tax": 50.00,
    "discount": 25.00,
    "final_amount": 525.00,
    "status": "sent",
    "valid_until": "2024-08-30T23:59:59Z"
  }'
```

### Get All Quotations
```bash
curl http://localhost:3000/api/quotations
```

### Get Quotations by Booking
```bash
curl "http://localhost:3000/api/quotations?booking_id=BOOKING_ID"
```

### Get Quotations by Status
```bash
curl "http://localhost:3000/api/quotations?status=sent"
```

### Update Quotation (Accept/Reject)
```bash
curl -X PATCH http://localhost:3000/api/quotations/QUOTATION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "terms_accepted": true,
    "terms_accepted_at": "2024-07-21T10:30:00Z"
  }'
```

---

## 5. Jobs API

### Create a Job
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID",
    "quotation_id": "QUOTATION_ID",
    "scheduled_date": "2024-08-15T09:00:00Z",
    "status": "scheduled",
    "notes": "Bring pet-safe chemicals"
  }'
```

### Get All Jobs
```bash
curl http://localhost:3000/api/jobs
```

### Get Jobs by Status
```bash
curl "http://localhost:3000/api/jobs?status=scheduled"
```

### Get Jobs by Date Range
```bash
curl "http://localhost:3000/api/jobs?start_date=2024-08-01&end_date=2024-08-31"
```

### Get Single Job (Full Details)
```bash
curl http://localhost:3000/api/jobs/JOB_ID
```

### Update Job Status
```bash
curl -X PATCH http://localhost:3000/api/jobs/JOB_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "start_time": "2024-08-15T09:15:00Z",
    "weather_condition": "dry"
  }'
```

### Complete a Job
```bash
curl -X PATCH http://localhost:3000/api/jobs/JOB_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "end_time": "2024-08-15T14:30:00Z",
    "notes": "Job completed successfully. Customer satisfied."
  }'
```

---

## 6. Staff API

### Create Staff Member
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Johnson",
    "email": "mike.johnson@company.com",
    "phone": "+1-555-0111",
    "role": "Technician",
    "hourly_rate": 25.00,
    "is_active": true
  }'
```

### Get All Staff
```bash
curl http://localhost:3000/api/staff
```

### Get Staff by Role
```bash
curl "http://localhost:3000/api/staff?role=Technician&is_active=true"
```

### Update Staff
```bash
curl -X PATCH http://localhost:3000/api/staff/STAFF_ID \
  -H "Content-Type: application/json" \
  -d '{
    "hourly_rate": 28.00,
    "role": "Senior Technician"
  }'
```

---

## 7. Invoices API

### Create Invoice
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB_ID",
    "total_amount": 500.00,
    "tax": 50.00,
    "discount": 0.00,
    "final_amount": 550.00,
    "status": "pending",
    "due_date": "2024-09-15T23:59:59Z",
    "payment_method": "credit_card"
  }'
```

### Get All Invoices
```bash
curl http://localhost:3000/api/invoices
```

### Get Invoices by Status
```bash
curl "http://localhost:3000/api/invoices?status=pending"
```

### Get Invoices by Date Range
```bash
curl "http://localhost:3000/api/invoices?start_date=2024-08-01&end_date=2024-08-31"
```

### Get Single Invoice
```bash
curl http://localhost:3000/api/invoices/INVOICE_ID
```

### Mark Invoice as Paid
```bash
curl -X PATCH http://localhost:3000/api/invoices/INVOICE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paid_date": "2024-08-20T15:30:00Z",
    "payment_method": "credit_card"
  }'
```

---

## 8. Payments API

### Record a Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "INVOICE_ID",
    "amount": 550.00,
    "payment_method": "credit_card",
    "transaction_reference": "ch_1234567890abcdef",
    "notes": "Paid via Stripe"
  }'
```

### Record Partial Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "INVOICE_ID",
    "amount": 275.00,
    "payment_method": "cash",
    "notes": "Partial payment - 50% upfront"
  }'
```

### Get All Payments
```bash
curl http://localhost:3000/api/payments
```

### Get Payments for an Invoice
```bash
curl "http://localhost:3000/api/payments?invoice_id=INVOICE_ID"
```

---

## 9. Inventory API

### Create Inventory Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Termite Chemical - Premium",
    "category": "chemicals",
    "unit": "liters",
    "quantity": 50.0,
    "unit_cost": 35.00,
    "reorder_level": 10.0,
    "is_active": true
  }'
```

### Get All Inventory
```bash
curl http://localhost:3000/api/inventory
```

### Get Low Stock Items
```bash
curl "http://localhost:3000/api/inventory?low_stock=true"
```

### Get Inventory by Category
```bash
curl "http://localhost:3000/api/inventory?category=chemicals"
```

---

## 10. Reports API

### Get Dashboard Statistics
```bash
curl http://localhost:3000/api/reports/dashboard
```

### Get Dashboard with Date Filter
```bash
curl "http://localhost:3000/api/reports/dashboard?start_date=2024-08-01&end_date=2024-08-31"
```

---

## Complete Workflow Example

### 1. Create a Service
```bash
SERVICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Fumigation",
    "description": "Complete fumigation service",
    "base_price": 200.00,
    "unit": "per service",
    "category": "Fumigation",
    "is_active": true
  }')

SERVICE_ID=$(echo $SERVICE_RESPONSE | jq -r '.service.id')
echo "Service ID: $SERVICE_ID"
```

### 2. Create a Booking
```bash
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_info\": {
      \"name\": \"Test Customer\",
      \"email\": \"test@example.com\",
      \"phone\": \"+1-555-0123\",
      \"address\": \"123 Test St\"
    },
    \"service_id\": \"$SERVICE_ID\",
    \"preferred_date\": \"2024-08-25T10:00:00Z\",
    \"notes\": \"Test booking\"
  }")

BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.booking.id')
echo "Booking ID: $BOOKING_ID"
```

### 3. Generate Quotation
```bash
QUOTATION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"booking_id\": \"$BOOKING_ID\"
  }")

QUOTATION_ID=$(echo $QUOTATION_RESPONSE | jq -r '.quotation.id')
echo "Quotation ID: $QUOTATION_ID"
```

### 4. Accept Quotation
```bash
curl -X PATCH http://localhost:3000/api/quotations/$QUOTATION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "terms_accepted": true,
    "terms_accepted_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

### 5. Create Job
```bash
JOB_RESPONSE=$(curl -s -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d "{
    \"booking_id\": \"$BOOKING_ID\",
    \"quotation_id\": \"$QUOTATION_ID\",
    \"scheduled_date\": \"2024-08-25T09:00:00Z\",
    \"status\": \"scheduled\"
  }")

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.job.id')
echo "Job ID: $JOB_ID"
```

### 6. Complete Job
```bash
curl -X PATCH http://localhost:3000/api/jobs/$JOB_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "start_time": "2024-08-25T09:00:00Z",
    "end_time": "2024-08-25T13:00:00Z"
  }'
```

### 7. Create Invoice
```bash
INVOICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d "{
    \"job_id\": \"$JOB_ID\",
    \"total_amount\": 200.00,
    \"tax\": 20.00,
    \"discount\": 0.00,
    \"final_amount\": 220.00,
    \"status\": \"pending\",
    \"due_date\": \"2024-09-25T23:59:59Z\"
  }")

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.invoice.id')
echo "Invoice ID: $INVOICE_ID"
```

### 8. Record Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"invoice_id\": \"$INVOICE_ID\",
    \"amount\": 220.00,
    \"payment_method\": \"credit_card\",
    \"transaction_reference\": \"test_ch_123456\"
  }"
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Tips

1. **Save IDs**: After creating resources, save their IDs for subsequent requests
2. **Use jq**: For parsing JSON responses in bash scripts (install with `brew install jq` or `apt-get install jq`)
3. **Test in order**: Follow the natural workflow (Service → Booking → Quotation → Job → Invoice → Payment)
4. **Check Supabase**: View data in Supabase dashboard to verify operations
5. **Monitor logs**: Watch the terminal where `npm run dev` is running for error details

---

**Happy Testing!** 🚀
