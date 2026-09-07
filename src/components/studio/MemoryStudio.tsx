import React from 'react';
import {
  Layers,
  Smartphone,
  Laptop,
  Sparkles,
  MapPin,
  Calendar,
  Activity,
  CheckCircle2,
  ArrowRight,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryStudioProps {
  memories: Memory[];
  onSelectMemory: (mem: Memory) => void;
  onNavigateCapture: () => void;
  onOpenPhotosImport: () => void;
}

export const MemoryStudio: React.FC<MemoryStudioProps> = ({
  memories,
  onSelectMemory,
  onNavigateCapture,
  onOpenPhotosImport,
}) => {
  // Aggregate statistics
  const totalMemories = memories.length;
  const categories = Array.from(new Set(memories.map(m => m.category).filter(Boolean)));
  const locations = Array.from(new Set(memories.map(m => m.location).filter(Boolean)));

  // Source counts
  const cameraCount = memories.filter(m => m.source === 'camera').length;
  const uploadCount = memories.filter(m => m.source === 'upload').length;
  const googlePhotosCount = memories.filter(m => m.source === 'google_photos' || m.is_imported).length;
  const demoCount = memories.filter(m => m.source === 'demo' || m.is_demo).length;

  // Types distribution
  const typeCounts = memories.reduce((acc: Record<string, number>, m) => {
    const t = m.memory_type || 'object';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Sorted timeline
  const sortedTimeline = [...memories].sort(
    (a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline Overview</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Memory Timeline
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Browse your physical memories in chronological order.
          </p>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center space-x-3 bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-3 shadow-glow">
          <div className="flex items-center space-x-2 text-xs">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300">Mobile</span>
            <span className="text-cyan-400 font-bold">↔</span>
            <Laptop className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">Computer</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            Synced
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Memories</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalMemories}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Physical world synced</span>
          </p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Places Remembered</span>
            <MapPin className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {locations.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {locations[0] ? locations[0].split(',')[0] : 'Saved locations'}
          </p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Memory Categories</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {categories.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {categories.slice(0, 2).join(', ') || 'Various'}
          </p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Google Photos Imported</span>
            <ImageIcon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {googlePhotosCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            User-selected photos
          </p>
        </div>
      </div>

      {/* Memory Sources Section (Section 13 Requirement) */}
      <div className="bg-gray-900/50 border border-gray-800/90 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Memory Sources
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">
            How physical memories entered your archive
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{cameraCount}</span>
              <span className="text-[11px] text-gray-400">Camera Snaps</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{uploadCount}</span>
              <span className="text-[11px] text-gray-400">Direct Uploads</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 text-rose-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{googlePhotosCount}</span>
              <span className="text-[11px] text-gray-400">Google Photos</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{demoCount}</span>
              <span className="text-[11px] text-gray-400">Demo Seeded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Timeline + Connected Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800/90 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Chronological Memory Stream
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Timeline view
            </span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
            {sortedTimeline.map(mem => {
              const dateObj = new Date(mem.captured_at);
              const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const day = dateObj.getDate();
              const title = mem.title || mem.object_name || 'Physical Memory';

              return (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem)}
                  className="relative flex items-start space-x-4 group cursor-pointer"
                >
                  {/* Timeline Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gray-950 border border-gray-800 group-hover:border-cyan-500/50 flex flex-col items-center justify-center flex-shrink-0 z-10 transition-colors shadow-sm">
                    <span className="text-[9px] font-bold text-cyan-400 tracking-wider">
                      {month}
                    </span>
                    <span className="text-sm font-black text-white font-mono">
                      {day}
                    </span>
                  </div>

                  {/* Card item */}
                  <div className="flex-1 bg-gray-950/60 hover:bg-gray-900 border border-gray-800 group-hover:border-cyan-500/30 rounded-2xl p-3.5 flex items-center space-x-3.5 transition-all">
                    <img
                      src={mem.image_url}
                      alt={title}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-800 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate">
                          {title}
                        </h4>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                          {mem.memory_type || 'object'}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 flex items-center space-x-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{mem.location || mem.place_name || 'Physical World'}</span>
                      </p>

                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-1">
                        {mem.summary || mem.description}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Synchronization & Types Breakdown */}
        <div className="space-y-4">
          {/* Memory Types Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800/80 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Memory Classification</span>
            </h4>

            <div className="space-y-2 text-xs">
              {Object.entries(typeCounts).map(([typeName, count]) => (
                <div key={typeName} className="flex items-center justify-between text-gray-300 py-1 border-b border-gray-800/50">
                  <span className="capitalize">{typeName}s</span>
                  <span className="font-mono text-cyan-400 font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Architecture Card */}
          <div className="bg-gradient-to-tr from-gray-900 via-gray-900/90 to-cyan-950/40 border border-cyan-500/20 rounded-3xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Phone ↔ Computer Sync
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              LostInMyLife keeps all your physical memories synchronized between your mobile device and your computer.
            </p>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onOpenPhotosImport}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 border border-cyan-500/30"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Import from Google Photos</span>
              </button>

              <button
                onClick={onNavigateCapture}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow transition-colors"
              >
                + Capture New Memory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
