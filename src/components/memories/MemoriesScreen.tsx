import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2, ArrowUpDown, Calendar, Plus } from 'lucide-react';
import { Memory } from '../../types/memory';
import { MemoryCard } from './MemoryCard';
import { searchMemories } from '../../services/api';

interface MemoriesScreenProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onNavigateCapture: () => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({
  memories,
  onSelectMemory,
  onNavigateCapture,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>(memories);
  const [isSearching, setIsSearching] = useState(false);

  const filterOptions = [
    'All',
    'Objects',
    'Places',
    'Documents',
    'Experiences',
  ];

  useEffect(() => {
    let isCancelled = false;

    async function executeSearch() {
      setIsSearching(true);
      try {
        let results = memories;

        // Query execution
        if (searchQuery.trim()) {
          results = await searchMemories(searchQuery, activeFilter, memories);
        } else if (activeFilter !== 'All') {
          results = memories.filter(m => {
            const cat = (m.category || '').toLowerCase();
            const type = (m.memory_type || '').toLowerCase();
            const target = activeFilter.toLowerCase();
            if (target === 'objects') return type === 'object' || type === 'product' || type === 'food' || type === 'book';
            if (target === 'places') return type === 'place';
            if (target === 'documents') return type === 'document' || type === 'receipt';
            if (target === 'experiences') return type === 'event' || type === 'ticket' || cat.includes('experience');
            return cat.includes(target) || target.includes(cat);
          });
        }

        // Sorting
        if (sortOption === 'newest') {
          results = [...results].sort((a, b) => {
            const timeA = a.captured_at ? new Date(a.captured_at).getTime() : 0;
            const timeB = b.captured_at ? new Date(b.captured_at).getTime() : 0;
            return timeB - timeA;
          });
        } else if (sortOption === 'oldest') {
          results = [...results].sort((a, b) => {
            const timeA = a.captured_at ? new Date(a.captured_at).getTime() : 0;
            const timeB = b.captured_at ? new Date(b.captured_at).getTime() : 0;
            return timeA - timeB;
          });
        }

        if (!isCancelled) {
          setFilteredMemories(results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }

    const timer = setTimeout(() => {
      executeSearch();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeFilter, sortOption, memories]);

  // Group memories by date
  const groupedTimeline = useMemo(() => {
    const groups: { [key: string]: Memory[] } = {};

    filteredMemories.forEach(mem => {
      const groupKey = mem.captured_at
        ? new Date(mem.captured_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        : 'Date unavailable';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(mem);
    });

    return groups;
  }, [filteredMemories]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-12">
      {/* Header (Desktop) */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Memories
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Everything you've chosen to remember.
          </p>
        </div>

        <button
          onClick={onNavigateCapture}
          className="min-h-[42px] px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-glow flex items-center space-x-1.5 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Save Memory</span>
        </button>
      </div>

      {/* Search Field */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-cyan-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search your memories... (e.g. 'blue handbag', 'café', 'shoes')"
          className="w-full min-h-[48px] bg-gray-900/80 border border-gray-800 rounded-2xl pl-11 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
        />
        {isSearching && (
          <div className="absolute right-11 text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 p-1 text-gray-400 hover:text-white"
            aria-label="Clear Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills & Sorting Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map(cat => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-300 border border-cyan-500/60 shadow-sm'
                    : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:text-gray-200 hover:bg-gray-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            className="min-h-[36px] bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Memory Cards Display */}
      {filteredMemories.length > 0 ? (
        <div className="space-y-8 pt-2">
          {Object.entries(groupedTimeline).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-3.5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{dateGroup}</span>
                <span className="text-[10px] text-gray-500 font-mono">
                  ({items.length})
                </span>
              </div>

              {/* Desktop Grid Layout */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {items.map(mem => (
                  <MemoryCard
                    key={mem.id}
                    memory={mem}
                    onClick={() => onSelectMemory(mem)}
                    variant="card"
                  />
                ))}
              </div>

              {/* Mobile Vertical List Layout (Matching Screen 5) */}
              <div className="sm:hidden space-y-2.5">
                {items.map(mem => (
                  <MemoryCard
                    key={mem.id}
                    memory={mem}
                    onClick={() => onSelectMemory(mem)}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No memories yet.</h3>
            <p className="text-xs text-gray-400">
              {searchQuery
                ? `No memories matched "${searchQuery}". Try a different search term.`
                : "Save something you've seen and it will appear here."}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 rounded-full bg-gray-800 text-xs font-semibold text-gray-200 hover:bg-gray-700"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={onNavigateCapture}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              Save a Memory
            </button>
          )}
        </div>
      )}
    </div>
  );
};
