import React, { useState } from 'react';
import { Send, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { VoiceSearch } from './VoiceSearch';
import { GroundedAnswer } from './GroundedAnswer';
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

  const sampleQuestions = [
    "Where did I see that café?",
    "Have I seen these shoes before?",
    "When did I see this?",
    "Where was this photo taken?",
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 py-2 sm:py-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask your memories</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          What do you remember?
        </h2>
        <p className="text-xs sm:text-sm text-gray-300">
          Ask about something you've seen before. We'll find where and when you saw it.
        </p>
      </div>

      {/* Large Search / Ask Input Box */}
      <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-800 rounded-3xl p-2 sm:p-2.5 shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 transition-all">
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
            placeholder="Where did I see that blue handbag?"
            className="flex-1 min-h-[46px] bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
            disabled={isAsking}
          />

          {/* Microphone Voice Button */}
          <VoiceSearch onTranscript={handleVoiceTranscript} disabled={isAsking} />

          {/* Search Button */}
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="min-w-[46px] min-h-[46px] p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center"
            aria-label="Search Memories"
          >
            {isAsking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Example Questions Grid */}
      <div className="max-w-2xl mx-auto space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 px-1 font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Try asking:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleQuestions.map(preset => (
            <button
              key={preset}
              onClick={() => handleSuggestedClick(preset)}
              className="text-left min-h-[44px] px-4 py-2.5 rounded-2xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-cyan-500/40 text-xs text-gray-300 hover:text-cyan-300 transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <span className="truncate">"{preset}"</span>
              <span className="text-xs text-cyan-400/90 ml-2 group-hover:translate-x-1 transition-transform">
                🔍
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Friendly Loading Indicator */}
      {isAsking && (
        <div className="py-12 text-center space-y-3 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-glow">
            <Sparkles className="w-7 h-7 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-white">
            Searching your memories...
          </p>
          <p className="text-xs text-gray-400">
            Checking places, items, and photos you've captured.
          </p>
        </div>
      )}

      {/* Visual Answer & Evidence */}
      {!isAsking && answerResponse && (
        <div className="max-w-3xl mx-auto pt-2">
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
