"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface BlobImageGalleryProps {
  selectedUrls: string[];
  onSelectionChange: (urls: string[]) => void;
  searchTerm: string;
}

export function BlobImageGallery({ selectedUrls, onSelectionChange, searchTerm }: BlobImageGalleryProps) {
  const [images, setImages] = useState<BlobFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/images');
        if (!response.ok) {
          throw new Error('No se pudieron cargar las imágenes.');
        }
        const data: BlobFile[] = await response.json();
        // Filtrar solo archivos de imagen comunes
        const imageFiles = data.filter(file => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file.pathname)
        );
        setImages(imageFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchImages();
  }, []);

  const handleSelectImage = (url: string, checked: boolean | 'indeterminate') => {
    if (checked) {
      onSelectionChange([...selectedUrls, url]);
    } else {
      onSelectionChange(selectedUrls.filter((selectedUrl) => selectedUrl !== url));
    }
  };

  const handleDeleteImage = async (url: string) => {
    try {
      const response = await fetch(`/api/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar la imagen.');
      }

      setImages(images.filter(image => image.url !== url));
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Ocurrió un error desconocido.',
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  const filteredImages = images.filter(image =>
    image.pathname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (images.length === 0) {
    return <p className="text-center text-gray-500">No se encontraron imágenes en el Blob storage.</p>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4">
        {filteredImages.map((image) => (
          <div key={image.url} className="relative group cursor-pointer">
            <label htmlFor={image.url}>
              <Image
                src={image.url}
                alt={image.pathname}
                width={150}
                height={150}
                className={`rounded-lg object-cover w-full aspect-square transition-all ${
                  selectedUrls.includes(image.url) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
              />
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  id={image.url}
                  checked={selectedUrls.includes(image.url)}
                  onCheckedChange={(checked) => handleSelectImage(image.url, checked)}
                />
              </div>
            </label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La imagen se eliminará permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteImage(image.url)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
      {filteredImages.length === 0 && (
        <p className="text-center text-gray-500 py-4">No se encontraron imágenes con ese nombre.</p>
      )}
    </ScrollArea>
  );
}
