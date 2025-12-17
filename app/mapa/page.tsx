import { fetchProperties } from '@/lib/data';
import MapContainer from '@/components/custom/MapContainer';

interface MapPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const MapPage = async ({ searchParams }: MapPageProps) => {
  const properties = await fetchProperties();
  const resolvedSearchParams = await searchParams;
  const chaletId = typeof resolvedSearchParams.chaletId === 'string' ? resolvedSearchParams.chaletId : null;

  let initialNodeId = null;
  if (chaletId) {
    const selectedProperty = properties.find((p) => p.id.toString() === chaletId);
    if (selectedProperty) {
      initialNodeId = selectedProperty.map_node_id;
    }
  }

  return <MapContainer properties={properties} initialSelectedNodeId={initialNodeId} />;
};

export default MapPage;
