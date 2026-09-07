import React, { useState } from 'react';
import { X, Shield, Trash2, RotateCcw, AlertTriangle, Check, Info } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllMemories: () => void;
  onResetDemo: () => void;
  memoryCount: number;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearAllMemories,
  onResetDemo,
  memoryCount,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    onClearAllMemories();
    setConfirmClear(false);
    setNotice('All memories and cached images on this device have been cleared.');
  };

  const handleReset = () => {
    onResetDemo();
    setNotice('Reloaded 8 diverse physical demo memories.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Privacy & Data
              </h3>
              <p className="text-xs text-gray-400">
                Your memories stay private
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-gray-800/80 text-gray-400 hover:text-white active:scale-90"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Privacy Statements (Per Section 18) */}
        <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-2xl text-xs text-gray-300 space-y-2.5 leading-relaxed">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
            <Info className="w-4 h-4" />
            <span>Privacy Principle</span>
          </div>
          <p className="font-medium text-white">
            "Your memories are private. You choose what to capture or import."
          </p>
          <p className="text-[11px] text-gray-400">
            <strong>For Google Photos:</strong> "You choose which photos to share with LostInMyLife." We never scan your broader photo library.
          </p>
          <p className="text-[11px] text-gray-400">
            <strong>AI Inference:</strong> Queries run through your configured Gemini endpoint or local AI model adapter. No data is used for model training.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
            <span>Stored memories on this device:</span>
            <span className="font-mono text-white font-bold">{memoryCount}</span>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-gray-700/60"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload 8 Physical Demo Memories</span>
          </button>

          {/* Clear All Memories */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-950/70 text-red-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-red-800/60"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Memories & Uploads</span>
            </button>
          ) : (
            <div className="p-3 bg-red-950/70 border border-red-700 rounded-xl space-y-2 text-center">
              <p className="text-xs text-red-200 flex items-center justify-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Erase all memories on this device?</span>
              </p>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
                >
                  Yes, Wipe Everything
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
