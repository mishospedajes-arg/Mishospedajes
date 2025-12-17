import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  onClose: () => void;
}

export function ImageGalleryModal({ images, onClose }: ImageGalleryModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-screen bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Galería de Fotos</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <X className="h-6 w-6" />
              <span className="sr-only">Cerrar</span>
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">
          {images.map((src, index) => (
            <div key={index} className="break-inside-avoid">
              <Image
                src={src}
                alt={`Imagen de la galería ${index + 1}`}
                width={500}
                height={500}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
