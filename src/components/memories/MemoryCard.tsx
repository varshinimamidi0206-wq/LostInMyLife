import React from 'react';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
  variant?: 'card' | 'compact';
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onClick,
  variant = 'card',
}) => {
  const dateFormatted = memory.captured_at
    ? new Date(memory.captured_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Date unavailable';

  const title = memory.title || memory.object_name || 'Physical Memory';
  const locationText = memory.location || memory.place_name || 'Location unavailable';

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className="group bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-cyan-500/40 rounded-2xl p-3 flex items-center space-x-3.5 cursor-pointer transition-all duration-200 active:scale-[0.99] shadow-sm"
      >
        <img
          src={memory.image_url}
          alt={title}
          loading="lazy"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-800 flex-shrink-0"
        />

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
            {title}
          </h4>

          <div className="flex items-center space-x-1.5 text-xs text-gray-400 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 font-mono">
            <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span>{dateFormatted}</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mr-1" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-cyan-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow flex flex-col active:scale-[0.99]"
    >
      {/* Photo with subtle top-to-bottom depth */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-950">
        <img
          src={memory.image_url}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80 pointer-events-none" />
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors truncate">
          {title}
        </h3>

        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate text-gray-300 font-medium">{locationText}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-mono">
            <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span>{dateFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
