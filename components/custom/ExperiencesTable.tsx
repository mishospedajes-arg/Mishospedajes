"use client";

import { useState } from 'react';
import { Experience } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface ExperiencesTableProps {
  experiences: Experience[];
}

export default function ExperiencesTable({ experiences: initialExperiences }: ExperiencesTableProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      return;
    }

    try {
      const response = await fetch(`/api/experiencias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la experiencia');
      }

      toast({
        title: 'Éxito',
        description: 'Experiencia eliminada correctamente.',
      });

      const updatedExperiences = experiences.filter(exp => exp.id !== id);
      setExperiences(updatedExperiences);

    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la experiencia.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiences && experiences.length > 0 ? (
            experiences.map((experience) => (
              <TableRow key={experience.id}>
                <TableCell>
                  <Image
                    src={experience.main_image_url || '/placeholder.svg'}
                    alt={experience.title}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{experience.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{experience.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="icon" className="mr-2">
                    <Link href={`/admin/experiencias/${experience.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay experiencias para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
