import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotCardProps {
  duration: string;
  hours: number;
  price: number;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  isPopular?: boolean;
}

const TimeSlotCard = ({ duration, hours, price, description, isSelected, onClick, isPopular }: TimeSlotCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-2xl cursor-pointer transition-all duration-300",
        "border-2 hover:shadow-md",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
          Most Popular
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{duration}</h4>
            <p className="text-xs text-muted-foreground">{hours === 0 ? 'Flexible' : `${hours} hours`}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">₹{price}</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>

      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TimeSlotCard;
