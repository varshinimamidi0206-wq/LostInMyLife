import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AskMemoryResponse, Memory } from '../../types/memory';
import { MemoryCard } from '../memories/MemoryCard';

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
    <div className="space-y-5 animate-slide-up">
      {/* Answer Container */}
      <div className="bg-gradient-to-r from-gray-900/90 via-cyan-950/30 to-gray-900/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-glow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Grounded Memory Recall
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-gray-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Hallucination Grounding</span>
          </div>
        </div>

        {/* Question Repetition */}
        <p className="text-xs text-gray-400 font-mono mb-2">
          Q: "{question}"
        </p>

        {/* Grounded Answer Text */}
        <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {response.answer}
        </div>

        {/* Verified Facts Pills */}
        {response.grounded_facts && response.grounded_facts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex flex-wrap gap-2">
            {response.grounded_facts.map((fact, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs bg-gray-950/80 border border-gray-800 text-gray-300 font-mono"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{fact}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Supporting Evidence Cards */}
      {hasEvidence ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {count === 1 ? 'Based on 1 saved memory' : `Based on ${count} saved memories`}
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              Direct Visual Evidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {response.evidence_memories.map(mem => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                onClick={() => onSelectMemory(mem)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl text-xs text-gray-400">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            I couldn't find that in your saved memories. Try asking about objects, places, documents, or books you've captured.
          </span>
        </div>
      )}
    </div>
  );
};
