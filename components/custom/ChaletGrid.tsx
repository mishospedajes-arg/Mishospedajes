'use client';

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Property } from '@/lib/types';
import { PropertyCard } from './PropertyCard';

import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { H2 } from '@/components/ui/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChaletGridProps {
  initialProperties: Property[];
  totalCount: number;
}

const ChaletGrid = ({ initialProperties, totalCount }: ChaletGridProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortedProperties, setSortedProperties] = useState<Property[]>([]);
  const [sortOrder, setSortOrder] = useState('rating-desc'); // Default sort
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 12;

  // Effect to sort properties when sortOrder changes
  useEffect(() => {
    const newSortedProperties = [...initialProperties].sort((a, b) => {
      switch (sortOrder) {
        case 'rating-desc':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'rating-asc':
          return (a.rating ?? 0) - (b.rating ?? 0);
        case 'price-desc':
          return (b.price_low ?? 0) - (a.price_low ?? 0);
        case 'price-asc':
          return (a.price_low ?? 0) - (b.price_low ?? 0);
        default:
          return 0;
      }
    });
    setSortedProperties(newSortedProperties);
  }, [sortOrder, initialProperties]);

  // Effect for initial load and when sorted properties are updated
  useEffect(() => {
    if (sortedProperties.length > 0) {
      setIsLoading(true);
      // Simulate loading to show skeleton when sorting changes
      setTimeout(() => {
        setProperties(sortedProperties.slice(0, itemsPerPage));
        setIsLoading(false);
        setHasMore(sortedProperties.length > itemsPerPage);
      }, 500);
    }
  }, [sortedProperties]);

  const fetchMoreData = useCallback(() => {
    if (properties.length >= sortedProperties.length) {
      setHasMore(false);
      return;
    }

    // Simula una llamada a la API para cargar más propiedades
    setTimeout(() => {
      const newProperties = sortedProperties.slice(
        properties.length,
        properties.length + itemsPerPage
      );
      setProperties((prevProperties) => [...prevProperties, ...newProperties]);
    }, 1000);
  }, [properties.length, sortedProperties]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreData();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, fetchMoreData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <H2 className='text-lg'>{`${totalCount} Chalet${totalCount !== 1 ? 's' : ''}`}</H2>
        <Select onValueChange={setSortOrder} defaultValue={sortOrder}>
          <SelectTrigger className="text-xs w-[180px]">
            <SelectValue placeholder="Ordenar por:" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="text-xs" value="rating-desc">Mayor Calificacion</SelectItem>
            <SelectItem className="text-xs" value="rating-asc">Menor Calificacion</SelectItem>
            <SelectItem className="text-xs" value="price-desc">Mayor Precio</SelectItem>
            <SelectItem className="text-xs" value="price-asc">Menor Precio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-5">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))
            }
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-5">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            <div ref={loadMoreRef} className="flex justify-center items-center py-8">
              {hasMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <PropertyCardSkeleton key={index} />
                  ))}
                </div>
              )}
            </div>
          </>
        )
      }
    </div >
  );
};

export default ChaletGrid;
