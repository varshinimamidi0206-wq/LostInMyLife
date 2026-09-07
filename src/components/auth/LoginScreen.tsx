import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { user, signInWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check URL query parameters for error message from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error') || params.get('error_description');
    if (err) {
      setErrorMessage('Unable to sign in with Google. Please try again.');
    }
  }, [location]);

  // If already logged in, redirect to /home or intended destination
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);

    const { error } = await signInWithGoogle();
    if (error) {
      setIsSigningIn(false);
      setErrorMessage('Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-7 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-cyan-500 to-blue-600 p-0.5 mx-auto shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-gray-950/80 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              LostInMyLife
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Your physical world, remembered.
            </p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center space-y-1 pt-1">
          <h2 className="text-lg font-bold text-white">Welcome back</h2>
          <p className="text-xs text-gray-400">
            Sign in to access your private memories.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-start space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">{errorMessage}</span>
              <span className="text-[11px] text-red-400">Please try again.</span>
            </div>
          </div>
        )}

        {/* Supabase Not Configured Warning (Helpful for setup) */}
        {!isConfigured && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-300 space-y-1">
            <span className="font-semibold block">Supabase Connection Required:</span>
            <p className="text-[11px] text-amber-400/90 leading-relaxed">
              Add your <code className="bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code className="bg-black/40 px-1 py-0.5 rounded">.env</code> to connect real Google authentication.
            </p>
          </div>
        )}

        {/* Primary Action Button: Official Google Sign-In */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full min-h-[50px] py-3.5 px-5 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 text-gray-900 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' SVG Logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy Assurance Footer */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your memories are private and linked to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
