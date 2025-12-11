import { useState } from "react";
import { Check, QrCode, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "qr" | "gpay" | "phonepe" | "paytm" | "other_upi" | "card";

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: "gpay",
    name: "Google Pay",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    description: "Pay via Google Pay app",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <circle cx="12" cy="12" r="12" fill="#5f259f"/>
        <path d="M8 7h3.5c2.5 0 4 1.5 4 3.5S14 14 11.5 14H10v4H8V7zm2 5h1.5c1 0 2-.5 2-1.5S12.5 9 11.5 9H10v3z" fill="white"/>
      </svg>
    ),
    description: "Pay via PhonePe app",
  },
  {
    id: "paytm",
    name: "Paytm",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <rect width="24" height="24" rx="4" fill="#00BAF2"/>
        <path d="M4 8h2.5c1.5 0 2.5.8 2.5 2s-1 2-2.5 2H5v2H4V8zm1 3h1.5c.8 0 1.5-.3 1.5-1s-.7-1-1.5-1H5v2zm5-3h1v6h-1V8zm2 0h1.2l2 4.5 2-4.5H18l-2.8 6h-1.4L11 8zm7 0h1v6h-1V8z" fill="white"/>
      </svg>
    ),
    description: "Pay via Paytm app",
  },
  {
    id: "qr",
    name: "Scan QR Code",
    icon: <QrCode className="w-6 h-6 text-primary" />,
    description: "Scan with any UPI app",
  },
  {
    id: "other_upi",
    name: "Other UPI Apps",
    icon: <Smartphone className="w-6 h-6 text-primary" />,
    description: "Enter UPI ID manually",
  },
  {
    id: "card",
    name: "Card / Netbanking",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    description: "Credit/Debit card or bank",
  },
];

const PaymentMethodSelector = ({ selectedMethod, onSelect }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Select Payment Method</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              selectedMethod === method.id
                ? "border-primary bg-primary/10"
                : "border-border bg-background"
            )}
          >
            {selectedMethod === method.id && (
              <div className="absolute top-2 right-2">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="flex items-center justify-center w-10 h-10">
              {method.icon}
            </div>
            <span className="text-sm font-medium text-foreground">{method.name}</span>
            <span className="text-xs text-muted-foreground text-center">{method.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
