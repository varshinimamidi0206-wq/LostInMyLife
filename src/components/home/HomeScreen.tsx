import React from 'react';
import { Camera, Image as ImageIcon, HelpCircle, ArrowRight, ShieldCheck, Eye, Search } from 'lucide-react';
import { Memory, NavigationTab } from '../../types/memory';
import { MemoryCard } from '../memories/MemoryCard';

interface HomeScreenProps {
  recentMemories: Memory[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectMemory: (memory: Memory) => void;
  onOpenPhotosImport: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentMemories,
  onNavigate,
  onSelectMemory,
  onOpenPhotosImport,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-24 md:pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-cyan-950/50 border border-gray-800 p-6 sm:p-10 shadow-glow">
        {/* Glow backdrop decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Private AI Memory for the Physical World</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Remember the world around you.
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Capture anything you don't want to forget. Later, ask where, when, or what you saw.
            Your phone remembers the things your brain forgets.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('capture')}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-glow transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>+ Capture Memory</span>
            </button>

            <button
              onClick={onOpenPhotosImport}
              className="px-5 py-3.5 rounded-2xl bg-gray-900/90 hover:bg-gray-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Import from Photos</span>
            </button>

            <button
              onClick={() => onNavigate('ask')}
              className="px-5 py-3.5 rounded-2xl bg-gray-900/70 hover:bg-gray-800 border border-gray-700/80 text-gray-200 hover:text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Ask My Memory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Visual Memory</h4>
            <p className="text-[11px] text-gray-400">Understand objects, places, documents and experiences.</p>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Grounded Recall</h4>
            <p className="text-[11px] text-gray-400">Get answers linked directly to your saved memories.</p>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Privacy First</h4>
            <p className="text-[11px] text-gray-400">Only memories you choose to save are remembered.</p>
          </div>
        </div>
      </div>

      {/* Recent Memories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Recent Memories
            </h2>
            <p className="text-xs text-gray-400">
              Objects, places, documents, and moments you've observed
            </p>
          </div>

          <button
            onClick={() => onNavigate('memories')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Memories Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {recentMemories.slice(0, 4).map(memory => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onClick={() => onSelectMemory(memory)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
