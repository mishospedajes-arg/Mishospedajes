"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GuestsPopoverContent } from "@/components/custom/GuestsPopoverContent";
import { DatePickerPopoverContent } from "@/components/custom/DatePickerPopoverContent";
import { Button } from "@/components/ui/button";
import { Booking, Property } from "@/lib/types";
import { H2 } from "@/components/ui/typography";
import { BookingDialog } from "@/components/custom/BookingDialog";

interface BookingCardProps {
  chalet: Property;
  bookings: Booking[];
}

export function BookingCard({ chalet, bookings }: BookingCardProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const handleGuestChange = (
    type: keyof typeof guests,
    operation: "increment" | "decrement"
  ) => {
    setGuests((prev) => {
      const totalGuests = prev.adults + prev.children;
      if (
        operation === "increment" &&
        chalet.guests &&
        totalGuests >= chalet.guests
      ) {
        return prev;
      }

      const newCount =
        operation === "increment" ? prev[type] + 1 : prev[type] - 1;
      if (type === "adults" && newCount < 1) return prev;

      return {
        ...prev,
        [type]: Math.max(0, newCount),
      };
    });
  };

  const handleReserveClick = () => {
    setWarningMessage(null);

    if (!date?.from || !date?.to) {
      setWarningMessage("Por favor, selecciona fechas de check-in y check-out.");
      return;
    }

    // Check for overlap
    const hasOverlap = bookings.some((booking) => {
      // Adjust booking end date to be exclusive for overlap check if needed, 
      // but usually check-out day is available for check-in.
      // Let's assume standard logic: overlap if (StartA < EndB) and (EndA > StartB)

      // We need to be careful with timezones. The dates from date-fns are local.
      // The dates from bookings are strings YYYY-MM-DD.
      // Let's parse booking dates as local dates to match the picker.
      const bStartParts = booking.check_in_date.split('-').map(Number);
      const bEndParts = booking.check_out_date.split('-').map(Number);
      const bStart = new Date(bStartParts[0], bStartParts[1] - 1, bStartParts[2]);
      const bEnd = new Date(bEndParts[0], bEndParts[1] - 1, bEndParts[2]);

      // Check overlap
      // Selected range: date.from to date.to
      // Existing booking: bStart to bEnd

      // Overlap condition: 
      // (SelectedStart < BookingEnd) AND (SelectedEnd > BookingStart)
      return date.from! < bEnd && date.to! > bStart;
    });

    if (hasOverlap) {
      setWarningMessage("Las fechas seleccionadas no están disponibles.");
    } else {
      setIsBookingDialogOpen(true);
    }
  };

  const totalGuests = guests.adults + guests.children;
  const guestText =
    totalGuests > 0
      ? `${totalGuests} huésped${totalGuests > 1 ? "es" : ""}`
      : "Seleccione huéspedes";

  return (
    <div className="sticky top-6 rounded-xl border px-6 pt-6 pb-8 shadow-lg">
      <H2 className="mb-1">Precio</H2>
      <div className="space-y-2 text-xs text-muted-foreground mb-6">
        <div className="flex justify-between">
          <span>Temporada alta</span>
          <span className="font-semibold text-foreground">
            ${chalet.price_high?.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Temporada media</span>
          <span className="font-semibold text-foreground">
            ${chalet.price_mid?.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Temporada baja</span>
          <span className="font-semibold text-foreground">
            ${chalet.price_low?.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <div className="grid grid-cols-2 rounded-t-lg border cursor-pointer">
            <div className="p-2">
              <div className="text-[11px] font-semibold uppercase">CHECK-IN</div>
              <div className="text-xs">
                {date?.from ? format(date.from, "MM/dd/yyyy") : "Add date"}
              </div>
            </div>
            <div className="border-l p-2">
              <div className="text-[11px] font-semibold uppercase">CHECKOUT</div>
              <div className="text-xs">
                {date?.to ? format(date.to, "MM/dd/yyyy") : "Add date"}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <DatePickerPopoverContent
            date={date}
            setDate={setDate}
            onClose={() => setIsDatePickerOpen(false)}
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <div className="rounded-b-lg border border-t-0 p-2 cursor-pointer">
            <div className="text-[11px] font-semibold uppercase">HUESPEDES</div>
            <div className="flex items-center justify-between text-xs">
              <span>{guestText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <GuestsPopoverContent
            guests={guests}
            handleGuestChange={handleGuestChange}
          />
        </PopoverContent>
      </Popover>

      <Button className="w-full mt-4" onClick={handleReserveClick}>
        Reservar
      </Button>

      {warningMessage && (
        <div className="mt-2 text-sm text-red-500 text-center font-medium">
          {warningMessage}
        </div>
      )}

      <BookingDialog
        chalet={chalet}
        selectedDates={date}
        guestCount={guests}
        open={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
      />
    </div>
  );
}
