-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Update default status to pending for new bookings
ALTER TABLE public.bookings 
ALTER COLUMN status SET DEFAULT 'pending';