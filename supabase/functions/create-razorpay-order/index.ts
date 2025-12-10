import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  bookingId: string;
  amount: number;
}

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount > 0 && 
         amount <= 1000000 && // Max 10 lakh INR
         Number.isInteger(amount);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { bookingId, amount } = body as CreateOrderRequest;
    
    // Validate inputs
    if (!bookingId || typeof bookingId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isValidUUID(bookingId)) {
      return new Response(
        JSON.stringify({ error: "Invalid booking ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isValidAmount(amount)) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a positive integer up to 1000000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Creating Razorpay order for booking:", bookingId, "amount:", amount);

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment system not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Razorpay order
    const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: bookingId,
        notes: {
          booking_id: bookingId,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderResponse.json();
    console.log("Razorpay order created:", order.id);

    // Update booking with Razorpay order ID
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ razorpay_order_id: order.id })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-razorpay-order:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
