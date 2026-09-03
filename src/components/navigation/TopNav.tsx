import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface TopNavProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenPrivacy: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  demoMode,
  onToggleDemoMode,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand on mobile */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-base">🧠</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">LostInMyLife</h1>
            <p className="text-[10px] text-gray-400">Search physical memories</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              demoMode
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                : 'bg-gray-800/60 text-gray-400 border border-gray-700/60'
            }`}
            title="Toggle Demo Mode with pre-loaded realistic Indian memories"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{demoMode ? 'Demo Mode Active' : 'Live Mode'}</span>
          </button>

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-900/60 transition-colors"
            title="Privacy & Data Settings"
            aria-label="Privacy Settings"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
