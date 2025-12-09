import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface PaymentQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upiLink: string;
  amount: number;
  bookingDetails: {
    location: string;
    slot: string;
    date: string;
    time: string;
  };
  onPaymentComplete: () => void;
}

const PaymentQRDialog = ({
  open,
  onOpenChange,
  upiLink,
  amount,
  bookingDetails,
  onPaymentComplete,
}: PaymentQRDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Scan to Pay</DialogTitle>
          <DialogDescription className="text-center">
            Scan this QR code with any UPI app to complete payment
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCodeSVG
              value={upiLink}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">₹{amount}</p>
          </div>

          {/* Booking Summary */}
          <div className="w-full p-4 rounded-lg bg-secondary/50 border border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{bookingDetails.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package</span>
              <span className="font-medium">{bookingDetails.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{bookingDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{bookingDetails.time}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Open GPay, PhonePe, Paytm or any UPI app</p>
            <p>and scan this QR code to pay</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={onPaymentComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              I've Paid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentQRDialog;
