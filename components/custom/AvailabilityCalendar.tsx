"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Booking } from "@/lib/types";
import { DateRange } from "react-day-picker";

import { es } from "date-fns/locale";

interface AvailabilityCalendarProps {
  bookings: Booking[];
  className?: string;
}

export function AvailabilityCalendar({ bookings, className }: AvailabilityCalendarProps) {
  const [month, setMonth] = React.useState<Date>(new Date());

  // Normalizar la fecha actual a las 00:00:00 para comparaciones consistentes
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Log para depuración de fechas en el frontend
  React.useEffect(() => {
    bookings.forEach(booking => {
      console.log(`[FRONTEND] Booking recibido: check_in_date=${booking.check_in_date}, check_out_date=${booking.check_out_date}`);
    });
  }, [bookings]);

  // Calcular los días "ocupados" (booked) que son relevantes para el usuario (hoy o futuro).
  // Filtramos reservas pasadas y recortamos las que empezaron antes de hoy.
  const bookedDays: DateRange[] = bookings
    .map(booking => {
      // Parseamos el string 'YYYY-MM-DD' manualmente
      const fromParts = booking.check_in_date.split('-').map(Number);
      const toParts = booking.check_out_date.split('-').map(Number);

      const from = new Date(fromParts[0], fromParts[1] - 1, fromParts[2]);
      const to = new Date(toParts[0], toParts[1] - 1, toParts[2]);

      // Restamos un día al check_out_date porque el check-out es el primer día disponible
      to.setDate(to.getDate() - 1);

      return { from, to };
    })
    .filter(range => range.to >= today) // Solo nos interesan reservas que terminan hoy o después
    .map(range => {
      // Si la reserva empezó antes de hoy, solo mostramos como "ocupado" desde hoy
      if (range.from < today) {
        return { from: today, to: range.to };
      }
      return range;
    });

  // Días deshabilitados: pasados + ocupados futuros
  // El matcher { before: today } deshabilita todo el pasado.
  // bookedDays deshabilita las reservas futuras.
  const disabledDays = [...bookedDays, { before: today }];

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Disponibilidad</h2>
      <div className="flex align-center justify-center">
        <Calendar
          locale={es}
          mode="range"
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={2}
          fromDate={today} // No permite navegar a meses anteriores
          disabled={disabledDays} // Deshabilita selección de pasados y ocupados
          modifiers={{ booked: bookedDays }} // Solo aplica estilo de "ocupado" a los rangos futuros
          modifiersStyles={{ booked: { textDecoration: "line-through" } }} // Estilo de tachado
          className="p-0 [&_td]:pointer-events-none"
        />
      </div>
    </div>
  );
}
