"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Testimonial } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { P } from "@/components/ui/typography";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const placeholderImage = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop";
  const imageUrl = testimonial.author_image_url || placeholderImage;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Image
          src={imageUrl}
          alt={testimonial.author_name}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col">
          <CardTitle className="text-lg">{testimonial.author_name}</CardTitle>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < testimonial.rating
                    ? "fill-primary text-primary"
                    : "fill-muted stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <P className="text-muted-foreground italic">
          &ldquo;{testimonial.testimonial_text}&rdquo;
        </P>
      </CardContent>
    </Card>
  );
}
