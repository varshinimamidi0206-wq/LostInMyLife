import React from 'react';
import { Home, Camera, Sparkles, HelpCircle, Layers } from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/85 backdrop-blur-xl border-t border-gray-800/80 px-3 py-2 pb-safe shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-cyan-400 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        <button
          onClick={() => onTabChange('memories')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            activeTab === 'memories'
              ? 'text-cyan-400 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Memories"
        >
          <Sparkles className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'memories' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Memories</span>
        </button>

        {/* Center Prominent Capture Button */}
        <div className="relative -top-4">
          <button
            onClick={() => onTabChange('capture')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-glow ${
              activeTab === 'capture'
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 ring-4 ring-cyan-400/30 scale-105'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:scale-105'
            }`}
            aria-label="Capture Memory"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        <button
          onClick={() => onTabChange('ask')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            activeTab === 'ask'
              ? 'text-cyan-400 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Ask Memory"
        >
          <HelpCircle className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'ask' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Ask</span>
        </button>

        <button
          onClick={() => onTabChange('studio')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            activeTab === 'studio'
              ? 'text-cyan-400 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Studio"
        >
          <Layers className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'studio' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Studio</span>
        </button>
      </div>
    </nav>
  );
};
