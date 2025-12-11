-- Drop and recreate the INSERT policy as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
AS PERMISSIVE
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);