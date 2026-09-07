import React from 'react';
import {
  Home,
  Camera,
  Layers,
  HelpCircle,
  Clock,
  Shield,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../../types/memory';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenPrivacy: () => void;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenPrivacy,
  memoryCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'capture', label: 'Capture Memory', icon: Camera },
    { id: 'memories', label: 'Memories', icon: Layers, badge: memoryCount > 0 ? String(memoryCount) : undefined },
    { id: 'ask', label: 'Ask My Memory', icon: HelpCircle },
    { id: 'studio', label: 'Memory Timeline', icon: Clock },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-gray-950/90 backdrop-blur-xl border-r border-gray-800/80 p-5 h-screen sticky top-0 justify-between z-30 select-none">
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center space-x-3 mb-8 cursor-pointer group"
          onClick={() => onTabChange('home')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-cyan-500 to-blue-600 p-0.5 shadow-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-gray-950/80 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              LostInMyLife
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">
              Your physical world, remembered.
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5" aria-label="Main Desktop Navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
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
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="space-y-3 pt-4 border-t border-gray-800/60">
        <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1.5">
            <span className="flex items-center space-x-1.5 font-semibold text-white">
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phone ↔ Laptop</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Active Sync
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Your memories stay synced across your devices.
          </p>
        </div>

        {/* Privacy button */}
        <button
          onClick={onOpenPrivacy}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Your memories are private</span>
          </span>
          <span className="text-[10px] text-gray-400 hover:text-cyan-300 font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};
