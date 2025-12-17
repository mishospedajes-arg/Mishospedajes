'use client';

import React, { useState } from 'react';
import InteractiveMap from '@/components/custom/InteractiveMap';
import { MapSearchBar } from '@/components/custom/MapSearchBar';
import { Property } from '@/lib/types';

interface MapContainerProps {
  properties: Property[];
  initialSelectedNodeId?: string | null;
}

const MapContainer = ({ properties, initialSelectedNodeId = null }: MapContainerProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialSelectedNodeId);

  const handleSearchResultSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-3 left-10 z-10 w-full max-w-[70vw] 
      sm:max-w-[40vw]  px-4">
        <MapSearchBar onSearchResultSelect={handleSearchResultSelect} />
      </div>
      <InteractiveMap properties={properties} selectedNodeId={selectedNodeId} />
    </div>
  );
};

export default MapContainer;
