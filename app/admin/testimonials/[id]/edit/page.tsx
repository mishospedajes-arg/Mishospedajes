import { fetchTestimonialById } from "@/lib/data";
import TestimonialForm from "@/components/custom/TestimonialForm";
import { H2, P } from "@/components/ui/typography";
import { notFound } from "next/navigation";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await fetchTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <H2>Editar Testimonio</H2>
        <P className="text-muted-foreground">
          Modifica los detalles del testimonio existente.
        </P>
      </div>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
