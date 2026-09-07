import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Trash2, ShoppingBag } from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryDetailPageProps {
  memories: Memory[];
  onDeleteMemory: (id: string) => void;
}

export const MemoryDetailPage: React.FC<MemoryDetailPageProps> = ({
  memories,
  onDeleteMemory,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const memory = memories.find(m => m.id === id);

  const handleBack = () => {
    // Navigate back in history if possible, else fallback to /memories
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/memories');
    }
  };

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center space-y-4 py-16">
        <h2 className="text-xl font-bold text-white">Memory Not Found</h2>
        <p className="text-xs text-gray-400">
          This physical memory may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate('/memories')}
          className="px-5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
        >
          Back to Memories
        </button>
      </div>
    );
  }

  const title = memory.title || memory.object_name || 'Physical Memory';
  const locationText = memory.location || memory.place_name || 'Location unavailable';
  const dateFormatted = memory.captured_at
    ? new Date(memory.captured_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Date unavailable';

  const handleDelete = () => {
    onDeleteMemory(memory.id);
    navigate('/memories', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-12 animate-fade-in">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white py-1.5 px-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-cyan-500/40 transition-colors text-xs font-semibold active:scale-95"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back</span>
        </button>

        <span className="text-xs text-gray-400 font-medium">
          Memory Details
        </span>
      </div>

      {/* Main Photo Card */}
      <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
        <img
          src={memory.image_url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details Card */}
      <div className="bg-gray-900/60 border border-gray-800/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm">
        {/* Title & Core Meta */}
        <div className="space-y-2 pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-300 pt-2">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{locationText}</span>
            </div>

            <div className="flex items-center space-x-1.5 font-mono text-cyan-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        {/* About this memory section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            About this memory
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-950/60 p-4 rounded-2xl border border-gray-800/80">
            {memory.summary || memory.description || `A ${title.toLowerCase()} you saw at ${locationText} on ${dateFormatted}.`}
          </p>
        </div>

        {/* Optional details (price, brand) */}
        {(memory.brand || memory.price) && (
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {memory.brand && (
                <div className="p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-500 block font-semibold uppercase">Brand</span>
                  <span className="font-semibold text-gray-200">{memory.brand}</span>
                </div>
              )}
              {memory.price && (
                <div className="p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-500 block font-semibold uppercase">Price</span>
                  <span className="font-semibold text-emerald-400 font-mono">₹{memory.price}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Action Footer */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Saved Physical Memory
          </span>

          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Memory</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-300">Delete this memory?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
