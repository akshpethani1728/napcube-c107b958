import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Smartphone, ArrowLeft, Moon, Clock, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  location_id: string;
  booking_date: string;
  booking_time: string;
  duration: string;
  price: number;
  status: string;
}

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");

  const bookingId = searchParams.get("booking_id");
  const upiId = searchParams.get("upi_id") || "yourstore@upi";

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        navigate("/");
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError || !bookingData) {
        toast({
          title: "Booking Not Found",
          description: "Unable to find your booking. Please try again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setBooking(bookingData);

      // Fetch location name
      const { data: locationData } = await supabase
        .from("locations")
        .select("name")
        .eq("id", bookingData.location_id)
        .single();

      if (locationData) {
        setLocationName(locationData.name);
      }

      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, navigate, toast]);

  const generateUPILink = () => {
    if (!booking) return "";
    const transactionNote = `NapCube-${booking.id.slice(0, 8)}`;
    const encodedName = encodeURIComponent("NapCube Booking");
    const encodedNote = encodeURIComponent(transactionNote);
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${booking.price}&cu=INR&tn=${encodedNote}`;
  };

  const handlePayWithUPI = () => {
    const upiLink = generateUPILink();
    window.location.href = upiLink;
  };

  const handleConfirmPayment = async () => {
    if (!booking) return;

    setConfirming(true);
    
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", booking.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to confirm booking. Please try again.",
        variant: "destructive",
      });
      setConfirming(false);
      return;
    }

    setPaymentStatus("success");
    setConfirming(false);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setConfirming(true);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
      setConfirming(false);
      return;
    }

    setPaymentStatus("failed");
    setConfirming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading booking details...</div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Moon className="w-6 h-6" />
            <span className="font-bold text-xl">NapCube</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">Your pod has been booked successfully.</p>

            <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
              <h2 className="font-semibold text-lg text-foreground mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{locationName}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{booking && format(new Date(booking.booking_date), "PPP")}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{booking?.booking_time} • {booking?.duration}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-xl text-primary">₹{booking?.price}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              A confirmation has been sent to <strong>{booking?.customer_email}</strong>
            </p>

            <Button onClick={() => navigate("/")} size="lg" className="w-full max-w-xs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Moon className="w-6 h-6" />
            <span className="font-bold text-xl">NapCube</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Cancelled</h1>
            <p className="text-muted-foreground mb-8">Your booking has been cancelled. No payment was made.</p>

            <Button onClick={() => navigate("/")} size="lg" className="w-full max-w-xs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Moon className="w-6 h-6" />
          <span className="font-bold text-xl">NapCube</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Complete Your Payment</h1>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{locationName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground">
                  {booking && format(new Date(booking.booking_date), "PPP")} at {booking?.booking_time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{booking?.duration}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg text-muted-foreground">Total Amount</span>
              <span className="text-3xl font-bold text-primary">₹{booking?.price}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handlePayWithUPI}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Pay with UPI App
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Opens your UPI app (GPay, PhonePe, Paytm, etc.)
          </p>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">After completing payment</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleConfirmPayment}
              disabled={confirming}
              size="lg"
              className="h-14 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {confirming ? "Confirming..." : "Payment Done"}
            </Button>

            <Button
              onClick={handleCancelBooking}
              disabled={confirming}
              variant="outline"
              size="lg"
              className="h-14 border-red-500/30 text-red-500 hover:bg-red-500/10"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Only click "Payment Done" after you have successfully completed the UPI payment.
            Your booking will only be confirmed after this step.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirmation;
