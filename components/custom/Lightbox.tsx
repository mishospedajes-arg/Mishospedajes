"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleInteraction = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNext, goToPrevious, onClose]);

  return (
    <div
      data-lightbox-root
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={(e) => handleInteraction(e, onClose)}
        className="absolute top-4 left-4 z-20 text-white/80 hover:text-white pointer-events-auto"
        aria-label="Cerrar lightbox"
      >
        <X size={32} />
        <span className="sr-only">Cerrar</span>
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 z-10 text-white/80 text-lg">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div className="relative h-full w-full flex items-center justify-center p-12 pointer-events-none">
        <Image
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          layout="fill"
          objectFit="contain"
          className="p-4 pointer-events-auto"
        />
      </div>

      {/* Previous Button */}
      <button
        onClick={(e) => handleInteraction(e, goToPrevious)}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 hover:text-white hover:bg-black/75 pointer-events-auto"
        aria-label="Imagen anterior"
      >
        <ChevronLeft size={32} />
        <span className="sr-only">Anterior</span>
      </button>

      {/* Next Button */}
      <button
        onClick={(e) => handleInteraction(e, goToNext)}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 hover:text-white hover:bg-black/75 pointer-events-auto"
        aria-label="Siguiente imagen"
      >
        <ChevronRight size={32} />
        <span className="sr-only">Siguiente</span>
      </button>
    </div>
  );
}
