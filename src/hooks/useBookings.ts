import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  location_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  duration: string;
  price: number;
  status: string;
  created_at: string;
}

export const useBookings = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
  });
};

export const useBookingsForDateAndLocation = (locationId: string | null, date: string | null) => {
  return useQuery({
    queryKey: ["bookings", locationId, date],
    queryFn: async () => {
      if (!locationId || !date) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("location_id", locationId)
        .eq("booking_date", date)
        .eq("status", "confirmed");
      
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!locationId && !!date,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (booking: Omit<Booking, "id" | "created_at" | "status">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{ ...booking, status: "pending" }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
