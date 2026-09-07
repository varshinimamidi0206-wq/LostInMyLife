import React from 'react';
import { Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface TopNavProps {
  activeTab: NavigationTab;
  onNavigateHome: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenPrivacy: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onNavigateHome,
  demoMode,
  onToggleDemoMode,
  onOpenPrivacy,
}) => {
  const getSubscreenTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'capture':
        return 'Save a Memory';
      case 'ask':
        return 'Ask My Memory';
      case 'memories':
        return 'Memories';
      case 'studio':
        return 'Memory Timeline';
      default:
        return null;
    }
  };

  const subscreenTitle = getSubscreenTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur-xl border-b border-gray-800/60 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Brand or Back Arrow */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          {activeTab !== 'home' ? (
            <button
              onClick={onNavigateHome}
              className="flex items-center space-x-2 text-white hover:text-cyan-300 active:scale-95 transition-all py-1 pr-2"
              aria-label="Back to Home"
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                {subscreenTitle}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-cyan-500 to-blue-600 p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-gray-950/80 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                  LostInMyLife
                </h1>
                <p className="text-[10px] text-gray-400 font-medium">
                  Your physical world, remembered.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop space holder on left */}
        <div className="hidden lg:block">
          {activeTab !== 'home' && (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {subscreenTitle}
            </span>
          )}
        </div>

        {/* Right side controls (Desktop & Mobile) */}
        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Sample Data Toggle Pill */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              demoMode
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-glow-amber'
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

          {/* User Avatar (V) */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/40 shadow-sm cursor-pointer select-none">
            V
          </div>
        </div>
      </div>
    </header>
  );
};
