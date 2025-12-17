"use client";

"use client";

import * as React from "react";
import { format, differenceInDays, parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { H3, Small } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

interface DatePickerPopoverContentProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  onClose: () => void;
}

export const DatePickerPopoverContent: React.FC<DatePickerPopoverContentProps> = ({
  date,
  setDate,
  onClose,
}) => {
  const [fromValue, setFromValue] = React.useState<string>(
    date?.from ? format(date.from, "MM/dd/yyyy") : ""
  );
  const [toValue, setToValue] = React.useState<string>(
    date?.to ? format(date.to, "MM/dd/yyyy") : ""
  );

  React.useEffect(() => {
    setFromValue(date?.from ? format(date.from, "MM/dd/yyyy") : "");
    setToValue(date?.to ? format(date.to, "MM/dd/yyyy") : "");
  }, [date]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromValue(e.target.value);
    const parsedDate = parse(e.target.value, "MM/dd/yyyy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      setDate({ from: parsedDate, to: date?.to });
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToValue(e.target.value);
    const parsedDate = parse(e.target.value, "MM/dd/yyyy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      setDate({ from: date?.from, to: parsedDate });
    }
  };

  const nights = date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <H3>{nights > 0 ? `${nights} noches` : "Elegir fecha"}</H3>
          <Small className="text-muted-foreground">
            {date?.from && date?.to
              ? `${format(date.from, "MMM d, yyyy")} - ${format(
                date.to,
                "MMM d, yyyy"
              )}`
              : "2 días"}
          </Small>
        </div>
        <div className="flex space-x-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="checkin" className="text-xs font-medium">CHECK-IN</label>
            <div className="relative">
              <Input
                id="checkin"
                value={fromValue}
                onChange={handleFromChange}
                placeholder="11/10/2025"
                className="h-9 py-1 pr-8 w-32"
              />
              {fromValue && <X className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer" onClick={() => setDate({ from: undefined, to: date?.to })} />}
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="checkout" className="text-xs font-medium">CHECKOUT</label>
            <div className="relative">
              <Input
                id="checkout"
                value={toValue}
                onChange={handleToChange}
                placeholder="11/13/2025"
                className="h-9 py-1 pr-8 w-32"
              />
              {toValue && <X className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer" onClick={() => setDate({ from: date?.from, to: undefined })} />}
            </div>
          </div>
        </div>
      </div>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        className="p-1"
      />
      <div className="flex justify-end items-center mt-4 space-x-2">
        <Button variant="link" onClick={() => setDate(undefined)}>
          Limpiar fechas
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};
