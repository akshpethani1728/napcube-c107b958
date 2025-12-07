import { useState } from "react";
import { Moon, Shield, Wifi, Coffee, ChevronRight } from "lucide-react";
import LocationCard from "@/components/LocationCard";
import TimeSlotCard from "@/components/TimeSlotCard";
import BookingForm from "@/components/BookingForm";

const podImages = [
  "https://gemini.google.com/9d7f268c-76f7-4624-827e-0dee6a306eaa",
  "https://web.whatsapp.com/89b05082-9a3e-4c2f-9139-ea0634c1d9d2",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
];

const locations = [
  {
    id: "Dwarka",
    name: "Dwarikadhish Temple",
    address: "Dwarika, Gujarat",
    image: "https://www.gujarattourism.com/content/dam/gujrattourism/images/religious-sites/dwarkadhish-temple/Dwarkadhish-Temple-Thumbnail.jpg",
    availablePods: 12
  },
  {
    id: "downtown-junagadh",
    name: "Girnar hills",
    address: "Junagadh, Gujarat",
    image: "https://tse3.mm.bing.net/th/id/OIP.CwYl9nFzUd6Tj0CdQh_OgQHaEK?pid=Api&P=0&h=180",
    availablePods: 20
  },
  {
    id: "Somnath Temple",
    name: "Somnath Temple",
    address: "Somnath, Gujarat ",
    image: "https://www.worldtalentorg.com/wp-content/uploads/2021/03/Somanath_Temple.jpg",
    availablePods: 15
  },
  {
    id: "Saputara",
    name: "Saputara hill station",
    address: "Dang",
    image: "https://www.garhatours.in/wp-content/uploads/2015/09/Saputara_hillstation.jpg",
    availablePods: 20
  }
];

const timeSlots = [
  {
    id: "flexible",
    duration: "Flexible",
    hours: 0,
    price: 60,
    description: "Pay per hour, perfect for quick naps"
  },
  {
    id: "3-hours",
    duration: "3 Hours",
    hours: 3,
    price: 180,
    description: "Short rest between flights or meetings"
  },
  {
    id: "6-hours",
    duration: "6 Hours",
    hours: 6,
    price: 360,
    description: "Half-day retreat for deep rest",
    isPopular: true
  },
  {
    id: "12-hours",
    duration: "12 Hours",
    hours: 12,
    price: 599,
    description: "Extended stay for overnight comfort"
  },
  {
    id: "24-hours",
    duration: "24 Hours",
    hours: 24,
    price: 999,
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
      <header className="relative overflow-hidden bg-primary text-primary-foreground py-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--accent))_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(172_66%_50%)_0%,transparent_50%)]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
            <Moon className="w-4 h-4" />
            <span className="text-sm font-medium">Rest. Recharge. Resume.</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            NapCube for
            <span className="block bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
              Modern Travelers
            </span>
          </h1>

          {/* Pod Images Showcase - Horizontal Scroll */}
          <div className="relative w-full max-w-5xl mx-auto mb-10 -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {podImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative flex-shrink-0 w-64 md:w-80 overflow-hidden rounded-2xl aspect-[4/3] group snap-center"
                >
                  <img 
                    src={image} 
                    alt={`Premium sleeping pod ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Private, comfortable sleeping pods at airports and city centers. 
            Book by the hour, get the rest you deserve.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-primary-foreground/60 mt-1">{feature.description}</p>
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
            © 2024 NapCube. Premium rest for modern travelers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
