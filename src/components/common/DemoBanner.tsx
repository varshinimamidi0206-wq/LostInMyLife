import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface DemoBannerProps {
  onQuickAsk: (question: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onQuickAsk, onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-cyan-950/40 via-gray-900 to-amber-950/40 border-b border-cyan-500/30 px-3 sm:px-4 py-2 text-xs text-gray-300">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-semibold text-cyan-300">
            Sample Memories Active:
          </span>
          <span className="hidden sm:inline text-gray-400">
            Realistic memories loaded for testing.
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              onNavigate('ask');
              onQuickAsk('Where did I see that blue handbag?');
            }}
            className="min-h-[34px] px-3 py-1 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-[11px] font-semibold flex items-center space-x-1.5 transition-colors active:scale-95"
          >
            <span>Ask: "Where did I see that blue handbag?"</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
