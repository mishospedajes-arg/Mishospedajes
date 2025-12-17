'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Testimonial } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/custom/ImageUpload';

const formSchema = z.object({
  author_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  author_image_url: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
  testimonial_text: z.string().min(10, 'El testimonio debe tener al menos 10 caracteres.'),
  rating: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    })
    .refine((val): val is number => val !== null && val >= 1 && val <= 5, {
      message: "El rating debe ser un número entre 1 y 5.",
    }),
  is_featured: z.boolean(),
});

type TestimonialFormValues = z.infer<typeof formSchema>;

interface TestimonialFormProps {
  testimonial?: Testimonial;
}

export default function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author_name: testimonial?.author_name || '',
      author_image_url: testimonial?.author_image_url || '',
      testimonial_text: testimonial?.testimonial_text || '',
      rating: testimonial?.rating || 5,
      is_featured: !!testimonial?.is_featured,
    },
  });

  const onSubmit = async (values: TestimonialFormValues) => {
    const method = testimonial ? 'PUT' : 'POST';
    const url = testimonial ? `/api/testimonials/${testimonial.id}` : '/api/testimonials';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save testimonial');
      }

      router.push('/admin/testimonials');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="author_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Autor</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Imagen del Autor</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  onChange={(urls: string[]) => field.onChange(urls[0] || '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="testimonial_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del Testimonio</FormLabel>
              <FormControl>
                <Textarea placeholder="Una experiencia increíble..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (1-5)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  {...field}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>¿Destacado?</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">{testimonial ? 'Actualizar' : 'Crear'}</Button>
      </form>
    </Form>
  );
}
