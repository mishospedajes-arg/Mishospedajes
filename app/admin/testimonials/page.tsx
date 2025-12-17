import { fetchAllTestimonials } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import TestimonialsTable from '@/components/custom/TestimonialsTable';

export default async function TestimonialsPage() {
  const testimonials = await fetchAllTestimonials();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Testimonios</h1>
        <Button asChild>
          <Link href="/admin/testimonials/new">Crear Nuevo Testimonio</Link>
        </Button>
      </div>
      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
