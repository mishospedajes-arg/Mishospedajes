'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

import { Property } from '@/lib/types';

interface MapSearchBarProps {
  onSearchResultSelect: (nodeId: string) => void;
}

export function MapSearchBar({ onSearchResultSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Property[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/chalets/search?name=${query}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSelect = (nodeId: string) => {
    onSearchResultSelect(nodeId);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex w-[20vw] max-w-[80vw] items-center space-x-2">
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

      </div>
      {results.length > 0 && (
        <ul className="absolute z-10 w-[20vw] max-w-[80vw] mt-2 bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
          {results.map((property) => (
            <li
              key={property.id}
              className="px-4 py-2 cursor-pointer text-sm hover:font-medium"
              onClick={() => handleSelect(property.map_node_id)}
            >
              {property.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
