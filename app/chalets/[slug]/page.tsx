import { fetchPropertyBySlug, fetchProperties, getChaletBookings } from "@/lib/data";
import { getCategoryColor } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { AvailabilityCalendar } from "@/components/custom/AvailabilityCalendar";
import { ImageGallery } from "@/components/custom/ImageGallery";
import { Separator } from "@/components/ui/separator";
import { H1, H2, P } from "@/components/ui/typography";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GoogleMapsEmbed } from "@/components/custom/GoogleMapsEmbed";
import { ComparisonCarousel } from "@/components/custom/ComparisonCarousel";
import { BookingCard } from "@/components/custom/BookingCard";
import { allAmenities } from "@/lib/amenities-data";

export async function generateStaticParams() {
  const properties = await fetchProperties();
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export const revalidate = 60;

interface ChaletDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ChaletDetailPage({ params }: ChaletDetailPageProps) {
  const { slug } = await params;
  const chalet = await fetchPropertyBySlug(slug);
  const allProperties = await fetchProperties();

  if (!chalet) {
    notFound();
  }

  // Excluir el chalet actual de la lista de comparación
  const propertiesForComparison = allProperties.filter(p => p.id !== chalet.id);
  const bookings = await getChaletBookings(chalet.id.toString());

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Galería de Imágenes */}
      <section className="mb-8">
        <ImageGallery
          galleryImages={chalet.gallery_images || []}
          blueprintImages={chalet.blueprint_images || []}
          videoUrl={chalet.video_url}
        />
      </section>

      {/* Información Principal y Reserva */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Columna Derecha: Tarjeta de Reserva (aparece primero en móvil) */}
        <div className="md:col-span-1 md:order-2">
          <BookingCard chalet={chalet} bookings={bookings} />
        </div>

        {/* Columna Izquierda: Información (aparece segundo en móvil) */}
        <div className="md:col-span-2 md:order-1">
          <div className="flex space-x-4">
            <H1 className="text-3xl font-bold">{chalet.name}</H1>
            <div className="mt-2 lg:mt-4 flex">
              <Star className={`h-5 w-5 ${getCategoryColor(chalet.category)}`} />
              <span className="ml-1 font-semibold">{chalet.rating ? Number(chalet.rating).toFixed(2) : 'N/A'}</span>
            </div>
          </div>
          <div className="mt-2 flex space-x-4 text-sm text-muted-foreground">
            <span>{chalet.guests} huéspedes</span>
            <span>·</span>
            <span>{chalet.bathrooms} baños</span>
            <span>·</span>
            <span>{chalet.bedrooms} dormitorios</span>
          </div>
          {chalet.description && (
            <>
              <Separator className="my-6" />
              <P>{chalet.description}</P>
            </>
          )}

          <Separator className="my-8" />

          {/* Qué ofrece este chalet */}
          <section>
            <H2>Qué ofrece este chalet</H2>
            <div className="mt-6 space-y-8 pb-10">
              {["Premium", "Generales", "Exteriores"].map((category) => {
                const categoryAmenities = (chalet.amenities || []).filter((amenity: { name: string; category?: string }) => {
                  const details = allAmenities.find((a) => a.name === amenity.name);
                  // Prefer the category from the static file to ensure correct grouping
                  return (details?.category || amenity.category) === category;
                });

                if (categoryAmenities.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="mb-4 text-lg font-semibold">{category}</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {categoryAmenities.map((amenity: { id: number; name: string; description?: string }) => {
                        const details = allAmenities.find((a) => a.name === amenity.name);
                        if (!details) return null;
                        const Icon = details.icon;
                        return (
                          <div
                            key={`amenity-item-${amenity.id}`}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Icon className="h-5 w-5" />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help decoration-gray-400 underline-offset-4">
                                    {amenity.name}
                                  </span>
                                </TooltipTrigger>
                                {amenity.description && (
                                  <TooltipContent>
                                    <p className="max-w-xs">{amenity.description}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div >
          </section >

          {chalet.optional_services && (
            <>
              <Separator className="my-8" />
              <section>
                <H2>Servicios opcionales</H2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <P className="whitespace-pre-line">{chalet.optional_services}</P>
                </div>
              </section>
            </>
          )}

          {/* Normas del chalet */}
          {chalet.rules && chalet.rules.length > 0 && (
            <>
              <Separator className="my-8" />
              <section>
                <H2>Normas del chalet</H2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  {chalet.rules.map((rule: { id?: number; rule_text: string }, index) => (
                    <P key={rule.id ?? index}>{rule.rule_text}</P>
                  ))}
                </div>
              </section>
            </>
          )}

          <Separator className="my-8" />

          {/* Disponibilidad */}
          <AvailabilityCalendar bookings={bookings} />

          <Separator className="my-8" />

          {/* Dónde vas a hospedarte */}
          <section>
            <div className="flex items-center justify-between">
              <H2>Dónde vas a hospedarte</H2>
              <Link href={`/mapa?chaletId=${chalet.id}`}>
                <Button variant="outline">Ver en mapa</Button>
              </Link>
            </div>
            <div className="mt-4 h-[400px] w-full rounded-lg bg-slate-200">
              {chalet.latitude && chalet.longitude ? (
                <GoogleMapsEmbed latitude={chalet.latitude} longitude={chalet.longitude} />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-200 rounded-lg">
                  <p className="text-slate-500">La ubicación no está disponible.</p>
                </div>
              )}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Comparar con otros Chalets */}
          <ComparisonCarousel
            mainChalet={chalet}
            propertiesForComparison={propertiesForComparison}
          />
        </div>
      </section>
    </main>
  );
}
