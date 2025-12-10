-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Only admins can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;

-- Create PERMISSIVE policies (default behavior - at least one must pass)
-- Allow anyone to insert bookings (public booking form)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update bookings
CREATE POLICY "Admins can update bookings" 
ON public.bookings 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings" 
ON public.bookings 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));