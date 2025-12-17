import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PropertyCard } from "./PropertyCard";
import { type Property } from "@/lib/types";
import { H2 } from "@/components/ui/typography";

interface FeaturedPropertiesProps {
  title?: string;
  properties: Property[];
}

export function FeaturedProperties({ title, properties }: FeaturedPropertiesProps) {
  if (!properties || properties.length === 0) {
    return null; // No renderizar nada si no hay propiedades
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6">
          {title && <H2 className="text-2xl font-bold">{title}</H2>}
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent className="-ml-4">
          {properties.map((property) => (
            <CarouselItem key={property.id} className="pl-4 md:basis-1/3 lg:basis-1/4">
              <PropertyCard property={property} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
