import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AvailabilityData {
  locationId: string;
  locationName: string;
  totalPods: number;
  bookedPods: number;
  availablePods: number;
}

export const useAvailability = (date: Date | null) => {
  return useQuery({
    queryKey: ["availability", date ? format(date, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!date) return [];
      
      const dateStr = format(date, "yyyy-MM-dd");
      
      // Get all locations
      const { data: locations, error: locError } = await supabase
        .from("locations")
        .select("*");
      
      if (locError) throw locError;
      
      // Get bookings for the date
      const { data: bookings, error: bookError } = await supabase
        .from("bookings")
        .select("location_id")
        .eq("booking_date", dateStr)
        .eq("status", "confirmed");
      
      if (bookError) throw bookError;
      
      // Calculate availability for each location
      const availability: AvailabilityData[] = locations.map(loc => {
        const bookedCount = bookings.filter(b => b.location_id === loc.id).length;
        return {
          locationId: loc.id,
          locationName: loc.name,
          totalPods: loc.total_pods,
          bookedPods: bookedCount,
          availablePods: Math.max(0, loc.total_pods - bookedCount),
        };
      });
      
      return availability;
    },
    enabled: !!date,
  });
};

export const useLocationAvailability = (locationId: string | null, date: Date | null) => {
  return useQuery({
    queryKey: ["locationAvailability", locationId, date ? format(date, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!locationId || !date) return null;
      
      const dateStr = format(date, "yyyy-MM-dd");
      
      // Get location info
      const { data: location, error: locError } = await supabase
        .from("locations")
        .select("*")
        .eq("id", locationId)
        .single();
      
      if (locError) throw locError;
      
      // Get bookings count for the date
      const { data: bookings, error: bookError } = await supabase
        .from("bookings")
        .select("id")
        .eq("location_id", locationId)
        .eq("booking_date", dateStr)
        .eq("status", "confirmed");
      
      if (bookError) throw bookError;
      
      const bookedCount = bookings.length;
      const availablePods = Math.max(0, location.total_pods - bookedCount);
      
      return {
        totalPods: location.total_pods,
        bookedPods: bookedCount,
        availablePods,
        isAvailable: availablePods > 0,
      };
    },
    enabled: !!locationId && !!date,
  });
};
