import { useState } from "react";
import { Moon, Shield, Wifi, Coffee } from "lucide-react";
import LocationCard from "@/components/LocationCard";
import TimeSlotCard from "@/components/TimeSlotCard";
import BookingForm from "@/components/BookingForm";

const locations = [
  {
    id: "airport-jfk",
    name: "JFK Airport",
    address: "Terminal 4, New York",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
    availablePods: 12
  },
  {
    id: "downtown-manhattan",
    name: "Manhattan Hub",
    address: "Times Square, NYC",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    availablePods: 8
  },
  {
    id: "sf-downtown",
    name: "San Francisco",
    address: "Union Square, SF",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop",
    availablePods: 15
  },
  {
    id: "lax-terminal",
    name: "LAX Airport",
    address: "Terminal B, Los Angeles",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop",
    availablePods: 20
  }
];

const timeSlots = [
  {
    id: "flexible",
    duration: "Flexible",
    hours: 0,
    price: 15,
    description: "Pay per hour, perfect for quick naps"
  },
  {
    id: "3-hours",
    duration: "3 Hours",
    hours: 3,
    price: 35,
    description: "Short rest between flights or meetings"
  },
  {
    id: "6-hours",
    duration: "6 Hours",
    hours: 6,
    price: 55,
    description: "Half-day retreat for deep rest",
    isPopular: true
  },
  {
    id: "12-hours",
    duration: "12 Hours",
    hours: 12,
    price: 85,
    description: "Extended stay for overnight comfort"
  },
  {
    id: "24-hours",
    duration: "24 Hours",
    hours: 24,
    price: 120,
    description: "Full day access with all amenities"
  }
];

const features = [
  { icon: Moon, title: "Premium Comfort", description: "Memory foam mattress & blackout pods" },
  { icon: Shield, title: "Safe & Secure", description: "24/7 security & personal lockers" },
  { icon: Wifi, title: "High-Speed WiFi", description: "Stay connected while you rest" },
  { icon: Coffee, title: "Complimentary", description: "Fresh coffee & refreshments" }
];

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const selectedSlotData = timeSlots.find(s => s.id === selectedSlot);
  const selectedLocationData = locations.find(l => l.id === selectedLocation);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-primary/20 text-card py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary))_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--accent))_0%,transparent_50%)]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 mb-6">
            <Moon className="w-4 h-4" />
            <span className="text-sm font-medium">Rest. Recharge. Resume.</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Sleep Pods for
            <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Modern Travelers
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-card/70 max-w-2xl mx-auto mb-10">
            Private, comfortable sleeping pods at airports and city centers. 
            Book by the hour, get the rest you deserve.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-4 rounded-xl bg-card/5 backdrop-blur-sm border border-card/10">
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-card/60 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Step 1: Location Selection */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</span>
            <h2 className="text-2xl font-bold text-foreground">Choose Your Location</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                {...location}
                isSelected={selectedLocation === location.id}
                onClick={() => setSelectedLocation(location.id)}
              />
            ))}
          </div>
        </section>

        {/* Step 2: Time Slot Selection */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</span>
            <h2 className="text-2xl font-bold text-foreground">Select Duration</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {timeSlots.map((slot) => (
              <TimeSlotCard
                key={slot.id}
                {...slot}
                isSelected={selectedSlot === slot.id}
                onClick={() => setSelectedSlot(slot.id)}
              />
            ))}
          </div>
        </section>

        {/* Step 3: Booking Form */}
        <section className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</span>
            <h2 className="text-2xl font-bold text-foreground">Complete Your Booking</h2>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <BookingForm 
              selectedLocation={selectedLocationData?.name || null}
              selectedSlot={selectedSlotData?.duration || null}
              slotPrice={selectedSlotData?.price || 0}
              upiId="akshpethani1728@ybl"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 SleepPod. Premium rest for modern travelers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
