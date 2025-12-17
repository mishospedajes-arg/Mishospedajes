import { fetchExperienceById } from '@/lib/data';
import { ExperienceForm } from '@/components/custom/ExperienceForm';
import { notFound } from 'next/navigation';

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await fetchExperienceById(id);

  if (!experience) {
    notFound();
  }

  // The ExperienceForm expects `what_to_know` as a string, but the DB stores it as a JSON array.
  // We need to stringify it before passing it to the form.
  const transformedExperience = {
    ...experience,
    what_to_know: (experience.what_to_know && experience.what_to_know.length > 0)
      ? JSON.stringify(experience.what_to_know)
      : "",
    // The form also expects images as an array of objects with a `url` property.
    images: experience.gallery_images.map(img => ({ url: img.url })),
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Editar Experiencia</h1>
      <ExperienceForm defaultValues={transformedExperience} />
    </div>
  );
}
