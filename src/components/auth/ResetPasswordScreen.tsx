import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Please choose a stronger password.');
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(newPassword);

    setIsLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('weak') || msg.includes('at least 6')) {
        setErrorMessage('Please choose a stronger password.');
      } else {
        setErrorMessage('Unable to reset your password. The link may have expired.');
      }
      return;
    }

    setSuccessMessage('Password updated successfully! Redirecting to home...');
    setTimeout(() => {
      navigate('/home', { replace: true });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Reset Card */}
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
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

        {/* Form Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white">Set new password</h2>
          <p className="text-xs text-gray-400">
            Choose a new, secure password for your account.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-start space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-start space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full min-h-[46px] px-4 py-2.5 pr-11 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                autoComplete="new-password"
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
                className="w-full min-h-[46px] px-4 py-2.5 pr-11 bg-gray-950/60 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
                autoComplete="new-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
