"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";

import { AmenitiesPopoverContent } from "./AmenitiesPopoverContent";
import { GuestsPopoverContent } from "./GuestsPopoverContent";

interface MobileSearchDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    guests: {
        adults: number;
        children: number;
        infants: number;
    };
    handleGuestChange: (
        type: "adults" | "children" | "infants",
        operation: "increment" | "decrement"
    ) => void;
    selectedAmenities: string[];
    onAmenityToggle: (amenityId: string) => void;
    onSearch: () => void;
    onClearFilters: () => void;
}

export function MobileSearchDialog({
    isOpen,
    onOpenChange,
    date,
    setDate,
    guests,
    handleGuestChange,
    selectedAmenities,
    onAmenityToggle,
    onSearch,
    onClearFilters,
}: MobileSearchDialogProps) {
    const totalGuests = guests.adults + guests.children;
    const guestsPart =
        totalGuests > 0
            ? `${totalGuests} huésped${totalGuests > 1 ? "es" : ""}`
            : "";
    const infantsPart =
        guests.infants > 0
            ? `${guests.infants} Infante${guests.infants > 1 ? "s" : ""}`
            : "";

    const guestsText =
        [guestsPart, infantsPart].filter(Boolean).join(", ") || "Agregar huéspedes";

    const dateText = date?.from
        ? date.to
            ? `${format(date.from, "LLL dd", { locale: es })} - ${format(
                date.to,
                "LLL dd",
                { locale: es }
            )}`
            : format(date.from, "LLL dd, y", { locale: es })
        : "Agregar fechas";

    const amenitiesText =
        selectedAmenities.length > 0
            ? `${selectedAmenities.length} seleccionados`
            : "Agregar amenities";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="w-full h-[100dvh] max-w-full p-0 flex flex-col gap-0 sm:rounded-none border-0">
                <DialogHeader className="px-4 py-4 border-b flex flex-row items-center justify-between space-y-0">
                    <DialogClose className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Cerrar</span>
                    </DialogClose>
                    {/* Empty title for accessibility if needed, or just hidden */}
                    <DialogTitle className="hidden">Búsqueda</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-4 pb-24">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="amenities">
                                    <AccordionTrigger className="text-xl font-semibold py-4">
                                        <div className="flex flex-col items-start text-left">
                                            <span>Amenities</span>
                                            <span className="text-sm font-normal text-gray-500 mt-1">
                                                {amenitiesText}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pt-2">
                                            {/* Override the fixed width/height of the inner component if possible via class or wrapper */}
                                            <div className="[&>div]:w-full [&>div>div]:h-auto [&>div>div]:w-full">
                                                <AmenitiesPopoverContent
                                                    selectedAmenities={selectedAmenities}
                                                    onAmenityToggle={onAmenityToggle}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="when">
                                    <AccordionTrigger className="text-xl font-semibold py-4">
                                        <div className="flex flex-col items-start text-left">
                                            <span>Cuándo</span>
                                            <span className="text-sm font-normal text-gray-500 mt-1">
                                                {dateText}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex justify-center pt-2">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={setDate}
                                                numberOfMonths={1}
                                                locale={es}
                                                className="rounded-md border"
                                                fromDate={today}
                                                disabled={[{ before: today }]}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="guests">
                                    <AccordionTrigger className="text-xl font-semibold py-4">
                                        <div className="flex flex-col items-start text-left">
                                            <span>Huéspedes</span>
                                            <span className="text-sm font-normal text-gray-500 mt-1">
                                                {guestsText}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pt-2">
                                            <GuestsPopoverContent
                                                guests={guests}
                                                handleGuestChange={handleGuestChange}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </ScrollArea>
                </div>

                <div className="border-t p-4 bg-white flex items-center justify-between mt-auto">
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="text-sm font-semibold underline hover:bg-transparent px-0"
                    >
                        Borrar filtros
                    </Button>

                    <Button
                        onClick={() => {
                            onSearch();
                            onOpenChange(false);
                        }}
                        className="bg-primary hover:bg-primary/80 text-white rounded-lg px-8 py-6 flex items-center gap-2 text-lg"
                    >
                        <Search className="h-5 w-5" />
                        Buscar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
