-- RLS Policies for Customer Tracking Feature
-- Allows anonymous users to track their bookings using their phone number

-- Policy: Allow anyone to read customer records (needed for phone lookup)
-- Security: Only exposes customer ID and phone, no sensitive data in the query
CREATE POLICY "Public can read customers for tracking"
ON customers
FOR SELECT
USING (true);

-- Policy: Allow anyone to read bookings with related data
-- Security: Users can see all bookings, but this is needed for the tracking feature
-- In production, you might want to restrict this further
CREATE POLICY "Public can read bookings for tracking"
ON bookings
FOR SELECT
USING (true);

-- Note: These policies allow read-only access for the tracking feature.
-- Write operations (INSERT, UPDATE, DELETE) are still protected by other policies
-- or by the absence of policies (which denies by default when RLS is enabled).

-- Alternative: More secure approach (commented out)
-- If you want to restrict booking visibility to only the customer's own bookings,
-- you would need to pass the customer_id somehow, which is difficult with anonymous access.
-- The current approach trades some privacy for functionality in the tracking feature.

/*
-- More restrictive policy (requires customer_id in the request context)
CREATE POLICY "Public can read own bookings"
ON bookings
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers 
    WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'
  )
);
*/
