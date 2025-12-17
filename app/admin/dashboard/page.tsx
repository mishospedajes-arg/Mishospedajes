import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDashboardMetrics, fetchLatestBookings } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics();
  const latestBookings = await fetchLatestBookings();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consultas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Nuevas consultas esperando confirmación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Propiedades Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProperties}</div>
            <p className="text-xs text-muted-foreground">
              Propiedades visibles en la web
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Consultas (Hoy)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.newBookingsToday}</div>
            <p className="text-xs text-muted-foreground">
              Consultas recibidas en las últimas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.client_name}</TableCell>
                    <TableCell>{booking.property_name}</TableCell>
                    <TableCell>{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'pending' ? 'destructive' : 'outline'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
