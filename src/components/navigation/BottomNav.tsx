import React from 'react';
import { Home, Camera, Layers, HelpCircle } from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-2xl border-t border-gray-800/80 px-3 py-2 pb-safe shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[50px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-gray-400 hover:text-gray-200 active:scale-95'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'home' ? 'scale-110 text-cyan-400' : ''}`} />
          <span className="text-[11px] font-medium tracking-tight">Home</span>
        </button>

        {/* 2. Prominent Center Capture Button */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => onTabChange('capture')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-glow active:scale-95 ${
              activeTab === 'capture'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 ring-4 ring-cyan-400/40 scale-105 shadow-cyan-500/50'
                : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 hover:scale-105 shadow-lg shadow-cyan-500/25'
            }`}
            aria-label="Capture Memory"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <span className={`text-[10px] mt-1 font-semibold tracking-tight ${
            activeTab === 'capture' ? 'text-cyan-400' : 'text-gray-400'
          }`}>
            Capture
          </span>
        </div>

        {/* 3. Memories */}
        <button
          onClick={() => onTabChange('memories')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[50px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            activeTab === 'memories'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-gray-400 hover:text-gray-200 active:scale-95'
          }`}
          aria-label="Memories"
        >
          <Layers className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'memories' ? 'scale-110 text-cyan-400' : ''}`} />
          <span className="text-[11px] font-medium tracking-tight">Memories</span>
        </button>

        {/* 4. Ask */}
        <button
          onClick={() => onTabChange('ask')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[50px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            activeTab === 'ask'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-gray-400 hover:text-gray-200 active:scale-95'
          }`}
          aria-label="Ask Memory"
        >
          <HelpCircle className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'ask' ? 'scale-110 text-cyan-400' : ''}`} />
          <span className="text-[11px] font-medium tracking-tight">Ask</span>
        </button>
      </div>
    </nav>
  );
};
