"use server";

import supabase from "@/lib/db";
import { Amenity } from "@/lib/types";

export async function getAmenitiesWithDescriptions(): Promise<Amenity[]> {
    const { data, error } = await supabase
        .from("amenities")
        .select("id, name, slug, category, description, icon")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching amenities:", error);
        return [];
    }

    return data as Amenity[];
}
