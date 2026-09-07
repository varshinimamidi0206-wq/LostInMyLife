import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, ExternalLink, Loader2, Search } from 'lucide-react';
import { SimilarityMatch, Memory } from '../../types/memory';

interface HaveISeenThisProps {
  similarity: SimilarityMatch | null;
  onCheckSimilarity?: () => Promise<void>;
  onViewMemory?: (mem: Memory) => void;
  isChecking?: boolean;
}

export const HaveISeenThis: React.FC<HaveISeenThisProps> = ({
  similarity,
  onCheckSimilarity,
  onViewMemory,
  isChecking = false,
}) => {
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleCheck = async () => {
    setHasTriggered(true);
    if (onCheckSimilarity) {
      await onCheckSimilarity();
    }
  };

  // If check has not been triggered yet and we have a manual trigger handler
  if (!similarity && !isChecking && onCheckSimilarity && !hasTriggered) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Have I seen this before?</span>
          </h4>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Check if you've previously captured or observed something similar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap shadow-sm active:scale-95"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Check My Memories</span>
        </button>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-center space-y-2 animate-pulse">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs text-cyan-300 font-medium">
          Checking your saved memories...
        </p>
      </div>
    );
  }

  if (!similarity) return null;

  if (!similarity.match_found || !similarity.similar_memory) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Have I seen this before?</span>
        </div>
        <p className="text-xs text-gray-200 mt-1 font-medium">
          I couldn't find a similar memory. This appears to be new!
        </p>
      </div>
    );
  }

  const mem = similarity.similar_memory;
  const memTitle = mem.title || mem.object_name || 'Item';
  const dateFormatted = mem.captured_at
    ? new Date(mem.captured_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Earlier';

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-gray-900/80 to-cyan-950/30 border border-amber-500/40 rounded-2xl p-4 shadow-glow-amber animate-slide-up space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Have I seen this before?
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          {similarity.time_ago_text || 'Past sighting'}
        </span>
      </div>

      <p className="text-sm font-bold text-white">
        Yes! You have seen something similar before.
      </p>

      {/* Memory Preview Card */}
      <div className="flex items-center space-x-3 bg-gray-950/80 border border-gray-800 rounded-xl p-3">
        <img
          src={mem.image_url}
          alt={memTitle}
          className="w-16 h-16 rounded-xl object-cover border border-gray-800 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{memTitle}</h4>

          <p className="text-[11px] text-gray-300 flex items-center space-x-1 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{mem.location || mem.place_name || 'Saved location'}</span>
          </p>

          <p className="text-[11px] text-gray-400 flex items-center space-x-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{dateFormatted}</span>
            {similarity.similarity_reason && (
              <span className="text-[10px] text-amber-300/90 ml-2 truncate">
                • {similarity.similarity_reason}
              </span>
            )}
          </p>
        </div>

        {onViewMemory && (
          <button
            onClick={() => onViewMemory(mem)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="View Previous Memory Details"
            aria-label="View Memory"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
