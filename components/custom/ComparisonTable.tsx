"use client";

import { useState } from 'react';
import { Property } from '@/lib/types';
import { allAmenities } from '@/lib/amenities-data';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ComparisonTableProps {
  mainChalet: Property;
  comparisonChalet: Property;
}

type Characteristic = {
  name: string;
  getValue: (chalet: Property) => string | number;
  isAmenity?: undefined;
  amenityId?: undefined;
};

type AmenityFeature = {
  name: string;
  isAmenity: true;
  getValue?: undefined;
};

type ComparisonItem = Characteristic | AmenityFeature;


export function ComparisonTable({ mainChalet, comparisonChalet }: ComparisonTableProps) {
  const [showAll, setShowAll] = useState(false);

  const characteristics = [
    { name: 'Precio Temporada Baja', getValue: (chalet: Property) => chalet.price_low != null ? `$${chalet.price_low.toLocaleString('es-AR')}` : 'Consultar' },
    { name: 'Precio Temporada Media', getValue: (chalet: Property) => chalet.price_mid != null ? `$${chalet.price_mid.toLocaleString('es-AR')}` : 'Consultar' },
    { name: 'Precio Temporada Alta', getValue: (chalet: Property) => chalet.price_high != null ? `$${chalet.price_high.toLocaleString('es-AR')}` : 'Consultar' },
    { name: 'Huéspedes', getValue: (chalet: Property) => chalet.guests ?? 'N/A' },
    { name: 'Dormitorios', getValue: (chalet: Property) => chalet.bedrooms ?? 'N/A' },
    { name: 'Camas', getValue: (chalet: Property) => chalet.beds ?? 'N/A' },
  ];

  const amenityFeatures: AmenityFeature[] = allAmenities.map(amenity => ({
    name: amenity.name,
    isAmenity: true,
  }));

  const combinedAmenities: ComparisonItem[] = [...characteristics, ...amenityFeatures];

  const visibleAmenities = showAll ? combinedAmenities : combinedAmenities.slice(0, 10);

  const renderValue = (chalet: Property, amenity: ComparisonItem) => {
    if (amenity.isAmenity) {
      const hasAmenity = chalet.amenities?.some(a => a.name === amenity.name);
      return hasAmenity ? 
        <Check className="mx-auto h-5 w-5 text-green-500" /> : 
        <X className="mx-auto h-5 w-5 text-red-500" />;
    }
    return amenity.getValue(chalet);
  };

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm max-w-[600px] border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b p-2">Característica</th>
              <th className="border-b p-2 text-center font-bold">{mainChalet.name}</th>
              <th className="border-b p-2 text-center">{comparisonChalet.name}</th>
            </tr>
          </thead>
          <tbody>
            {visibleAmenities.map((amenity, index) => (
              <tr key={index}>
                <td className="border-b p-2">{amenity.name}</td>
                <td className="border-b p-2 text-center font-bold">
                  {renderValue(mainChalet, amenity)}
                </td>
                <td className="border-b p-2 text-center">
                  {renderValue(comparisonChalet, amenity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && combinedAmenities.length > 10 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            Mostrar todos
          </Button>
        </div>
      )}
    </div>
  );
}
