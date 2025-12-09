import { useState } from "react";
import { Calendar, User, Mail, Phone, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCreateBooking } from "@/hooks/useBookings";
import { useLocationAvailability } from "@/hooks/useAvailability";
import PaymentQRDialog from "./PaymentQRDialog";
interface BookingFormProps {
  selectedLocation: string | null;
  selectedLocationId: string | null;
  selectedSlot: string | null;
  slotPrice: number;
  upiId?: string;
}

const BookingForm = ({ 
  selectedLocation, 
  selectedLocationId,
  selectedSlot, 
  slotPrice, 
  upiId = "yourstore@upi" 
}: BookingFormProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  
  const { data: availability, isLoading: checkingAvailability } = useLocationAvailability(
    selectedLocationId,
    date || null
  );

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const generateUPILink = () => {
    const transactionNote = `SleepPod-${selectedLocation}-${selectedSlot}`;
    const encodedName = encodeURIComponent("Sleep Pod Booking");
    const encodedNote = encodeURIComponent(transactionNote);
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${slotPrice}&cu=INR&tn=${encodedNote}`;
  };

  const handleShowQRCode = async () => {
    if (!selectedLocation || !selectedLocationId || !selectedSlot || !date || !time || !name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before payment.",
        variant: "destructive"
      });
      return;
    }

    if (availability && !availability.isAvailable) {
      toast({
        title: "No Pods Available",
        description: "All pods are booked for this date. Please select a different date.",
        variant: "destructive"
      });
      return;
    }

    // Generate UPI link and show QR dialog
    const link = generateUPILink();
    setUpiLink(link);
    setShowQRDialog(true);
  };

  const handlePaymentComplete = async () => {
    if (!selectedLocationId || !date || !selectedSlot) return;

    try {
      await createBooking.mutateAsync({
        location_id: selectedLocationId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || "",
        booking_date: format(date, "yyyy-MM-dd"),
        booking_time: time,
        duration: selectedSlot,
        price: slotPrice,
      });

      setShowQRDialog(false);
      toast({
        title: "Booking Confirmed!",
        description: "Thank you for your payment. Your pod is reserved.",
      });

      // Reset form
      setDate(undefined);
      setTime("");
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Could not save your booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = selectedLocation && selectedSlot && date && time && name && email;
  const isUnavailable = availability && !availability.isAvailable;

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Check-in Time</Label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full h-12 px-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
          >
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Availability Warning */}
      {date && selectedLocationId && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3",
          checkingAvailability ? "bg-secondary/50 border-border" :
          isUnavailable ? "bg-red-500/10 border-red-500/30" :
          "bg-green-500/10 border-green-500/30"
        )}>
          {checkingAvailability ? (
            <span className="text-sm text-muted-foreground">Checking availability...</span>
          ) : isUnavailable ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">No pods available</p>
                <p className="text-sm text-muted-foreground">All {availability.totalPods} pods are booked for this date</p>
              </div>
            </>
          ) : availability ? (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium text-green-600">{availability.availablePods} pods available</p>
                <p className="text-sm text-muted-foreground">{availability.bookedPods} of {availability.totalPods} already booked</p>
              </div>
            </>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" 
            className="pl-10 h-12" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com" 
              className="pl-10 h-12" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210" 
              className="pl-10 h-12" 
            />
          </div>
        </div>
      </div>

      {selectedSlot && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Selected Package</span>
            <span className="font-semibold text-foreground">{selectedSlot}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">₹{slotPrice}</span>
          </div>
        </div>
      )}

      <Button 
        type="button"
        onClick={handleShowQRCode}
        size="lg"
        disabled={!isFormValid || isUnavailable || createBooking.isPending}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
      >
        <QrCode className="mr-2 h-5 w-5" />
        {createBooking.isPending ? "Saving..." : `Pay ₹${slotPrice} with UPI`}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Scan QR code with any UPI app to pay
      </p>

      {/* Payment QR Dialog */}
      <PaymentQRDialog
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        upiLink={upiLink}
        amount={slotPrice}
        bookingDetails={{
          location: selectedLocation || "",
          slot: selectedSlot || "",
          date: date ? format(date, "PPP") : "",
          time: time,
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </form>
  );
};

export default BookingForm;
