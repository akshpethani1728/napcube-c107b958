-- Fix PUBLIC_DATA_EXPOSURE: Restrict booking data to admins only
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON public.bookings;

CREATE POLICY "Only admins can view bookings"
ON public.bookings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));