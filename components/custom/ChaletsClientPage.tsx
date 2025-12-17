"use client";

"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/custom/SearchBar";
import ChaletGrid from '@/components/custom/ChaletGrid';
import { Property } from '@/lib/types';

interface ChaletsClientPageProps {
  initialProperties: Property[];
}

const ChaletsClientPage = ({ initialProperties }: ChaletsClientPageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilters = useMemo(() => {
    const guests = searchParams.get("guests");
    const amenities = searchParams.get("amenities");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    return {
      guests: guests ? parseInt(guests, 10) : 0,
      amenities: amenities ? amenities.split(",") : [],
      dateRange: {
        from: startDate || undefined,
        to: endDate || undefined,
      },
    };
  }, [searchParams]);

  const handleSearch = (filters: {
    guests: number;
    amenities: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();

    if (filters.guests > 0) {
      params.append('guests', filters.guests.toString());
    }
    if (filters.amenities.length > 0) {
      params.append('amenities', filters.amenities.join(','));
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    router.push(`/chalets?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[250px] flex items-center justify-center mb-8">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/Banner-search.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 w-full flex justify-center px-4">
          <SearchBar onSearch={handleSearch} initialFilters={initialFilters} />
        </div>
      </div>

      <div className="mx-auto px-8 pb-8 pt-4">
        {initialProperties.length > 0 ? (
          <ChaletGrid initialProperties={initialProperties} totalCount={initialProperties.length} />
        ) : (
          <p className="text-center text-gray-500">
            No se encontraron chalets que coincidan con su búsqueda.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChaletsClientPage;
