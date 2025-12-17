"use server";

import supabase from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAmenityDescription(id: number, description: string) {
    const { error } = await supabase
        .from("amenities")
        .update({ description })
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/amenities");
}
