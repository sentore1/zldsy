# Booking Schema Note

## Issue Resolved
The mobile app was trying to insert a `customer_info` JSONB column into the `bookings` table, but this column doesn't exist in the database schema.

## Database Design
The `bookings` table uses a **normalized design** with a foreign key relationship:
- `bookings.customer_id` references `customers.id`
- Customer information is stored in the separate `customers` table

## Correct Flow
When creating a booking:
1. First, insert customer data into the `customers` table
2. Get the `customer.id` from the insert response
3. Then, insert into `bookings` table with the `customer_id` reference

## Example (Dart/Flutter)
```dart
// Step 1: Create customer
final customerResponse = await supabase
    .from('customers')
    .insert({
      'name': name,
      'email': email,
      'phone': phone,
      'address': address,
    })
    .select()
    .single();

final customerId = customerResponse['id'];

// Step 2: Create booking
final bookingResponse = await supabase
    .from('bookings')
    .insert({
      'customer_id': customerId,
      'service_id': serviceId,
      'preferred_date': preferredDate,
      'notes': notes,
      'status': 'pending',
      'booking_date': DateTime.now().toIso8601String(),
    })
    .select()
    .single();
```

## Web App Approach
The web app sends `customer_info` to the API route (`/api/bookings`), which then:
1. Creates the customer record
2. Creates the booking with the customer_id

This is the **correct approach** and the mobile app has been updated to follow the same pattern.

## Date Fixed
2026-07-25
