import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Sparkles, ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSubscreenTitle = (pathname: string) => {
    if (pathname.startsWith('/capture')) return 'Save a Memory';
    if (pathname.startsWith('/ask')) return 'Ask My Memory';
    if (pathname.startsWith('/memories')) return 'Memories';
    if (pathname.startsWith('/timeline')) return 'Memory Timeline';
    if (pathname.startsWith('/memory/')) return 'Memory Details';
    return null;
  };

  const subscreenTitle = getSubscreenTitle(location.pathname);
  const isHome = location.pathname === '/' || location.pathname === '/home';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur-xl border-b border-gray-800/60 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Brand or Back Arrow */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          {!isHome && subscreenTitle ? (
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-white hover:text-cyan-300 active:scale-95 transition-all py-1 pr-2"
              aria-label="Back"
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                {subscreenTitle}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-2.5" onClick={() => navigate('/home')}>
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

        {/* Desktop title context */}
        <div className="hidden lg:block">
          {!isHome && subscreenTitle && (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {subscreenTitle}
            </span>
          )}
        </div>

        {/* Right side controls (Desktop & Mobile) */}
        <div className="flex items-center space-x-2.5 ml-auto relative">
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

          {/* User Profile Avatar with Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/40 shadow-sm cursor-pointer select-none active:scale-95 transition-transform"
              aria-label="User Profile Menu"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{userName}</h4>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email || 'Authenticated Account'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
