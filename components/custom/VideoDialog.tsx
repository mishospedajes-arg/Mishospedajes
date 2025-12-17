"use client";

import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VideoDialogProps {
  videoUrl: string;
}

// Función para convertir una URL de YouTube normal a una URL de incrustación (embed)
const getEmbedUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Manejar formatos de URL cortos como youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${urlObj.pathname}`;
    }
  } catch (error) {
    console.error("URL de YouTube inválida:", error);
    return "";
  }
  return "";
};

export function VideoDialog({ videoUrl }: VideoDialogProps) {
  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null; // No renderizar nada si la URL no es válida
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary"  size="sm" className="flex text-xs items-center gap-2">
          <Video size={16} />
          Ver Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Video del Chalet</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
