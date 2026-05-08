'use client';

import { useState } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setIsOpen(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectResult = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place or address..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-[2000] shadow-2xl"
          >
            {results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => selectResult(result)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span className="text-sm line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
