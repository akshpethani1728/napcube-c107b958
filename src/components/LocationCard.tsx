import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationCardProps {
  id: string;
  name: string;
  address: string;
  image: string;
  availablePods: number;
  isSelected: boolean;
  onClick: () => void;
}

const LocationCard = ({ id, name, address, image, availablePods, isSelected, onClick }: LocationCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group",
        "border-2 hover:shadow-lg",
        isSelected 
          ? "border-primary shadow-lg scale-[1.02]" 
          : "border-transparent bg-card hover:border-primary/30"
      )}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-card">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <div className="flex items-center gap-1 text-sm opacity-90">
          <MapPin className="w-3.5 h-3.5" />
          <span>{address}</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {availablePods} pods available
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LocationCard;
