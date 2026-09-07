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
        <div className="flex items-center space-x-2.5 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">LostInMyLife</h1>
            <p className="text-[11px] text-gray-400 font-medium">Your physical world, remembered</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              demoMode
                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
            title="Toggle Demo Mode with sample memories"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{demoMode ? 'Sample Data' : 'Live Data'}</span>
          </button>

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors active:scale-95"
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
