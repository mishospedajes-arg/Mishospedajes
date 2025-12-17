import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ExperiencesTable from '@/components/custom/ExperiencesTable';
import { fetchAllExperiences } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ExperiencesPage() {
  const experiences = await fetchAllExperiences();

  if (!experiences) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-lg text-red-500">
          No se pudieron cargar las experiencias. Por favor, revisa los logs del servidor para más detalles.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Experiencias</h1>
        <Button asChild>
          <Link href="/admin/experiencias/new">
            Crear Nueva Experiencia
          </Link>
        </Button>
      </div>
      <ExperiencesTable experiences={experiences} />
    </div>
  );
}
