"use client"

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Booking } from '@/lib/types';

function ConsultasContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    const response = await fetch(`/api/consultas?${params.toString()}`);
    const data = await response.json();
    
    setBookings(data.bookings || []);
    setTotalPages(data.totalPages || 0);
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdate = () => {
    fetchBookings();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Consultas</h1>
      <DataTable columns={columns} data={bookings} totalPages={totalPages} isLoading={isLoading} onUpdate={handleUpdate} />
    </div>
  );
}

export default function ConsultasClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultasContent />
    </Suspense>
  );
}
