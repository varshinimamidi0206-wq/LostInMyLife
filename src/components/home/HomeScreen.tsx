import React from 'react';
import { Camera, Search, Shield, ArrowRight } from 'lucide-react';
import { Memory, NavigationTab } from '../../types/memory';
import { MemoryCard } from '../memories/MemoryCard';

interface HomeScreenProps {
  recentMemories: Memory[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectMemory: (memory: Memory) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentMemories,
  onNavigate,
  onSelectMemory,
}) => {
  const displayMemories = recentMemories.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 pb-28 md:pb-12">
      {/* 1. Hero Section with Majestic Mountain Landscape Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-800/90 shadow-2xl bg-gray-950">
        {/* Mountain Landscape Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Scenic mountain landscape"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Remember the world <br />
            <span className="text-cyan-400">around you.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed max-w-lg">
            Save something you've seen. Find it again when you need it.
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('capture')}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2.5 shadow-glow transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Save a Memory</span>
            </button>

            <button
              onClick={() => onNavigate('ask')}
              className="px-6 py-3.5 rounded-full bg-gray-900/80 hover:bg-gray-800/90 text-gray-200 hover:text-white border border-gray-700/80 hover:border-cyan-500/50 font-semibold text-sm flex items-center justify-center space-x-2.5 backdrop-blur-md transition-all active:scale-95"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Ask My Memory</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Clean Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-start space-x-4 shadow-sm hover:border-cyan-500/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Camera className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Understand what you saw</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We look at your photo and find the important details.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-start space-x-4 shadow-sm hover:border-cyan-500/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Search your memories</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Find places, objects, or things you saw before.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-start space-x-4 shadow-sm hover:border-cyan-500/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">100% Private</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your memories stay on your device and are never shared.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recent Memories Section */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Recent Memories
            </h2>
            <p className="text-xs text-gray-400">
              Your saved memories will appear here.
            </p>
          </div>

          {recentMemories.length > 0 && (
            <button
              onClick={() => onNavigate('memories')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 py-1 px-2.5 rounded-lg hover:bg-cyan-950/40 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Memories Display: Desktop Horizontal Cards / Mobile Compact Stack */}
        {displayMemories.length > 0 ? (
          <>
            {/* Desktop horizontal row (hidden on mobile) */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
              {displayMemories.map(memory => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => onSelectMemory(memory)}
                  variant="card"
                />
              ))}
            </div>

            {/* Mobile vertical list (shown only on small screens) */}
            <div className="sm:hidden space-y-2.5">
              {displayMemories.map(memory => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => onSelectMemory(memory)}
                  variant="compact"
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl p-8 sm:p-10 text-center space-y-4 max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No memories yet.</h3>
              <p className="text-xs text-gray-400">
                Save something you've seen and it will appear here.
              </p>
            </div>
            <button
              onClick={() => onNavigate('capture')}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
            >
              Save a Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
