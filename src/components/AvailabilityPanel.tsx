import { useState } from "react";
import { useAvailability } from "@/hooks/useAvailability";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AvailabilityPanel = () => {
  const [date, setDate] = useState<Date>(new Date());
  const { data: availability, isLoading } = useAvailability(date);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Pod Availability</h3>
      </div>

      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-12"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-4">Loading availability...</div>
      ) : availability && availability.length > 0 ? (
        <div className="space-y-3">
          {availability.map((loc) => (
            <div
              key={loc.locationId}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div>
                <p className="font-medium text-foreground">{loc.locationName}</p>
                <p className="text-sm text-muted-foreground">
                  {loc.bookedPods} / {loc.totalPods} booked
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-bold",
                  loc.availablePods > 5 ? "text-green-500" :
                  loc.availablePods > 0 ? "text-yellow-500" : "text-red-500"
                )}>
                  {loc.availablePods}
                </p>
                <p className="text-xs text-muted-foreground">available</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          No locations available
        </div>
      )}
    </div>
  );
};

export default AvailabilityPanel;
