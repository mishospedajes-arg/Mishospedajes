"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn, formatDateToYYYYMMDD } from "@/lib/utils";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AmenitiesPopoverContent } from "./AmenitiesPopoverContent";
import { GuestsPopoverContent } from "./GuestsPopoverContent";
import { MobileSearchTrigger } from "./MobileSearchTrigger";
import { MobileSearchDialog } from "./MobileSearchDialog";

// Helper function to safely parse a YYYY-MM-DD string into a local Date object
const parseDateString = (dateString: string): Date | null => {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return null;
};

interface SearchBarProps {
  onSearch: (filters: {
    guests: number;
    amenities: string[];
    startDate?: string;
    endDate?: string;
  }) => void;
  initialFilters?: {
    guests: number;
    amenities: string[];
    dateRange: {
      from?: string;
      to?: string;
    };
  };
}

const SearchBar = ({ onSearch, initialFilters }: SearchBarProps) => {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const fromString = initialFilters?.dateRange?.from;
    const toString = initialFilters?.dateRange?.to;

    if (!fromString) {
      return undefined;
    }

    const fromDate = parseDateString(fromString);
    if (!fromDate) {
      return undefined;
    }

    const toDate = toString ? parseDateString(toString) : undefined;

    return { from: fromDate, to: toDate || undefined };
  });

  const [isAmenitiesPopoverOpen, setIsAmenitiesPopoverOpen] =
    React.useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(false);
  const [isGuestsPopoverOpen, setIsGuestsPopoverOpen] = React.useState(false);

  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>(
    initialFilters?.amenities || []
  );

  const handleClearAmenities = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAmenities([]);
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const amenitiesText =
    selectedAmenities.length > 0
      ? `filtrar por: ${selectedAmenities.length} amenities`
      : "filtrar por:";

  const [guests, setGuests] = React.useState(() => {
    const totalGuests = initialFilters?.guests || 0;
    if (totalGuests > 0) {
      return {
        adults: totalGuests,
        children: 0,
        infants: 0,
      };
    }
    return {
      adults: 0,
      children: 0,
      infants: 0,
    };
  });

  const handleGuestChange = (
    type: keyof typeof guests,
    operation: "increment" | "decrement"
  ) => {
    setGuests((prev) => {
      const newGuests = { ...prev };
      const newCount =
        operation === "increment" ? newGuests[type] + 1 : newGuests[type] - 1;

      // Prevent negative numbers
      newGuests[type] = Math.max(0, newCount);

      // If infants or children are added, ensure there's at least one adult.
      if (
        (type === "infants" || type === "children") &&
        operation === "increment" &&
        newGuests.adults === 0
      ) {
        newGuests.adults = 1;
      }

      // Prevent decrementing adults to 0 if there are children or infants.
      if (
        type === "adults" &&
        operation === "decrement" &&
        newCount < 1 &&
        (newGuests.children > 0 || newGuests.infants > 0)
      ) {
        return prev; // Don't update state
      }

      return newGuests;
    });
  };

  const handleClearGuests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuests({ adults: 0, children: 0, infants: 0 });
  };

  const totalGuests = guests.adults + guests.children;
  const guestsPart =
    totalGuests > 0
      ? `${totalGuests} huésped${totalGuests > 1 ? "es" : ""}`
      : "";
  const infantsPart =
    guests.infants > 0
      ? `${guests.infants} Infante${guests.infants > 1 ? "s" : ""}`
      : "";

  const guestText =
    [guestsPart, infantsPart].filter(Boolean).join(", ") || "Agregar huéspedes";

  const isAnyPopoverOpen =
    isAmenitiesPopoverOpen || isDatePopoverOpen || isGuestsPopoverOpen;

  const [isButtonExpanded, setIsButtonExpanded] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnyPopoverOpen) {
      setIsButtonExpanded(true);
    } else {
      timer = setTimeout(() => {
        setIsButtonExpanded(false);
      }, 175); // A small delay to prevent flickering when switching popovers
    }
    return () => clearTimeout(timer);
  }, [isAnyPopoverOpen]);

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };

  const handleSearch = () => {
    const startDate = date?.from
      ? formatDateToYYYYMMDD(date.from)
      : undefined;
    const endDate = date?.to ? formatDateToYYYYMMDD(date.to) : undefined;

    const filters = {
      guests: totalGuests,
      amenities: selectedAmenities,
      startDate,
      endDate,
    };
    onSearch(filters);
  };

  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);

  const handleClearFilters = () => {
    setDate(undefined);
    setGuests({ adults: 0, children: 0, infants: 0 });
    setSelectedAmenities([]);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden w-full px-4">
        <MobileSearchTrigger onClick={() => setIsMobileSearchOpen(true)} />
      </div>

      {/* Mobile Dialog */}
      <MobileSearchDialog
        isOpen={isMobileSearchOpen}
        onOpenChange={setIsMobileSearchOpen}
        date={date}
        setDate={setDate}
        guests={guests}
        handleGuestChange={handleGuestChange}
        selectedAmenities={selectedAmenities}
        onAmenityToggle={handleAmenityToggle}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Desktop Search Bar */}
      <div className="hidden md:flex bg-white border-gray-200 rounded-full shadow-lg flex-row items-center w-full md:max-w-2xl lg:max-w-[75%] px-1">
        <div className="flex-1 relative">
          <Popover onOpenChange={setIsAmenitiesPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="w-full text-left px-6 py-3 hover:bg-gray-200 rounded-l-full pr-10">
                <p className="font-semibold text-xs text-gray-800">Amenities</p>
                <p className="text-xs pt-0.5 text-gray-500">{amenitiesText}</p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto mt-2 p-0" align="start">
              <AmenitiesPopoverContent
                selectedAmenities={selectedAmenities}
                onAmenityToggle={handleAmenityToggle}
              />
            </PopoverContent>
          </Popover>
          {selectedAmenities.length > 0 && (
            <button
              title="Limpiar amenities"
              onClick={handleClearAmenities}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="h-8 border-l border-gray-200"></div>

        <div className="flex-1 relative ">
          <Popover onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="w-full text-left px-6 py-3 hover:bg-gray-200 rounded-none pr-10">
                <p className="font-semibold text-xs text-gray-800">Cuándo</p>
                <p className="text-xs pt-0.5 text-gray-500">
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd", { locale: es })} -{" "}
                        {format(date.to, "LLL dd", { locale: es })}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span className="text-xs pt-0.5">Agregar fechas</span>
                  )}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto absolute lg:top-45 md:top-39 left-15 mt-2" align="center" centerScreen>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
                fromDate={today}
                disabled={[{ before: today }]}
              />
            </PopoverContent>
          </Popover>
          {date?.from && (
            <button
              title="Limpiar fechas"
              onClick={handleClearDate}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="h-8 border-l border-gray-200"></div>

        <div className="flex-1 relative">
          <Popover onOpenChange={setIsGuestsPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="w-full text-left px-6 py-3 hover:bg-gray-200 rounded-r-full">
                <p className="font-semibold text-xs text-gray-800">Huéspedes</p>
                <p className="text-xs pt-0.5 text-gray-500">{guestText}</p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 absolute  md:-left-26 lg:-left-23 mt-2">
              <GuestsPopoverContent
                guests={guests}
                handleGuestChange={handleGuestChange}
              />
            </PopoverContent>
          </Popover>
          {totalGuests > 0 && (
            <button
              title="Limpiar huéspedes"
              onClick={handleClearGuests}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-2">
          <Button
            title="Buscar"
            onClick={handleSearch}
            className={cn(
              "bg-primary text-white rounded-full hover:bg-primary/80 flex items-center justify-center transition-all duration-600 ease-in-out overflow-hidden",
              isButtonExpanded ? "w-26 h-12" : "w-12 h-12"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span
              className={cn(
                "whitespace-nowrap transition-all ease-in-out duration-300",
                isButtonExpanded
                  ? "max-w-[100px] opacity-100 ml-1 mr-1"
                  : "max-w-0 opacity-0 ml-0"
              )}
            >
              Buscar
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
