import { useState } from "react";
import { Calendar, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  selectedLocation: string | null;
  selectedSlot: string | null;
  slotPrice: number;
}

const BookingForm = ({ selectedLocation, selectedSlot, slotPrice }: BookingFormProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation || !selectedSlot || !date || !time || !name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Booking Confirmed! 🎉",
      description: `Your pod at ${selectedLocation} is reserved for ${format(date, "PPP")} at ${time}.`,
    });
  };

  const isFormValid = selectedLocation && selectedSlot && date && time && name && email;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="+1 234 567 890" 
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
            <span className="text-2xl font-bold text-primary">${slotPrice}</span>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        size="lg"
        disabled={!isFormValid}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
      >
        Confirm Booking
      </Button>
    </form>
  );
};

export default BookingForm;
