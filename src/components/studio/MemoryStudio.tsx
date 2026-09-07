import React from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryStudioProps {
  memories: Memory[];
  onSelectMemory: (mem: Memory) => void;
  onNavigateCapture: () => void;
}

export const MemoryStudio: React.FC<MemoryStudioProps> = ({
  memories,
  onSelectMemory,
  onNavigateCapture,
}) => {
  // Chronologically sorted memories (newest first)
  const sortedTimeline = [...memories].sort(
    (a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Memory Timeline
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse your physical memories in chronological order.
          </p>
        </div>

        <button
          onClick={onNavigateCapture}
          className="self-start sm:self-auto min-h-[42px] px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-glow flex items-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Save Memory</span>
        </button>
      </div>

      {/* Clean Vertical Timeline */}
      <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-5 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 pb-2 border-b border-gray-800/80">
          <Clock className="w-4 h-4" />
          <span>Chronological Timeline</span>
        </div>

        {sortedTimeline.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/80 before:via-blue-500/40 before:to-gray-800">
            {sortedTimeline.map((mem) => {
              const dateObj = new Date(mem.captured_at);
              const formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              const title = mem.title || mem.object_name || 'Physical Memory';
              const locationText = mem.location || mem.place_name || 'Saved location';

              return (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-950 border-2 border-cyan-400 group-hover:scale-125 group-hover:bg-cyan-400 transition-all shadow-glow flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:bg-gray-950 transition-colors" />
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800/90 group-hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm">
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center space-x-4 min-w-0">
                      <img
                        src={mem.image_url}
                        alt={title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />

                      <div className="space-y-1 min-w-0">
                        {/* Date */}
                        <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>

                        {/* Memory Name */}
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center space-x-1.5 text-xs text-gray-400 truncate">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span className="truncate text-gray-300">{locationText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arrow button */}
                    <div className="self-end sm:self-center flex items-center space-x-1 text-xs text-gray-400 group-hover:text-cyan-400 font-medium transition-colors">
                      <span className="hidden sm:inline">Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-gray-400">No memories in your timeline yet.</p>
            <button
              onClick={onNavigateCapture}
              className="px-6 py-2.5 rounded-full bg-cyan-600 text-white font-bold text-xs"
            >
              Save a Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
