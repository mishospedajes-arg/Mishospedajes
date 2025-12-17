import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import supabase from "@/lib/db";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  slug: z.string().min(1, { message: "El slug no puede estar vacío." }),
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
  category: z.string().min(1, { message: "La categoría es obligatoria." }),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gallery_images, blueprint_images, amenities, rules, ...chaletData } = formSchema.parse(body);

    // 1. Insertar la propiedad principal
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert([chaletData])
      .select()
      .single();

    if (propertyError) {
      console.error("Error creating chalet:", propertyError);
      return NextResponse.json({ error: "Error al crear el chalet.", details: propertyError.message }, { status: 500 });
    }

    const propertyId = property.id;

    // 2. Insertar imágenes de la galería
    if (gallery_images && gallery_images.length > 0) {
      const imagesToInsert = gallery_images.map((url, index) => ({
        url,
        entity_type: "property",
        entity_id: propertyId,
        image_category: "gallery",
        order: index,
      }));
      const { error: galleryError } = await supabase.from("images").insert(imagesToInsert);
      if (galleryError) console.error("Error inserting gallery images:", galleryError);
    }

    // 3. Insertar imágenes de planos
    if (blueprint_images && blueprint_images.length > 0) {
      const imagesToInsert = blueprint_images.map((url, index) => ({
        url,
        entity_type: "property",
        entity_id: propertyId,
        image_category: "blueprint",
        order: index,
      }));
      const { error: blueprintError } = await supabase.from("images").insert(imagesToInsert);
      if (blueprintError) console.error("Error inserting blueprint images:", blueprintError);
    }

    // 4. Insertar amenities
    if (amenities && amenities.length > 0) {
      console.log("Amenities recibidos del formulario (slugs):", amenities);

      const { data: amenitiesFromDb, error: amenitiesError } = await supabase
        .from("amenities")
        .select("id, slug")
        .in("slug", amenities);

      if (amenitiesError) {
        console.error("Error al buscar amenities en la BD:", amenitiesError);
      } else {
        console.log("Amenities encontrados en la BD:", amenitiesFromDb);

        if (amenitiesFromDb && amenitiesFromDb.length > 0) {
          const propertyAmenitiesToInsert = amenitiesFromDb.map(amenity => ({
            property_id: propertyId,
            amenity_id: amenity.id,
          }));

          console.log("Datos a insertar en propertyamenities:", propertyAmenitiesToInsert);

          const { error: paError } = await supabase.from("propertyamenities").insert(propertyAmenitiesToInsert);
          if (paError) {
            console.error("Error al insertar en propertyamenities:", paError);
          } else {
            console.log("Amenities guardados correctamente.");
          }
        } else {
          console.warn("No se encontraron amenities en la BD para los slugs proporcionados.");
        }
      }
    }

    // 5. Insertar reglas
    if (rules && rules.length > 0) {
      const rulesToInsert = rules.map(rule => ({
        property_id: propertyId,
        rule_text: rule.rule_text,
      }));
      const { error: rulesError } = await supabase.from("propertyrules").insert(rulesToInsert);
      if (rulesError) console.error("Error inserting property rules:", rulesError);
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/chalets");


    return NextResponse.json({ message: "Chalet creado exitosamente", propertyId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
