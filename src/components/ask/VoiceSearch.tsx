import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface VoiceSearchProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled || !isSupported}
      className={`p-3 rounded-xl transition-all relative ${
        isListening
          ? 'bg-red-600 text-white shadow-glow animate-pulse'
          : !isSupported
          ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
          : 'bg-gray-800 text-cyan-400 hover:bg-gray-700 hover:text-cyan-300'
      }`}
      title={
        !isSupported
          ? 'Speech recognition not supported in this browser'
          : isListening
          ? 'Listening... Speak now'
          : 'Ask using voice'
      }
      aria-label="Voice Search"
    >
      {isListening ? (
        <>
          <Mic className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
        </>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
};
