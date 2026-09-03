import React, { useState } from 'react';
import { X, MapPin, Calendar, Tag, Sparkles, Trash2, Layers, Image as ImageIcon, Users } from 'lucide-react';
import { Memory } from '../../types/memory';
import { MemoryConnections } from './MemoryConnections';

interface MemoryDetailModalProps {
  memory: Memory | null;
  allMemories: Memory[];
  onClose: () => void;
  onDeleteMemory: (id: string) => void;
  onSelectMemory: (mem: Memory) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  allMemories,
  onClose,
  onDeleteMemory,
  onSelectMemory,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'connections'>('details');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!memory) return null;

  const title = memory.title || memory.object_name || 'Physical Memory';
  const type = memory.memory_type || 'object';

  const dateFormatted = memory.captured_at
    ? new Date(memory.captured_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recorded Date';

  // Related memories: same type or location or category
  const relatedMemories = allMemories.filter(
    m =>
      m.id !== memory.id &&
      (m.memory_type === memory.memory_type ||
        (memory.location && m.location?.toLowerCase().includes(memory.location.split(',')[0].toLowerCase())) ||
        (memory.category && m.category === memory.category))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto relative">
        {/* Header / Hero Image */}
        <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full bg-black">
          <img
            src={memory.image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/60 pointer-events-none" />

          {/* Close button */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-950/80 text-gray-300 hover:text-white backdrop-blur-md border border-gray-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Pill */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md uppercase tracking-wider">
              {type}
            </span>
            {memory.source === 'google_photos' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-950/90 text-gray-300 border border-gray-700 flex items-center space-x-1">
                <ImageIcon className="w-3 h-3 text-cyan-400" />
                <span>Google Photos</span>
              </span>
            )}
          </div>

          {/* Confidence indicator */}
          <div className="absolute bottom-4 right-4 bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-gray-800 flex items-center space-x-1.5 text-xs text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Confidence: {Math.round((memory.confidence || 0.95) * 100)}%</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Main Title & Optional Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {title}
              </h2>
              {memory.summary && (
                <p className="text-xs sm:text-sm text-cyan-300/90 mt-1 font-medium leading-relaxed">
                  {memory.summary}
                </p>
              )}
            </div>

            {memory.price && (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 self-start sm:self-auto shadow-sm">
                <Tag className="w-4 h-4 mr-1.5" />
                <span className="text-base font-bold font-mono">₹{memory.price}</span>
              </div>
            )}
          </div>

          {/* Metadata Badges: Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Location Recorded
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {memory.location || memory.place_name || 'Physical World'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
              <div className="p-2 rounded-xl bg-blue-950 text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Date Observed
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {dateFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs: Details vs Connections */}
          <div className="flex border-b border-gray-800 space-x-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Visual Memory Details
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
                activeTab === 'connections'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Context Connections</span>
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Visual Context Description
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-950/40 p-3.5 rounded-2xl border border-gray-800/80">
                  {memory.description || 'Captured physical memory.'}
                </p>
              </div>

              {/* People & Atmosphere Context */}
              {memory.people_context && memory.people_context.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-pink-400" />
                    <span>Social / Situational Context</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.people_context.map((p, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs bg-pink-950/40 text-pink-300 border border-pink-800/40"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Visible Text */}
              {memory.visible_text && memory.visible_text.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Visible Text Detected
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.visible_text.map((text, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs bg-gray-950 text-gray-300 border border-gray-800 font-mono"
                      >
                        "{text}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Important details */}
              {memory.important_details && memory.important_details.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Important Attributes
                  </h4>
                  <ul className="space-y-1.5">
                    {memory.important_details.map((detail, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start space-x-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <MemoryConnections memory={memory} />
          )}

          {/* Related Memories */}
          {relatedMemories.length > 0 && (
            <div className="pt-2 border-t border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Related Physical Memories
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {relatedMemories.slice(0, 3).map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectMemory(rel)}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-gray-950/60 border border-gray-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
                  >
                    <img
                      src={rel.image_url}
                      alt={rel.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{rel.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{rel.location || rel.place_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete Action Footer */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-mono">
              Source: {memory.source || 'camera'}
            </span>

            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Memory</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-red-300">Are you sure?</span>
                <button
                  onClick={() => {
                    onDeleteMemory(memory.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:text-white"
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
