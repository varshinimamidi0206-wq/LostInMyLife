import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    async function handleOAuthCallback() {
      if (!isSupabaseConfigured || !supabase) {
        navigate('/login?error=not_configured', { replace: true });
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const authError = urlParams.get('error') || urlParams.get('error_description');

        if (authError) {
          console.error('OAuth URL error:', authError);
          setErrorText('Unable to complete Google sign-in. Redirecting to login...');
          setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1500);
          return;
        }

        // 1. If PKCE authorization code is in query string, exchange it for session
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session?.user) {
            navigate('/home', { replace: true });
            return;
          }
          if (error) {
            console.warn('PKCE exchange error, trying session fallback:', error.message);
          }
        }

        // 2. Check active session (recovering from URL hash tokens or cookies)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('OAuth Callback Session Error:', sessionError);
        }

        if (session && session.user) {
          navigate('/home', { replace: true });
          return;
        }

        // 3. Listen for asynchronous auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newSession?.user) {
            subscription.unsubscribe();
            navigate('/home', { replace: true });
          }
        });

        // Timeout fallback
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          navigate('/home', { replace: true });
        }, 3500);

        return () => clearTimeout(timeout);
      } catch (err: any) {
        console.error('OAuth Callback Exception:', err);
        setErrorText('Authentication failed. Redirecting to login...');
        setTimeout(() => navigate('/login?error=exception', { replace: true }), 1500);
      }
    }

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-cyan-500 to-blue-600 p-0.5 mx-auto shadow-glow flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-gray-950/80 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">LostInMyLife</h2>
          <p className="text-xs text-gray-400">
            {errorText || 'Completing sign in...'}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      </div>
    </div>
  );
};
