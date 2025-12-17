import { fetchExperienceBySlug, fetchExperiences } from '@/lib/data';
import { H1, H2, P } from '@/components/ui/typography';
import { ImageGallery } from '@/components/custom/ImageGallery';
import { Separator } from '@/components/ui/separator';
import { FeaturedExperiences } from '@/components/custom/FeaturedExperiences';
import { notFound } from 'next/navigation';

export default async function ExperienciaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let experience;
  try {
    experience = await fetchExperienceBySlug(slug);
  } catch (error) {
    console.error(`Error fetching experience for slug "${slug}":`, error);
    // Render an error message for the user
    return (
      <div className="container mx-auto py-10 text-center">
        <H1 className="text-3xl font-bold mb-4">Error al cargar la experiencia</H1>
        <P className="text-lg text-red-500">
          No pudimos encontrar los detalles para esta experiencia. Por favor, intenta de nuevo más tarde.
        </P>
      </div>
    );
  }

  if (!experience) {
    notFound();
  }

  // Safely parse what_to_know, ensuring it's always an array
  let whatToKnowItems: string[] = [];
  if (experience.what_to_know) {
    if (Array.isArray(experience.what_to_know)) {
      whatToKnowItems = experience.what_to_know;
    } else if (typeof experience.what_to_know === 'string') {
      try {
        const parsed = JSON.parse(experience.what_to_know);
        if (Array.isArray(parsed)) {
          whatToKnowItems = parsed;
        }
      } catch (error) {
        console.error('Failed to parse what_to_know string:', error);
        // whatToKnowItems remains an empty array, which is the desired fallback
      }
    }
  }

  // Fetch all experiences to find related ones
  const allExperiences = await fetchExperiences();
  const relatedExperiences = allExperiences
    .filter((exp) => exp.slug !== experience.slug)
    .sort(() => 0.5 - Math.random());

  return (
    <div className="container mx-auto px-4 py-12">
      <ImageGallery galleryImages={experience.gallery_images} />
      <div className="mt-8 text-center">
        <H1>{experience.title}</H1>
        <P className="mt-4 text-lg">{experience.long_description}</P>
      </div>



      {whatToKnowItems && whatToKnowItems.length > 0 && (
        <div>
          <Separator className="my-8" />
          <H2>Qué deberías saber</H2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {whatToKnowItems.map((item: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="mr-2 mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-black" />
                <P>{item}</P>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-8" />

      {relatedExperiences.length > 0 && (
        <FeaturedExperiences
          title="Otras experiencias"
          experiences={relatedExperiences}
        />
      )}
    </div>
  );
}
