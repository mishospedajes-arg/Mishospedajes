import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { del } from '@vercel/blob';
import supabase from "@/lib/db";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().optional(),
  optional_services: z.string().optional(),
  latitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  category: z.string().optional(),
  guests: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  bedrooms: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  beds: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  bathrooms: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  rating: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(10).optional()
  ),
  price_high: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  price_mid: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  price_low: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  map_node_id: z.string().optional(),
  video_url: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
  featured: z.boolean().default(false),
  gallery_images: z.array(z.string().url({ message: "Por favor, introduce una URL válida." })).optional(),
  blueprint_images: z.array(z.string().url({ message: "Por favor, introduce una URL válida." })).optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.array(z.object({
    id: z.number().optional(),
    rule_text: z.string().min(1, { message: "La regla no puede estar vacía." })
  })).optional(),
});

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();
    if (!propertyId) {
      return NextResponse.json({ error: "ID de chalet no encontrado en la URL" }, { status: 400 });
    }

    const body = await request.json();
    const { gallery_images, blueprint_images, amenities, rules, ...chaletData } = formSchema.parse(body);

    // 1. Actualizar la propiedad principal
    const { error: updateError } = await supabase
      .from("properties")
      .update(chaletData)
      .eq("id", propertyId);

    if (updateError) {
      console.error("Error updating chalet:", updateError);
      return NextResponse.json({ error: "Error al actualizar el chalet.", details: updateError.message }, { status: 500 });
    }

    // 2. Gestionar imágenes (borrar e insertar)
    const { error: deleteImagesError } = await supabase.from("images").delete().match({ entity_type: "property", entity_id: propertyId });
    if (deleteImagesError) console.error("Error deleting old images:", deleteImagesError);

    if (gallery_images && gallery_images.length > 0) {
      const imagesToInsert = gallery_images.map((url, index) => ({
        url,
        entity_type: "property",
        entity_id: propertyId,
        image_category: "gallery",
        order: index
      }));
      const { error: galleryError } = await supabase.from("images").insert(imagesToInsert);
      if (galleryError) console.error("Error inserting new gallery images:", galleryError);
    }
    if (blueprint_images && blueprint_images.length > 0) {
      const imagesToInsert = blueprint_images.map((url, index) => ({
        url,
        entity_type: "property",
        entity_id: propertyId,
        image_category: "blueprint",
        order: index
      }));
      const { error: blueprintError } = await supabase.from("images").insert(imagesToInsert);
      if (blueprintError) console.error("Error inserting new blueprint images:", blueprintError);
    }

    // 3. Gestionar amenities (borrar e insertar)
    console.log(`Iniciando gestión de amenities para el chalet ID: ${propertyId}`);
    const { error: deleteAmenitiesError } = await supabase.from("propertyamenities").delete().eq("property_id", propertyId);
    if (deleteAmenitiesError) {
      console.error("Error al borrar amenities antiguos:", deleteAmenitiesError);
    } else {
      console.log("Amenities antiguos borrados correctamente.");
    }

    if (amenities && amenities.length > 0) {
      console.log("Amenities recibidos para actualizar (slugs):", amenities);

      const { data: amenitiesFromDb, error: amenitiesError } = await supabase
        .from("amenities")
        .select("id, slug")
        .in("slug", amenities);

      if (amenitiesError) {
        console.error("Error al buscar amenities en la BD para actualizar:", amenitiesError);
      } else {
        console.log("Amenities encontrados en la BD para actualizar:", amenitiesFromDb);

        if (amenitiesFromDb && amenitiesFromDb.length > 0) {
          const propertyAmenitiesToInsert = amenitiesFromDb.map(amenity => ({
            property_id: propertyId,
            amenity_id: amenity.id,
          }));

          console.log("Datos a insertar en propertyamenities (actualización):", propertyAmenitiesToInsert);

          const { error: paError } = await supabase.from("propertyamenities").insert(propertyAmenitiesToInsert);
          if (paError) {
            console.error("Error al insertar nuevos amenities en propertyamenities:", paError);
          } else {
            console.log("Nuevos amenities guardados correctamente.");
          }
        } else {
          console.warn("No se encontraron amenities en la BD para los slugs proporcionados durante la actualización.");
        }
      }
    } else {
      console.log("No se proporcionaron amenities para actualizar, se han borrado los existentes.");
    }

    // 4. Gestionar reglas (borrar e insertar)
    const { error: deleteRulesError } = await supabase.from("propertyrules").delete().eq("property_id", propertyId);
    if (deleteRulesError) console.error("Error deleting old rules:", deleteRulesError);

    if (rules && rules.length > 0) {
      const rulesToInsert = rules.map(rule => ({ property_id: propertyId, rule_text: rule.rule_text }));
      const { error: rulesError } = await supabase.from("propertyrules").insert(rulesToInsert);
      if (rulesError) console.error("Error inserting new property rules:", rulesError);
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/chalets");
    revalidatePath(`/chalets/${body.slug}`);

    return NextResponse.json({ message: "Chalet actualizado exitosamente" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("An unexpected error occurred during PUT:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}



export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();
    if (!propertyId) {
      return NextResponse.json({ error: "ID de chalet no encontrado en la URL" }, { status: 400 });
    }

    // 1. Obtener las imágenes asociadas al chalet
    const { data: imagesToDelete, error: fetchImagesError } = await supabase
      .from("images")
      .select("url")
      .eq("entity_type", "property")
      .eq("entity_id", propertyId);

    if (fetchImagesError) {
      console.error("Error fetching images for deletion:", fetchImagesError);
    }

    // 2. Eliminar imágenes de Vercel Blob y de la base de datos
    if (imagesToDelete && imagesToDelete.length > 0) {
      const urls = imagesToDelete.map(img => img.url);
      try {
        // Eliminar de Vercel Blob
        await del(urls);
      } catch (blobError) {
        console.error("Error deleting images from Vercel Blob:", blobError);
        // Continuamos con la eliminación de la BD aunque falle el Blob para no dejar datos inconsistentes
      }

      // Eliminar de la tabla images
      const { error: deleteImagesError } = await supabase
        .from("images")
        .delete()
        .eq("entity_type", "property")
        .eq("entity_id", propertyId);

      if (deleteImagesError) {
        console.error("Error deleting images from database:", deleteImagesError);
      }
    }

    // 3. Eliminar el chalet (Cascada para amenities y rules, SET NULL para bookings)
    const { error, count } = await supabase
      .from("properties")
      .delete({ count: 'exact' })
      .eq("id", propertyId);

    if (error) {
      console.error("Error deleting chalet:", error);
      return NextResponse.json({ error: "Error al eliminar el chalet.", details: error.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: "Chalet no encontrado" }, { status: 404 });
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/chalets");

    return NextResponse.json({ message: "Chalet eliminado exitosamente" }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred during DELETE:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
