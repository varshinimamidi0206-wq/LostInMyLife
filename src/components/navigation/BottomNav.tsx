import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, Layers, HelpCircle } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/capture', label: 'Capture', icon: Camera, isCenter: true },
    { path: '/memories', label: 'Memories', icon: Layers },
    { path: '/ask', label: 'Ask', icon: HelpCircle },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-2xl border-t border-gray-800/80 px-3 py-2 pb-safe shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/memories' && location.pathname.startsWith('/memory/'));

          if (item.isCenter) {
            return (
              <div key={item.path} className="flex flex-col items-center justify-center -mt-6">
                <button
                  onClick={() => {
                    navigate(item.path);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-glow active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 ring-4 ring-cyan-400/40 scale-105 shadow-cyan-500/50'
                      : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 hover:scale-105 shadow-lg shadow-cyan-500/25'
                  }`}
                  aria-label="Capture Memory"
                >
                  <Icon className="w-6 h-6 text-white" />
                </button>
                <span className={`text-[10px] mt-1 font-semibold tracking-tight ${
                  isActive ? 'text-cyan-400' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[50px] py-1 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 font-bold bg-cyan-950/40'
                  : 'text-gray-400 hover:text-gray-200 active:scale-95'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
