import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Eye, CheckCircle2 } from 'lucide-react';

interface LoadingOverlayProps {
  stage: 'analyzing' | 'extracting' | 'saving' | 'complete' | null;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ stage }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (stage === 'analyzing') setCurrentStep(1);
    else if (stage === 'extracting') setCurrentStep(2);
    else if (stage === 'saving') setCurrentStep(3);
    else if (stage === 'complete') setCurrentStep(4);
  }, [stage]);

  if (!stage) return null;

  const steps = [
    { id: 1, text: 'Looking at your memory...', icon: Eye },
    { id: 2, text: 'Finding important details...', icon: Sparkles },
    { id: 3, text: 'Saving to your physical memory...', icon: Brain },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-xs w-full bg-gray-900/90 border border-gray-800 rounded-3xl p-6 text-center shadow-glow">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-glow mb-5 relative">
          <Brain className="w-8 h-8 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></span>
        </div>

        <h3 className="text-base font-bold text-white mb-4">
          Structuring Physical Memory
        </h3>

        {/* Step Progression */}
        <div className="space-y-3 text-left mb-4">
          {steps.map(step => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 text-xs transition-colors duration-300 ${
                  isCurrent
                    ? 'text-cyan-300 font-semibold'
                    : isDone
                    ? 'text-gray-400 font-normal'
                    : 'text-gray-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                )}
                <span>{step.text}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-gray-500 font-mono">
          Private AI Vision • Powered by Gemini
        </p>
      </div>
    </div>
  );
};
