import Image from 'next/image';
import Link from 'next/link';
import { Experience } from '@/lib/types';
import { H4, P } from '@/components/ui/typography';

interface ExperienceCardProps {
  experience: Experience;
  priority?: boolean;
}

export const ExperienceCard = ({
  experience,
  priority = false,
}: ExperienceCardProps) => {
  return (
    <Link href={`/experiencias/${experience.slug}`}>
      <div className="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="relative h-48 w-full overflow-hidden">
<Image
            src={experience.main_image_url || `https://placehold.co/400x300?text=${encodeURIComponent(experience.title)}`}
            alt={experience.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            unoptimized
          />
        </div>
        <div className="p-4">
          <H4 className="truncate font-semibold">{experience.title}</H4>
<P className="mt-2 text-sm text-gray-600">
            {experience.short_description}
          </P>
        </div>
      </div>
    </Link>
  );
};
