"use client"

import { ColumnDef, Row, Table } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Booking } from "@/lib/types"


interface BookingTableMeta {
  onUpdate: () => void;
}

const ActionsCell = ({ row, table }: { row: Row<Booking>, table: Table<Booking> }) => {
  const { toast } = useToast();
  const booking = row.original as Booking;

  const updateBookingStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/consultas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      toast({
        title: "Éxito",
        description: "El estado de la consulta ha sido actualizado.",
      });
      (table.options.meta as BookingTableMeta)?.onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la consulta.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      const response = await fetch(`/api/consultas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      toast({
        title: "Éxito",
        description: "La consulta ha sido eliminada.",
      });
      (table.options.meta as BookingTableMeta)?.onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la consulta.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking.id.toString())}>
            Copiar ID de consulta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {booking.status === 'pending' && (
            <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
              Marcar como confirmada
            </DropdownMenuItem>
          )}
          {booking.status !== 'cancelled' && (
            <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
              Cancelar consulta
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-600">
              Eliminar consulta
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente la consulta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteBooking(booking.id)}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


export const columns: ColumnDef<Booking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "client_name",
    header: "Cliente",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.client_name}</div>
        <div className="text-sm text-muted-foreground">{row.original.client_phone}</div>
      </div>
    ),
  },
  {
    accessorKey: "property_name",
    header: "Propiedad",
  },
  {
    accessorKey: "dates",
    header: "Fechas",
    cell: ({ row }) => (
      <span>
        {new Date(row.original.check_in_date + 'T00:00:00').toLocaleDateString()} - {new Date(row.original.check_out_date + 'T00:00:00').toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "guests",
    header: "Huéspedes",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === 'pending' ? 'destructive' : status === 'confirmed' ? 'default' : 'outline'
      
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Consulta
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
  },
]
