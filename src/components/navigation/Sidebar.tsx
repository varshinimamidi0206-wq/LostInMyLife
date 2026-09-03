import React from 'react';
import { Home, Camera, Sparkles, HelpCircle, Layers, Shield, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenPrivacy: () => void;
  onOpenPhotosImport?: () => void;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenPrivacy,
  onOpenPhotosImport,
  memoryCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'capture', label: 'Capture Memory', icon: Camera },
    { id: 'memories', label: 'Memories', icon: Sparkles, badge: memoryCount > 0 ? String(memoryCount) : undefined },
    { id: 'ask', label: 'Ask My Memory', icon: HelpCircle },
    { id: 'studio', label: 'Memory Studio', icon: Layers },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-gray-950/80 backdrop-blur-xl border-r border-gray-800/80 p-5 h-screen sticky top-0 justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => onTabChange('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              LostInMyLife
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">
              Physical Memory System
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/40 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Import from Photos Action Button */}
          {onOpenPhotosImport && (
            <button
              onClick={onOpenPhotosImport}
              className="w-full mt-2 flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Import from Photos</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer / Connected Device Architecture Status */}
      <div className="space-y-3 pt-4 border-t border-gray-800/60">
        {/* Office Kit Ready Architecture Preview */}
        <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span className="flex items-center space-x-1.5 font-medium text-gray-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phone ↔ Studio</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Active Sync
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Prototype architecture ready for laptop & mobile sync.
          </p>
        </div>

        {/* Privacy button */}
        <button
          onClick={onOpenPrivacy}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>🔒 Your memories are private</span>
          </span>
          <span className="text-[10px] text-gray-400">Settings</span>
        </button>
      </div>
    </aside>
  );
};
