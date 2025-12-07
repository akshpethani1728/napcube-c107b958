-- Create app_role enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create locations table with pod counts
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_pods INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Locations are publicly readable
CREATE POLICY "Locations are viewable by everyone" 
ON public.locations FOR SELECT USING (true);

-- Bookings are publicly insertable (for new bookings)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings FOR INSERT WITH CHECK (true);

-- Bookings are publicly readable for availability check
CREATE POLICY "Bookings are viewable by everyone" 
ON public.bookings FOR SELECT USING (true);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin can manage locations
CREATE POLICY "Admins can manage locations"
ON public.locations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can manage bookings
CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default locations
INSERT INTO public.locations (name, address, total_pods, image_url) VALUES
('Mumbai Central', 'Platform 1, Mumbai Central Railway Station', 15, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
('Delhi Airport T3', 'Terminal 3, Indira Gandhi International Airport', 20, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400'),
('Bangalore Majestic', 'Kempegowda Bus Station, Majestic', 12, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'),
('Chennai Central', 'Chennai Central Railway Station', 10, 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400'),
('Hyderabad RGIA', 'Rajiv Gandhi International Airport', 18, 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=400');

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;