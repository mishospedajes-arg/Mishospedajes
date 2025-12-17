'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { PropertyCard } from './PropertyCard';
import { type Property } from '@/lib/types';
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';

interface InteractiveMapProps {
  properties: Property[];
  selectedNodeId?: string | null;
}

const InteractiveMap = ({ properties, selectedNodeId }: InteractiveMapProps) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);

  // Ref to store the starting position of a click/drag
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (selectedNodeId && transformComponentRef.current) {
      const property = properties.find((p) => p.map_node_id === selectedNodeId);
      if (property) {
        setSelectedProperty(property);
        // Usamos un selector de ID para encontrar el elemento en el DOM
        transformComponentRef.current.zoomToElement(selectedNodeId, 2, 300);
      }
    }
  }, [selectedNodeId, properties, svgContent]);

  useEffect(() => {
    fetch('/svg-nodos.svg')
      .then((res) => res.text())
      .then((text) => {
        // Limpia los saltos de línea y espacios que rompen el parser
        const cleanedText = text.replace(/[\r\n\t]+/g, ' ').replace(/>\s+</g, '><');
        setSvgContent(cleanedText);
      });
  }, []);

  const handlePropertyClick = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation(); // Prevent map background click
    setSelectedProperty(property);
  };

  const handleCloseCard = () => {
    setSelectedProperty(null);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStartPos.current) return;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const dx = clientX - dragStartPos.current.x;
    const dy = clientY - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If movement is small (less than 5px), consider it a click and close the card
    if (distance < 5) {
      handleCloseCard();
    }

    dragStartPos.current = null;
  };

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'g' && domNode.attribs.id) {
        const polygon = domNode.children.find(
          (child) => child instanceof Element && child.name === 'polygon'
        ) as Element | undefined;

        if (polygon) {
          const property = properties.find((p) => p.map_node_id === domNode.attribs.id);

          if (property) {
            const { class: originalClassName, ...restPolygonAttribs } = polygon.attribs;

            let dynamicClasses = 'interactive-polygon';
            if (hoveredPropertyId === property.id) {
              dynamicClasses += ' hovered';
            }
            if (selectedProperty?.id === property.id) {
              dynamicClasses += ' selected';
            }

            return (
              <g
                {...domNode.attribs}
                onClick={(e) => handlePropertyClick(e, property)}
                onMouseEnter={() => setHoveredPropertyId(property.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
              >
                <polygon {...restPolygonAttribs} className={`${originalClassName || ''} ${dynamicClasses}`.trim()} />
              </g>
            );
          }
        }
      }
      // No es necesario devolver nada si no se reemplaza, 
      // html-react-parser continuará con el renderizado por defecto.
    },
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#C5D594]"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1.2}
        initialPositionX={-500}
        initialPositionY={-200}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            <div className="absolute top-3 left-3  z-20 flex flex-col gap-2">
              <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="bg-white p-2 w-8.5 rounded-md shadow-md flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-700" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="bg-white p-2 w-8.5 rounded-md shadow-md flex items-center justify-center">
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); resetTransform(); }} className="bg-white w-8.5 p-2 rounded-md shadow-md flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div className="relative w-[6027px] bg-[#C5D594]">
                <Image
                  src="/mapa.png"
                  alt="Mapa de propiedades"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="absolute top-0 left-0"
                  priority
                  quality={100}
                  unoptimized
                />
                <div className="absolute top-0 left-0 w-full h-full">
                  {svgContent && parse(svgContent, options)}
                </div>
              </div>
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
      {selectedProperty && (
        <div
          className="absolute bottom-25 right-4 transform  z-20 w-72"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-lg px-1.25 pt-1 pb-3 overflow-hidden">
            <button onClick={handleCloseCard} className="absolute top-2 right-2 w-6 bg-white rounded-full p-1 z-30 leading-none">
              &times;
            </button>
            <PropertyCard property={selectedProperty} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
