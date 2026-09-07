import React, { useState } from 'react';
import { X, MapPin, Calendar, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryDetailModalProps {
  memory: Memory | null;
  allMemories: Memory[];
  onClose: () => void;
  onDeleteMemory: (id: string) => void;
  onSelectMemory: (mem: Memory) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  onClose,
  onDeleteMemory,
  onSelectMemory: _onSelectMemory,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!memory) return null;

  const title = memory.title || memory.object_name || 'Physical Memory';
  const locationText = memory.location || memory.place_name || 'Physical World';

  const dateFormatted = memory.captured_at
    ? new Date(memory.captured_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recorded Date';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-auto relative max-h-[92vh] flex flex-col">
        {/* Modal Top Header with Back Arrow / Title / Close */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/80 bg-gray-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-800 text-gray-300 hover:text-white transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm text-white">Memory Details</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Main Photo */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-gray-800">
            <img
              src={memory.image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Core Metadata */}
          <div className="space-y-2 pb-4 border-b border-gray-800">
            <div className="flex items-center space-x-2 text-white">
              <ShoppingBag className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-300 pt-1">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{locationText}</span>
              </div>

              <div className="flex items-center space-x-1.5 font-mono text-gray-400">
                <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>{dateFormatted}</span>
              </div>
            </div>
          </div>

          {/* About this memory section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              About this memory
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-950/60 p-4 rounded-2xl border border-gray-800/80">
              {memory.summary || memory.description || `A ${title.toLowerCase()} you saw at ${locationText} on ${dateFormatted}.`}
            </p>
          </div>

          {/* Optional Details (Price, Brand, Text) */}
          {(memory.brand || memory.price || (memory.visible_text && memory.visible_text.length > 0)) && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Detected Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {memory.brand && (
                  <div className="p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Brand</span>
                    <span className="font-semibold text-gray-200">{memory.brand}</span>
                  </div>
                )}
                {memory.price && (
                  <div className="p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Price</span>
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Memory</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-red-300">Delete this memory?</span>
                <button
                  onClick={() => {
                    onDeleteMemory(memory.id);
                    onClose();
                  }}
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
    </div>
  );
};
