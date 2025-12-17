"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-custom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Property } from "@/lib/types";
import { P, Small } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface BookingDialogProps {
  chalet: Property;
  selectedDates: DateRange | undefined;
  guestCount: { adults: number; children: number; infants: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({
  chalet,
  selectedDates,
  guestCount,
  open,
  onOpenChange,
}: BookingDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { toast } = useToast();

  useEffect(() => {
    if (isConfirmationOpen) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(timer);
            const formattedDates = selectedDates?.from
              ? selectedDates.to
                ? `${format(selectedDates.from, "dd/MM/yyyy")} - ${format(
                  selectedDates.to,
                  "dd/MM/yyyy"
                )}`
                : format(selectedDates.from, "dd/MM/yyyy")
              : "Fechas no seleccionadas";

            const message = `
¡Hola! Quisiera solicitar una reserva para el chalet *${chalet.name}*.
*Fechas:* ${formattedDates}
*Huéspedes:* ${guestCount.adults} Adultos, ${guestCount.children} Niños, ${guestCount.infants
              } Infantes
*Mi nombre es:* ${name}
*Mi teléfono es:* ${phone}
            `.trim();

            const whatsappUrl = `https://wa.me/5491132750873?text=${encodeURIComponent(
              message
            )}`;
            window.open(whatsappUrl, "_blank");
            setIsConfirmationOpen(false);
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isConfirmationOpen, chalet, selectedDates, guestCount, name, phone]);

  const handleSend = async () => {
    if (!name || !phone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa tu nombre y teléfono.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: chalet.id,
          check_in_date: selectedDates?.from,
          check_out_date: selectedDates?.to,
          guests: guestCount.adults + guestCount.children,
          client_name: name,
          client_phone: phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la consulta');
      }

      toast({
        title: "Consulta enviada",
        description: "Tu solicitud ha sido guardada.",
      });

      onOpenChange(false);
      setCountdown(3);
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu consulta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="bg-black/80"
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Solicitar Reserva</DialogTitle>
            <DialogDescription className="sr-only">
              Este formulario se enviará a través de WhatsApp para completar la
              reserva.
            </DialogDescription>
          </DialogHeader>
          <div className=" space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={chalet.gallery_images?.[0]?.url || "https://images.unsplash.com/photo-1588557132643-ff9f8a442332?q=80&w=2574&auto=format&fit=crop"}
                  alt={chalet.name}
                  fill
                  className="object-cover"
                />
              </div>
              <P className="font-semibold">{chalet.name}</P>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <P className="font-semibold !mt-0">Fechas:</P>
                <P className="text-right !mt-0">
                  {selectedDates?.from ? (
                    selectedDates.to ? (
                      `${format(selectedDates.from, "d MMM")} - ${format(
                        selectedDates.to,
                        "d MMM"
                      )}`
                    ) : (
                      format(selectedDates.from, "d MMM")
                    )
                  ) : (
                    "Seleccione fechas"
                  )}
                </P>
              </div>
              <div className="flex items-center justify-between">
                <P className="font-semibold !mt-0">Personas:</P>
                <P className="text-right !mt-0">
                  {guestCount.adults} Adultos
                  {guestCount.children > 0 && `, ${guestCount.children} Niños`}
                </P>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label htmlFor="name">
                <Small>Nombre</Small>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">
                <Small>Teléfono</Small>
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Tu número de teléfono"
              />
            </div>
            <Small className="text-center block text-gray-500">
              El formulario se enviará a través de WhatsApp para completar la
              reserva.
            </Small>
          </div>
          <Button onClick={handleSend} className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent
          overlayClassName="bg-black/80"
          className="sm:max-w-[425px] text-center"
        >
          <DialogHeader>
            <DialogTitle>¡Gracias por tu consulta!</DialogTitle>
            <DialogDescription>
              Serás redirigido a WhatsApp en {countdown} segundos para completar
              tu reserva.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
