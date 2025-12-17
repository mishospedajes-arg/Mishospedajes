import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { blobs } = await list();
    return NextResponse.json(blobs);
  } catch (error) {
    console.error('Error listing blob files:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de imágenes.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL de la imagen es requerida.' }, { status: 400 });
    }

    // Eliminar de Vercel Blob
    await del(url);

    // Eliminar de la base de datos
    const { error: dbError } = await db
      .from('Images')
      .delete()
      .eq('url', url);

    if (dbError) {
      console.error('Error deleting image from database:', dbError);
      return NextResponse.json(
        { error: 'Error al eliminar la imagen de la base de datos.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Imagen eliminada correctamente.' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen.' },
      { status: 500 }
    );
  }
}
