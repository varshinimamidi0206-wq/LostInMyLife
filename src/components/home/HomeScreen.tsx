import React from 'react';
import { Camera, Image as ImageIcon, MessageSquare, ArrowRight, Sparkles, Eye, HelpCircle, Shield } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-28 md:pb-12">
      {/* 1. Header & Quick Value Proposition */}
      <div className="space-y-1.5 pt-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Private AI Physical Memory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          LostInMyLife
        </h1>
        <p className="text-sm sm:text-base text-gray-300 font-medium">
          "Your physical world, remembered."
        </p>
      </div>

      {/* 2. Hero Action Card - The Most Important Action First */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950/60 border border-gray-800/90 p-5 sm:p-8 shadow-glow">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Remember things you see in real life
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Snap a handbag, book, café, ticket, document, or place. Whenever you forget, just ask LostInMyLife.
            </p>
          </div>

          {/* Big Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => onNavigate('capture')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base flex items-center justify-center space-x-3 shadow-glow transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5 text-white" />
              <span>📷 Capture a Memory</span>
            </button>
            <p className="text-xs text-gray-400 pl-1">
              Take a photo of something you want to remember.
            </p>
          </div>

          {/* Two Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={onOpenPhotosImport}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gray-950/70 hover:bg-gray-800/90 border border-gray-800 hover:border-cyan-500/40 text-cyan-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>🖼 Import from Photos</span>
            </button>

            <button
              onClick={() => onNavigate('ask')}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gray-950/70 hover:bg-gray-800/90 border border-gray-800 hover:border-cyan-500/40 text-gray-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>💬 Ask My Memory</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Simple 3-Step How It Works (Consumer Friendly) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 flex-shrink-0 mt-0.5">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">1. Understand what you saw</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Snap a photo. The AI detects the item, location, date, and text automatically.
            </p>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 flex-shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">2. Ask your memories</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Ask questions like "Where did I see that café?" or "Have I seen these shoes before?".
            </p>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 flex-shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">3. 100% Private</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Only the things you intentionally capture or import are stored in your memory.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recent Memories Section */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Recent Memories
            </h2>
            <p className="text-xs text-gray-400">
              Things you've captured in the physical world
            </p>
          </div>

          {recentMemories.length > 0 && (
            <button
              onClick={() => onNavigate('memories')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 py-1 px-2 rounded-lg transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Memories List / Empty State */}
        {recentMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMemories.slice(0, 4).map(memory => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => onSelectMemory(memory)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl p-8 sm:p-10 text-center space-y-4 max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Your memories will appear here</h3>
              <p className="text-xs text-gray-400">
                Start by saving something you've seen in the physical world.
              </p>
            </div>
            <button
              onClick={() => onNavigate('capture')}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
            >
              📷 Save Your First Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
