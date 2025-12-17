"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Testimonial } from "@/lib/types";
import { TestimonialCard } from "./TestimonialCard";
import { H2, P } from "../ui/typography";

interface FeaturedTestimonialsProps {
  testimonials: Testimonial[];
}

export function FeaturedTestimonials({
  testimonials,
}: FeaturedTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <H2>Lo que dicen nuestros huéspedes</H2>
            <P className="text-muted-foreground">
              Experiencias reales de quienes nos eligieron.
            </P>
          </div>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem
              key={testimonial.id}
              className="p-2 md:basis-1/2 lg:basis-1/3"
            >
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>

      </Carousel>
    </section>
  );
}
