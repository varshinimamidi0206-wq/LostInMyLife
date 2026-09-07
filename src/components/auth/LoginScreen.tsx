import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AuthMode = 'signin' | 'signup' | 'forgot';

export const LoginScreen: React.FC = () => {
  const {
    user,
    signInWithGoogle,
    signInWithPassword,
    signUp,
    resetPasswordForEmail,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Check URL query parameters for error message from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error') || params.get('error_description');
    if (err) {
      setErrorMessage('Unable to sign in with Google. Please try again.');
    }
  }, [location]);

  // If already authenticated, redirect to /home or intended destination
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setInfoMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const getFriendlyErrorMessage = (raw: any): string => {
    if (!raw) return 'An error occurred. Please try again.';
    const msg = (typeof raw === 'string' ? raw : raw.message || '').toLowerCase();

    if (
      msg.includes('invalid login credentials') ||
      msg.includes('invalid credentials') ||
      msg.includes('user not found') ||
      msg.includes('wrong password') ||
      msg.includes('invalid email or password')
    ) {
      return 'Email or password is incorrect.';
    }
    if (
      msg.includes('already registered') ||
      msg.includes('user already registered') ||
      msg.includes('already exists')
    ) {
      return 'This email is already registered. Please sign in.';
    }
    if (
      msg.includes('password should be') ||
      msg.includes('weak password') ||
      msg.includes('at least 6 characters') ||
      msg.includes('security requirement')
    ) {
      return 'Please choose a stronger password.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Too many attempts. Please wait a few moments and try again.';
    }
    return 'Unable to process your request. Please try again.';
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      setErrorMessage('Unable to sign in with Google. Please try again.');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await signInWithPassword(email, password);

    setIsLoading(false);

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return;
    }

    if (data?.session) {
      const from = (location.state as any)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Please choose a stronger password.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await signUp(email, password);

    setIsLoading(false);

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return;
    }

    // If confirmation is required, Supabase returns user without session
    if (data?.user && !data?.session) {
      setInfoMessage('Account created. Please check your email to verify your account.');
    } else if (data?.session) {
      // Auto logged in
      navigate('/home', { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    const { error } = await resetPasswordForEmail(email);

    setIsLoading(false);

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return;
    }

    setInfoMessage('Check your email for the password reset link.');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-cyan-500 to-blue-600 p-0.5 mx-auto shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-gray-950/80 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
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

        {/* Subheader based on mode */}
        <div className="text-center space-y-1 pt-1">
          {mode === 'signin' && (
            <>
              <h2 className="text-lg font-bold text-white">Welcome back</h2>
              <p className="text-xs text-gray-400">
                Sign in to access your private memories.
              </p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-lg font-bold text-white">Create your account</h2>
              <p className="text-xs text-gray-400">
                Start remembering the physical world around you.
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-lg font-bold text-white">Reset your password</h2>
              <p className="text-xs text-gray-400">
                Enter your email address to receive a recovery link.
              </p>
            </>
          )}
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-start space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Inline Info / Success Message */}
        {infoMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-start space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {/* MODE 1: SIGN IN */}
        {mode === 'signin' && (
          <div className="space-y-4">
            {/* 1. Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full min-h-[48px] py-3 px-4 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm flex items-center justify-center space-x-3 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gray-900 animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google 'G' SVG Logo */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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

            {/* 2. Divider: ────────  OR  ──────── */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-gray-800 flex-grow" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3">
                OR
              </span>
              <div className="border-t border-gray-800 flex-grow" />
            </div>

            {/* Email / Password Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* 3. Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full min-h-[46px] px-4 py-2.5 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* 4. Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full min-h-[46px] px-4 py-2.5 pr-11 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-md transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-gray-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* 5. Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full min-h-[48px] py-3 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* 6. Footer: Don't have an account? Create account */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors ml-1"
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full min-h-[46px] px-4 py-2.5 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full min-h-[46px] px-4 py-2.5 pr-11 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-md transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full min-h-[46px] px-4 py-2.5 pr-11 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-md transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            {/* Footer: Already have an account? Sign in */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* MODE 3: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full min-h-[46px] px-4 py-2.5 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending link...</span>
                </>
              ) : (
                <span>Send reset link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Privacy Note */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your memories are private and linked to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
