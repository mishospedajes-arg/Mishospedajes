import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const testimonialData = await request.json();
    const { author_name, author_image_url, testimonial_text, rating, is_featured } = testimonialData;

    const { data, error } = await supabase
      .from('testimonials')
      .update({
        author_name,
        author_image_url,
        testimonial_text,
        rating,
        is_featured: is_featured ? true : false,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return NextResponse.json({ message: 'Testimonial updated successfully', data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting testimonial' }, { status: 500 });
  }
}
