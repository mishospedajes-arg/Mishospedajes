"use client";

import { BlobImageGallery } from '@/components/custom/BlobImageGallery';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function GalleryPage() {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Galería de Imágenes</h1>
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <BlobImageGallery 
        selectedUrls={selectedUrls} 
        onSelectionChange={setSelectedUrls}
        searchTerm={searchTerm}
      />
    </div>
  );
}
