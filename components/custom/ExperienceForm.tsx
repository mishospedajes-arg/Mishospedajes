"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/custom/ImageUpload";

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(2, "El título debe tener al menos 2 caracteres."),
  slug: z.string().optional(),
  category: z.string().min(1, "La categoría es obligatoria."),
  short_description: z.string().min(10, "La descripción corta debe tener al menos 10 caracteres."),
  long_description: z.string().min(20, "La descripción larga debe tener al menos 20 caracteres."),
  what_to_know: z.string().optional(),
  images: z.array(z.object({ url: z.string().url("Debe ser una URL válida.") })),
});

type ExperienceFormValues = z.infer<typeof formSchema>;

interface ExperienceFormProps {
  defaultValues?: ExperienceFormValues;
}

export function ExperienceForm({ defaultValues }: ExperienceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!defaultValues;

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      slug: "",
      category: "",
      short_description: "",
      long_description: "",
      what_to_know: "",
      images: [],
    },
  });

  const { watch, setValue } = form;
  const experienceTitle = watch("title");

  useEffect(() => {
    if (experienceTitle) {
      setValue("slug", slugify(experienceTitle), { shouldValidate: true });
    }
  }, [experienceTitle, setValue]);

  async function onSubmit(data: ExperienceFormValues) {
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/experiencias/${data.id}` : '/api/experiencias';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEditMode ? 'actualizar' : 'crear'} la experiencia`);
      }

      toast({
        title: "Éxito",
        description: `La experiencia ha sido ${isEditMode ? 'actualizada' : 'creada'} correctamente.`,
      });

      router.push('/admin/experiencias');
      router.refresh();

    } catch {
      toast({
        title: "Error",
        description: `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la experiencia. Inténtalo de nuevo.`,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Aventura en Kayak" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Amigable (Slug)</FormLabel>
              <FormControl>
                <Input placeholder="Se generará automáticamente" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Zona deportiva y social">Zona deportiva y social</SelectItem>
                  <SelectItem value="Turismo">Turismo</SelectItem>
                  <SelectItem value="Zona de naturaleza">Zona de naturaleza</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Corta</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Una breve descripción para las tarjetas de vista previa."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="long_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Larga</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="La descripción completa que se mostrará en la página de detalle."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="what_to_know"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qué Deberías Saber (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Ej: ["Punto 1", "Punto 2"]'
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value.map(img => img.url)}
                  onChange={(urls) => {
                    form.setValue('images', urls.map(url => ({ url })));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{isEditMode ? 'Actualizar' : 'Crear'} Experiencia</Button>
      </form>
    </Form>
  );
}
