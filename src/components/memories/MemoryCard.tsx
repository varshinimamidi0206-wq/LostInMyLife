import React from 'react';
import { MapPin, Calendar, Image as ImageIcon, BookOpen, FileText, Map, ShoppingBag, Utensils, Ticket, Sparkles } from 'lucide-react';
import { Memory, MemoryType } from '../../types/memory';

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick }) => {
  const dateFormatted = memory.captured_at
    ? new Date(memory.captured_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const title = memory.title || memory.object_name || 'Physical Memory';
  const summary = memory.summary || memory.description || 'Saved physical world memory.';
  const type = (memory.memory_type || 'object').toLowerCase() as MemoryType;

  // Type badge styling & icon
  const getTypeMeta = (mType: string) => {
    switch (mType) {
      case 'place':
        return { label: 'Place', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30', icon: Map };
      case 'document':
        return { label: 'Document', color: 'bg-blue-950/80 text-blue-300 border-blue-500/30', icon: FileText };
      case 'book':
        return { label: 'Book', color: 'bg-amber-950/80 text-amber-300 border-amber-500/30', icon: BookOpen };
      case 'food':
        return { label: 'Food', color: 'bg-orange-950/80 text-orange-300 border-orange-500/30', icon: Utensils };
      case 'ticket':
      case 'event':
        return { label: 'Experience', color: 'bg-purple-950/80 text-purple-300 border-purple-500/30', icon: Ticket };
      case 'product':
        return { label: 'Product', color: 'bg-rose-950/80 text-rose-300 border-rose-500/30', icon: ShoppingBag };
      default:
        return { label: 'Object', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30', icon: Sparkles };
    }
  };

  const typeMeta = getTypeMeta(type);
  const TypeIcon = typeMeta.icon;

  return (
    <div
      onClick={onClick}
      className="group relative bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800/80 hover:border-cyan-500/40 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glow flex flex-col"
    >
      {/* Thumbnail with overlay tags */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-950">
        <img
          src={memory.image_url}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/25 to-transparent pointer-events-none" />

        {/* Memory Type badge (Top-Left) */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-sm ${typeMeta.color}`}>
            <TypeIcon className="w-3 h-3" />
            <span>{typeMeta.label}</span>
          </span>
        </div>

        {/* Source badge if imported from Google Photos (Top-Right) */}
        {memory.source === 'google_photos' && (
          <div className="absolute top-3 right-3 bg-gray-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-gray-700 flex items-center space-x-1 text-[10px] text-gray-300">
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>Photos</span>
          </div>
        )}

        {/* Date on bottom image */}
        {dateFormatted && (
          <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 text-[11px] font-mono text-gray-300">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{dateFormatted}</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {title}
          </h3>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Location & Subtle Price (if present) Footer */}
        <div className="pt-2.5 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center space-x-1 truncate max-w-[70%]">
            <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{memory.location || memory.place_name || 'Physical World'}</span>
          </div>

          {/* Secondary subtle price only when applicable */}
          {memory.price ? (
            <span className="text-[11px] font-mono font-semibold text-emerald-400">
              ₹{memory.price}
            </span>
          ) : memory.brand ? (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded">
              {memory.brand}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
