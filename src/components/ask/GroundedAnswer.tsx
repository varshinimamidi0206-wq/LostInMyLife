import React from 'react';
import { Sparkles, MapPin, Calendar, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AskMemoryResponse, Memory } from '../../types/memory';

interface GroundedAnswerProps {
  question: string;
  response: AskMemoryResponse | null;
  onSelectMemory: (mem: Memory) => void;
}

export const GroundedAnswer: React.FC<GroundedAnswerProps> = ({
  question,
  response,
  onSelectMemory,
}) => {
  if (!response) return null;

  const count = response.evidence_memories?.length || 0;
  const hasEvidence = count > 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 1. Direct Answer Container */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-glow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Answer
            </span>
          </div>

          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>From your saved memories</span>
          </span>
        </div>

        {/* Question */}
        <p className="text-xs text-gray-400 font-medium">
          You asked: <span className="text-gray-200">"{question}"</span>
        </p>

        {/* Big Clear Answer */}
        <div className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
          {response.answer}
        </div>

        {/* Key Verified Facts */}
        {response.grounded_facts && response.grounded_facts.length > 0 && (
          <div className="pt-2 border-t border-gray-800/80 flex flex-wrap gap-2">
            {response.grounded_facts.map((fact, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs bg-gray-950/90 border border-gray-800 text-gray-300 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{fact}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Visual Evidence Cards (Place, Date, Photo) */}
      {hasEvidence ? (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
              <span>Where this memory was found:</span>
            </h3>
            <span className="text-xs text-cyan-400">
              {count === 1 ? '1 memory found' : `${count} memories found`}
            </span>
          </div>

          {/* Visual Memory Evidence Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {response.evidence_memories.map(mem => {
              const title = mem.title || mem.object_name || 'Saved Memory';
              const dateFormatted = mem.captured_at
                ? new Date(mem.captured_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recorded';

              return (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem)}
                  className="group bg-gray-900/70 hover:bg-gray-900 border border-gray-800 hover:border-cyan-500/40 rounded-3xl p-3.5 flex items-center space-x-3.5 cursor-pointer transition-all duration-200 shadow-sm active:scale-[0.99]"
                >
                  <img
                    src={mem.image_url}
                    alt={title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {title}
                    </h4>

                    {/* Place */}
                    <p className="text-xs text-cyan-300 font-medium flex items-center space-x-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{mem.location || mem.place_name || 'Physical World'}</span>
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span>{dateFormatted}</span>
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0 mr-1" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 p-5 bg-gray-900/40 border border-gray-800 rounded-3xl text-xs text-gray-300">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>
            I couldn't find a matching memory in your saved memories. Try asking about something you've saved or capture a new photo!
          </span>
        </div>
      )}
    </div>
  );
};
