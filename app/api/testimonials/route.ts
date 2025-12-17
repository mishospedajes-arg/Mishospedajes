import { NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching testimonials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const testimonialData = await request.json();
    const { author_name, author_image_url, testimonial_text, rating, is_featured } = testimonialData;

    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        { author_name, author_image_url, testimonial_text, rating, is_featured: is_featured ? true : false },
      ])
      .select();

    if (error) {
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return NextResponse.json({ message: 'Testimonial created successfully', data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating testimonial' }, { status: 500 });
  }
}
