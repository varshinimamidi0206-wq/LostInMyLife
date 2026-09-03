import React, { useState } from 'react';
import { Send, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { VoiceSearch } from './VoiceSearch';
import { GroundedAnswer } from './GroundedAnswer';
import { DEMO_QUESTIONS } from '../../services/demoData';
import { askMyMemory } from '../../services/api';
import { AskMemoryResponse, Memory } from '../../types/memory';

interface AskScreenProps {
  memories: Memory[];
  onSelectMemory: (mem: Memory) => void;
  initialQuery?: string;
}

export const AskScreen: React.FC<AskScreenProps> = ({
  memories,
  onSelectMemory,
  initialQuery = '',
}) => {
  const [question, setQuestion] = useState(initialQuery);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answerResponse, setAnswerResponse] = useState<AskMemoryResponse | null>(null);

  React.useEffect(() => {
    if (initialQuery) {
      setQuestion(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    setActiveQuestion(q);
    setIsAsking(true);
    setAnswerResponse(null);

    try {
      const resp = await askMyMemory(q, memories);
      setAnswerResponse(resp);
    } catch (err) {
      console.error('Ask error:', err);
      setAnswerResponse({
        answer: "I couldn't find that in your saved memories.",
        evidence_memories: [],
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleSuggestedClick = (presetQ: string) => {
    setQuestion(presetQ);
    handleAsk(presetQ);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuestion(transcript);
    handleAsk(transcript);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 py-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded Natural Language Recall</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ask your memory.
        </h2>
        <p className="text-sm text-gray-400">
          You don't need to remember the details. Just ask where, when, or what you saw.
        </p>
      </div>

      {/* Input Box with Voice Search */}
      <div className="max-w-2xl mx-auto bg-gray-900/80 border border-gray-800 rounded-3xl p-2.5 shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask anything... (e.g. 'Where was the coffee shop?' or 'What documents did I capture?')"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
            disabled={isAsking}
          />

          {/* Voice Search Button */}
          <VoiceSearch onTranscript={handleVoiceTranscript} disabled={isAsking} />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow disabled:opacity-40 transition-all active:scale-95"
            aria-label="Submit Question"
          >
            {isAsking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Suggested Questions */}
      <div className="max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="flex items-center space-x-1.5 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Try these physical memory questions:</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_QUESTIONS.map(preset => (
            <button
              key={preset}
              onClick={() => handleSuggestedClick(preset)}
              className="text-left px-3.5 py-2.5 rounded-2xl bg-gray-900/50 hover:bg-gray-900 border border-gray-800/80 hover:border-cyan-500/40 text-xs text-gray-300 hover:text-cyan-300 transition-all flex items-center justify-between group"
            >
              <span className="truncate">"{preset}"</span>
              <span className="text-[10px] text-cyan-400/80 group-hover:translate-x-1 transition-transform ml-2">
                Ask →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {isAsking && (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-mono text-gray-400">
            Searching physical memory archive and verifying grounded evidence...
          </p>
        </div>
      )}

      {/* Grounded AI Answer & Evidence */}
      {!isAsking && answerResponse && (
        <div className="max-w-3xl mx-auto pt-4">
          <GroundedAnswer
            question={activeQuestion}
            response={answerResponse}
            onSelectMemory={onSelectMemory}
          />
        </div>
      )}
    </div>
  );
};
