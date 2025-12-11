import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type PaymentMethod = "qr" | "gpay" | "phonepe" | "paytm" | "other_upi" | "card";

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

const UPI_APP_PACKAGES: Record<string, string> = {
  gpay: "com.google.android.apps.nbu.paisa.user",
  phonepe: "com.phonepe.app",
  paytm: "net.one97.paytm",
};

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

  const getPaymentConfig = (paymentMethod: PaymentMethod) => {
    if (paymentMethod === "card") {
      return {
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay via Card or Bank",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };
    }

    if (paymentMethod === "qr") {
      return {
        config: {
          display: {
            blocks: {
              upi: {
                name: "Scan QR Code",
                instruments: [
                  { method: "upi", flows: ["qrcode"] }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };
    }

    if (paymentMethod === "other_upi") {
      return {
        config: {
          display: {
            blocks: {
              upi: {
                name: "Enter UPI ID",
                instruments: [
                  { method: "upi", flows: ["collect"] }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };
    }

    // For specific UPI apps (gpay, phonepe, paytm)
    const appPackage = UPI_APP_PACKAGES[paymentMethod];
    if (appPackage) {
      return {
        config: {
          display: {
            blocks: {
              upi: {
                name: `Pay via ${paymentMethod === "gpay" ? "Google Pay" : paymentMethod === "phonepe" ? "PhonePe" : "Paytm"}`,
                instruments: [
                  { 
                    method: "upi", 
                    flows: ["intent"],
                    apps: [appPackage]
                  }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };
    }

    // Default fallback - show all options
    return {
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",
              instruments: [
                { method: "upi", flows: ["qrcode", "collect", "intent"] }
              ]
            },
            other: {
              name: "Other Payment Methods",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" }
              ]
            }
          },
          sequence: ["block.upi", "block.other"],
          preferences: {
            show_default_blocks: false
          }
        }
      }
    };
  };

  const initiatePayment = useCallback(async (
    order: RazorpayOrder,
    bookingId: string,
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    },
    onSuccess: () => void,
    onFailure: (error: string) => void,
    paymentMethod: PaymentMethod = "qr"
  ) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      onFailure("Failed to load payment gateway. Please try again.");
      return;
    }

    const paymentConfig = getPaymentConfig(paymentMethod);

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
      ...paymentConfig,
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
