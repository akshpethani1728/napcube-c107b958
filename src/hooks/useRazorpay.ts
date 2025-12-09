import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface PaymentVerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const useRazorpay = () => {
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const createOrder = useCallback(async (bookingId: string, amount: number): Promise<RazorpayOrder> => {
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: { bookingId, amount },
    });

    if (error) {
      throw new Error(error.message || "Failed to create payment order");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }, []);

  const verifyPayment = useCallback(async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    booking_id: string
  ): Promise<PaymentVerificationResult> => {
    const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
      body: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        booking_id,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to verify payment");
    }

    return data;
  }, []);

  const initiatePayment = useCallback(async (
    order: RazorpayOrder,
    bookingId: string,
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    },
    onSuccess: () => void,
    onFailure: (error: string) => void
  ) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      onFailure("Failed to load payment gateway. Please try again.");
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "NapCube",
      description: "Sleep Pod Booking",
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          const result = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            bookingId
          );

          if (result.success) {
            onSuccess();
          } else {
            onFailure(result.error || "Payment verification failed");
          }
        } catch (error: any) {
          onFailure(error.message || "Payment verification failed");
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      theme: {
        color: "#000028",
      },
      modal: {
        ondismiss: () => {
          onFailure("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response: any) => {
      onFailure(response.error?.description || "Payment failed");
    });
    razorpay.open();
  }, [loadRazorpayScript, verifyPayment]);

  return {
    createOrder,
    initiatePayment,
    verifyPayment,
  };
};
