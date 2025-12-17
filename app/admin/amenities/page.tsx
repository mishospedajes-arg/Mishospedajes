import { fetchAllAmenities } from "@/lib/data";
import AmenitiesList from "@/components/admin/AmenitiesList";

export const dynamic = "force-dynamic";

export default async function AmenitiesPage() {
    const amenities = await fetchAllAmenities();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestión de Amenities</h1>
            </div>
            <AmenitiesList initialAmenities={amenities} />
        </div>
    );
}
