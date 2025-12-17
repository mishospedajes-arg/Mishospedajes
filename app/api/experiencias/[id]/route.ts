import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import supabase from '@/lib/db';
import { z } from 'zod';
import { fetchExperienceById } from '@/lib/data';
import { Experience } from '@/lib/types';
import { del } from '@vercel/blob';

const formSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres."),
  category: z.string().min(1, "La categoría es obligatoria."),
  short_description: z.string().min(10, "La descripción corta debe tener al menos 10 caracteres."),
  long_description: z.string().min(20, "La descripción larga debe tener al menos 20 caracteres."),
  what_to_know: z.string(), // Se espera un string JSON
  images: z.array(z.object({ url: z.string().url("Debe ser una URL válida.") })),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const experience: Experience | undefined = await fetchExperienceById(id);
    if (!experience) {
      return NextResponse.json({ error: 'Experiencia no encontrada' }, { status: 404 });
    }
    return NextResponse.json(experience);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener la experiencia' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    const { title, category, short_description, long_description, what_to_know, images } = validatedData;

    // 1. Actualizar la experiencia en Supabase
    const { error: updateError } = await supabase
      .from('experiences')
      .update({
        title,
        category,
        short_description,
        long_description,
        what_to_know,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating experience:', updateError);
      return NextResponse.json({ error: 'Error al actualizar la experiencia' }, { status: 500 });
    }

    // 2. Eliminar imágenes antiguas
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('entity_type', 'experience')
      .eq('entity_id', id);

    if (deleteError) {
      console.error('Error deleting old images:', deleteError);
      // No se considera un error fatal, pero se registra.
    }

    // 3. Insertar imágenes nuevas
    if (images && images.length > 0) {
      const imageInserts = images.map((img, index) => ({
        url: img.url,
        alt_text: `Imagen de ${title}`,
        entity_type: 'experience',
        entity_id: id,
        order: index,
      }));

      const { error: insertError } = await supabase.from('images').insert(imageInserts);

      if (insertError) {
        console.error('Error inserting new images:', insertError);
        return NextResponse.json({ error: 'Error al guardar las nuevas imágenes' }, { status: 500 });
      }
    }

    revalidatePath('/experiencias');
    revalidatePath(`/experiencias/${id}`);

    return NextResponse.json({ message: 'Experiencia actualizada correctamente' }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar la experiencia' }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // 1. Obtener las imágenes asociadas a la experiencia
    const { data: imagesToDelete, error: fetchImagesError } = await supabase
      .from('images')
      .select('url')
      .eq('entity_type', 'experience')
      .eq('entity_id', id);

    if (fetchImagesError) {
      console.error('Error fetching images for deletion:', fetchImagesError);
    }

    // 2. Eliminar imágenes de Vercel Blob y de la base de datos
    if (imagesToDelete && imagesToDelete.length > 0) {
      const urls = imagesToDelete.map(img => img.url);
      try {
        // Eliminar de Vercel Blob
        await del(urls);
      } catch (blobError) {
        console.error('Error deleting images from Vercel Blob:', blobError);
        // Continuamos con la eliminación de la BD aunque falle el Blob
      }

      // Eliminar de la tabla images
      const { error: imageError } = await supabase
        .from('images')
        .delete()
        .eq('entity_type', 'experience')
        .eq('entity_id', id);

      if (imageError) {
        console.error('Error deleting associated images from database:', imageError);
      }
    }

    // 3. Eliminar la experiencia
    const { data, error: experienceError } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)
      .select();

    if (experienceError) {
      console.error('Error deleting experience:', experienceError);
      return NextResponse.json({ error: 'Error al eliminar la experiencia' }, { status: 500 });
    }

    revalidatePath('/experiencias');

    if (!data || data.length === 0) {
      // Esto es una aproximación, Supabase v2 no devuelve el número de filas afectadas directamente en delete.
      // Se puede inferir si 'data' es nulo o vacío, aunque la consulta no haya fallado.
    }

    return NextResponse.json({ message: 'Experiencia eliminada correctamente' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar la experiencia' }, { status: 500 });
  }
}
