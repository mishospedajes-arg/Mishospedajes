import TestimonialForm from "@/components/custom/TestimonialForm";
import { H2, P } from "@/components/ui/typography";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-8">
      <div>
        <H2>Crear Nuevo Testimonio</H2>
        <P className="text-muted-foreground">
          Añade un nuevo testimonio para mostrar en la página de inicio.
        </P>
      </div>
      <TestimonialForm />
    </div>
  );
}
