import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidRazorpayId(str: string, prefix: string): boolean {
  // Razorpay IDs follow pattern: prefix_alphanumeric
  const regex = new RegExp(`^${prefix}_[A-Za-z0-9]{14,}$`);
  return regex.test(str);
}

function isValidSignature(str: string): boolean {
  // Razorpay signature is a 64-character hex string
  return /^[a-f0-9]{64}$/i.test(str);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = body as VerifyPaymentRequest;

    // Validate all required fields
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Payment ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!razorpay_signature || typeof razorpay_signature !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Signature is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!booking_id || typeof booking_id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Booking ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate formats
    if (!isValidRazorpayId(razorpay_order_id, 'order')) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isValidRazorpayId(razorpay_payment_id, 'pay')) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isValidSignature(razorpay_signature)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isValidUUID(booking_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid booking ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying payment for booking:", booking_id);

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      console.error("Razorpay secret not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const signatureBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(signatureBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Payment signature verified successfully");

    // Update booking status
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        razorpay_payment_id,
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", booking_id)
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to confirm booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Booking confirmed successfully:", booking_id);

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and booking confirmed" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-razorpay-payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
