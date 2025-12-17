import { NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { z } from 'zod';
import { fetchExperiences } from '@/lib/data';
import { Experience } from '@/lib/types';

const experienceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  short_description: z.string(),
  long_description: z.string(),
  what_to_know: z.string(), // Se espera un string JSON
  images: z.array(z.object({ url: z.string() })), // Se espera un array de objetos de imagen
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = experienceSchema.parse(body);

    const {
      title,
      slug,
      category,
      short_description,
      long_description,
      what_to_know,
      images,
    } = parsedData;

    const whatToKnowArray = what_to_know.split('\n').filter(line => line.trim() !== '');
    const whatToKnowJson = JSON.stringify(whatToKnowArray);

    // Insertar la experiencia en Supabase
    const { data: experienceData, error: experienceError } = await supabase
      .from('experiences')
      .insert({
        title,
        slug,
        category,
        short_description,
        long_description,
        what_to_know: whatToKnowJson,
      })
      .select('id')
      .single();

    if (experienceError) {
      console.error('Error inserting experience:', experienceError);
      return NextResponse.json({ message: 'Error al crear la experiencia en la base de datos' }, { status: 500 });
    }

    const experienceId = experienceData.id;

    // Insertar las imágenes si existen, manejando duplicados (upsert)
    if (images && images.length > 0) {
      const imageUpserts = images.map((image, index) => ({
        url: image.url,
        alt_text: `Image for ${title}`,
        entity_type: 'experience',
        entity_id: experienceId,
        order: index + 1,
      }));

      // Usar 'upsert' con 'onConflict' para evitar errores de URL duplicada
      const { error: imageError } = await supabase
        .from('images')
        .upsert(imageUpserts, { onConflict: 'url' });

      if (imageError) {
        console.error('Error upserting images:', imageError);
        // Si falla la inserción/actualización de imágenes, eliminar la experiencia creada
        await supabase.from('experiences').delete().eq('id', experienceId);
        return NextResponse.json({ message: 'Error al guardar las imágenes de la experiencia' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Experiencia creada con éxito', id: experienceId }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  console.log('API route /api/experiencias received a GET request.');
  try {
    const experiences: Experience[] = await fetchExperiences();
    // Log para depuración en Vercel
    console.log('Successfully fetched experiences:', JSON.stringify(experiences, null, 2));
    return NextResponse.json(experiences);
  } catch (error) {
    // Log del error específico
    console.error('Error in GET /api/experiencias:', error);

    // Devolver una respuesta de error más detallada
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
