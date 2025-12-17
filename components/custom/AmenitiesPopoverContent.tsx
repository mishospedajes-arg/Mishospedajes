import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { iconMap } from "@/lib/amenities-data";
import { cn } from "@/lib/utils";
import { getAmenitiesWithDescriptions } from "@/app/actions/getAmenities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Minus, Plus } from "lucide-react";

interface AmenityButtonProps {
  text: string;
  Icon: React.ElementType;
  isSelected: boolean;
  onClick: () => void;
  description?: string;
}

const AmenityButton = ({ text, Icon, isSelected, onClick, description }: AmenityButtonProps) => {
  const button = (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-8 rounded-md px-2 text-xs",
        isSelected && "border-primary text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {text}
    </Button>
  );

  if (description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            <p className="max-w-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

interface AmenitiesPopoverContentProps {
  selectedAmenities?: string[];
  onAmenityToggle?: (amenityId: string) => void;
  minGuests?: number;
  onMinGuestsChange?: (guests: number) => void;
  showGuestFilter?: boolean;
}

interface AmenityItem {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  description?: string;
}

export function AmenitiesPopoverContent({
  selectedAmenities = [],
  onAmenityToggle = () => { },
  minGuests = 1,
  onMinGuestsChange = () => { },
  showGuestFilter = false,
}: AmenitiesPopoverContentProps) {
  const [amenitiesList, setAmenitiesList] = useState<AmenityItem[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const dbAmenities = await getAmenitiesWithDescriptions();
        if (dbAmenities && dbAmenities.length > 0) {
          const mappedAmenities = dbAmenities.map((a) => {
            // Map DB icon name to component, fallback to generic if missing
            const IconComponent = a.icon && iconMap[a.icon] ? iconMap[a.icon] : iconMap["Home"];
            return {
              id: a.slug, // Use slug to match expected ID format
              name: a.name,
              icon: IconComponent,
              category: a.category,
              description: a.description
            };
          });
          setAmenitiesList(mappedAmenities);
        }
      } catch (error) {
        console.error("Failed to fetch amenities details:", error);
      }
    };
    fetchAmenities();
  }, []);

  const groupedAmenities = amenitiesList
    .filter((amenity) => amenity.category === "Premium")
    .reduce((acc, amenity) => {
      const { category } = amenity;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(amenity);
      return acc;
    }, {} as Record<string, AmenityItem[]>);

  return (
    <div className="p-4 pr-2 w-96 pt-6">
      {showGuestFilter && (
        <div className="mb-4 border-b pb-4 flex flex-wrap gap-15">
          <h4 className="text-sm pt-3 font-medium mb-3">Cantidad de huéspedes</h4>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMinGuestsChange(Math.max(1, minGuests - 1))}
              disabled={minGuests <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-4 text-center text-sm">{minGuests}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMinGuestsChange(minGuests + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <ScrollArea className="h-80 w-full">
        <div className="pr-4">
          {Object.entries(groupedAmenities).map(([category, amenities]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-medium hidden pb-2">{category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((amenity) => (
                  <AmenityButton
                    key={amenity.id}
                    text={amenity.name}
                    Icon={amenity.icon}
                    isSelected={selectedAmenities.includes(amenity.id)}
                    onClick={() => onAmenityToggle(amenity.id)}
                    description={amenity.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
