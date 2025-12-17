"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Item, ItemContent, ItemMedia } from "../ui/item";
import { Bath, BedDouble, CircleDollarSign, Star, Users } from "lucide-react";
import { Property } from "@/lib/types";
import { H4, Muted, Small } from "@/components/ui/typography";

import { getCategoryColor } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  disableLink?: boolean;
}

export function PropertyCard({ property, disableLink = false }: PropertyCardProps) {
  const [isPriceVisible, setIsPriceVisible] = useState(false);

  const placeholderImage = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop";
  const imageUrl = property.main_image_url || placeholderImage;

  const CardContent = (
    <Item className="border-none shadow-none p-0 flex flex-col flex-grow items-start h-full w-full">
      <ItemMedia
        className="relative rounded-xl overflow-hidden w-full aspect-square"
        onMouseEnter={() => setIsPriceVisible(true)}
        onMouseLeave={() => setIsPriceVisible(false)}
      >
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-xl object-cover"
        />
        <div
          className="absolute bottom-2 left-2 z-10 lg:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPriceVisible(true);
          }}
        >
          <CircleDollarSign className="w-14 h-14 m-1 md:w-8 md:h-8  text-white bg-black/50 rounded-full p-1" />
        </div>
        <div
          className={`absolute inset-0 bg-black/60 p-4 text-white transition-opacity duration-500 z-20 ${isPriceVisible ? 'opacity-100 lg:pointer-events-none' : 'opacity-0 pointer-events-none'
            }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPriceVisible(false);
          }}
        >
          <div className="text-center font-light pt-[20%] md:pt-[10%]">
            <H4 className="text-lg leading-tight font-light pb-3 px-4">Precios por Temporada</H4>
            <ul className="mt-2 space-y-1.5">
              <li>Alta: ${property.price_high?.toLocaleString() ?? 'N/A'}</li>
              <li>Media: ${property.price_mid?.toLocaleString() ?? 'N/A'}</li>
              <li>Baja: ${property.price_low?.toLocaleString() ?? 'N/A'}</li>
            </ul>
          </div>
        </div>
      </ItemMedia>
      <ItemContent className="px-1 pt-0 -mt-2 flex flex-col flex-grow">
        <H4 className="text-lg truncate">{property.name}</H4>
        <div className="flex items-center justify-between pt-0">
          <Muted className="flex items-center gap-x-2 gap-y-1 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {property.guests ?? 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              {property.bathrooms ?? 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4" />
              {property.bedrooms ?? 'N/A'}
            </span>

          </Muted>
          <div className="flex items-center gap-1 pr-1 pl-3 shrink-0">
            <Star className={`w-4 h-4 ${getCategoryColor(property.category)}`} />
            <Small className="font-semibold">
              {property.rating ? parseFloat(String(property.rating)).toFixed(2) : 'N/A'}
            </Small>
          </div>
        </div>
      </ItemContent>
    </Item >
  );

  if (disableLink) {
    return <div className="flex flex-col h-full w-full">{CardContent}</div>;
  }

  return (
    <Link href={`/chalets/${property.slug}`} className="flex flex-col h-full w-full">
      {CardContent}
    </Link>
  );
}
