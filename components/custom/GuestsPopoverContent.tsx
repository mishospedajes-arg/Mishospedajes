"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface Guests {
  adults: number;
  children: number;
  infants: number;
}

interface GuestsPopoverContentProps {
  guests: Guests;
  handleGuestChange: (
    type: keyof Guests,
    operation: "increment" | "decrement"
  ) => void;
}

export const GuestsPopoverContent: React.FC<GuestsPopoverContentProps> = ({
  guests,
  handleGuestChange,
}) => {
  return (
    <div className="grid gap-4 pl-4 pr-3 py-4 text-sm ">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Adultos</p>
            <p className="text-sm text-gray-500">12 años o más</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("adults", "decrement")}
              disabled={guests.adults <= 1}
            >
              -
            </Button>
            <span>{guests.adults}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("adults", "increment")}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs ">
          <div>
            <p className="font-semibold">Niños</p>
            <p className="text-sm text-gray-500">2 a 12 años</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("children", "decrement")}
              disabled={guests.children <= 0}
            >
              -
            </Button>
            <span>{guests.children}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("children", "increment")}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Infantes</p>
            <p className="text-sm text-gray-500">0 a 2 años</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("infants", "decrement")}
              disabled={guests.infants <= 0}
            >
              -
            </Button>
            <span>{guests.infants}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleGuestChange("infants", "increment")}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
