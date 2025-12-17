import { fetchProperties } from '@/lib/data';
import ChaletsClientPage from '@/components/custom/ChaletsClientPage';
import { Property } from '@/lib/types';

interface ChaletsPageProps {
  searchParams: {
    startDate?: string;
    endDate?: string;
    guests?: string;
    amenities?: string;
  };
}

const ChaletsPage = async ({ searchParams }: ChaletsPageProps) => {
  const { startDate, endDate, guests, amenities } = await searchParams;
  const initialProperties: Property[] = await fetchProperties({ startDate, endDate, guests, amenities });

  return <ChaletsClientPage initialProperties={initialProperties} />;
};

export default ChaletsPage;
