import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { CameraView } from './CameraView';
import { LocationPicker } from './LocationPicker';
import { HaveISeenThis } from './HaveISeenThis';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { analyzeMemoryImage, findSimilarMemory, saveMemoryRecord } from '../../services/api';
import { uploadMemoryImage } from '../../services/supabase';
import { AIAnalysisResult, Memory, SimilarityMatch } from '../../types/memory';

interface CaptureScreenProps {
  existingMemories: Memory[];
  onMemoryCreated: (memory: Memory) => void;
  onViewMemory: (memory: Memory) => void;
}

export const CaptureScreen: React.FC<CaptureScreenProps> = ({
  existingMemories,
  onMemoryCreated,
  onViewMemory,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [captureSource, setCaptureSource] = useState<'camera' | 'upload'>('camera');

  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'extracting' | 'saving' | 'complete' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdMemory, setCreatedMemory] = useState<Memory | null>(null);
  const [similarity, setSimilarity] = useState<SimilarityMatch | null>(null);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);
    setCreatedMemory(null);
    setSimilarity(null);
    setCaptureSource('upload');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setSelectedImage(base64);
    setIsCameraOpen(false);
    setCreatedMemory(null);
    setSimilarity(null);
    setCaptureSource('camera');
  };

  const checkSimilarity = async (title: string, category: string, brand: string | null, colors: string[], visible_text: string[]) => {
    setIsCheckingSimilarity(true);
    try {
      const simMatch = await findSimilarMemory(
        title,
        category,
        brand,
        colors,
        existingMemories,
        visible_text
      );
      setSimilarity(simMatch);
    } catch (simErr) {
      console.warn('Similarity check error:', simErr);
    } finally {
      setIsCheckingSimilarity(false);
    }
  };

  const handleRememberThis = async () => {
    if (!selectedImage) return;

    try {
      setErrorMessage(null);
      setLoadingStage('analyzing');

      // Stage 1: Send image to backend Gemini / Local analyzer
      const analysis: AIAnalysisResult = await analyzeMemoryImage(
        selectedImage,
        userNote,
        location
      );

      setLoadingStage('extracting');

      // Stage 2: Check "Have I seen this before?" against existing memories
      const memoryTitle = analysis.title || analysis.object_name || 'Physical Memory';
      await checkSimilarity(
        memoryTitle,
        analysis.category,
        analysis.brand,
        analysis.colors,
        analysis.visible_text
      );

      setLoadingStage('saving');

      // Stage 3: Upload image (Supabase Storage or base64)
      let finalImageUrl = selectedImage;
      try {
        const blob = await (await fetch(selectedImage)).blob();
        finalImageUrl = await uploadMemoryImage(blob, `${memoryTitle.replace(/\s+/g, '_')}.jpg`);
      } catch (uploadErr) {
        console.warn('Image storage fallback:', uploadErr);
      }

      const finalLocation = location || analysis.location_hint || analysis.place_name || 'Physical World';

      const newMemory: Memory = {
        id: crypto.randomUUID(),
        image_url: finalImageUrl,
        title: memoryTitle,
        summary: analysis.summary || 'Saved physical memory.',
        memory_type: analysis.memory_type || 'object',
        source: captureSource,
        category: analysis.category || 'Visual Memories',
        object_name: analysis.object_name || memoryTitle,
        place_name: analysis.place_name || null,
        brand: analysis.brand,
        model: analysis.model,
        price: analysis.price,
        currency: analysis.currency || (analysis.price ? 'INR' : undefined),
        visible_text: analysis.visible_text || [],
        colors: analysis.colors || [],
        description: analysis.description,
        people_context: analysis.people_context || [],
        important_details: analysis.important_details || [],
        tags: [analysis.category, analysis.memory_type],
        location: finalLocation,
        latitude: latitude,
        longitude: longitude,
        captured_at: new Date().toISOString(),
        confidence: analysis.confidence || 0.95,
        is_demo: false,
      };

      // Persist to backend Supabase / local
      const saved = await saveMemoryRecord(newMemory);
      onMemoryCreated(saved);
      setCreatedMemory(saved);
      setLoadingStage(null);
    } catch (err: any) {
      console.error('Error in handleRememberThis:', err);
      setLoadingStage(null);
      setErrorMessage("Couldn't analyze this memory. Please try again or check connection.");
    }
  };

  const handleResetCapture = () => {
    setSelectedImage(null);
    setUserNote('');
    setLocation('');
    setLatitude(null);
    setLongitude(null);
    setCreatedMemory(null);
    setSimilarity(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-12">
      {/* Loading Overlay */}
      <LoadingOverlay stage={loadingStage} />

      {/* Camera Fullscreen View */}
      {isCameraOpen && (
        <CameraView
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Visual Capture
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
          Capture Physical Memory
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Take a photo of an object, place, document, book, sign, or experience. The AI remembers what you saw.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-2xl text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Success State */}
      {createdMemory && (
        <div className="bg-gradient-to-tr from-emerald-950/40 via-gray-900/60 to-cyan-950/40 border border-emerald-500/40 rounded-3xl p-5 shadow-glow space-y-4 animate-slide-up">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-bold">Memory Saved to Your Physical World Archive</span>
          </div>

          <div className="flex items-center space-x-4 bg-gray-950/60 rounded-2xl p-3 border border-gray-800">
            <img
              src={createdMemory.image_url}
              alt={createdMemory.title}
              className="w-20 h-20 rounded-xl object-cover border border-gray-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {createdMemory.title}
              </h3>
              <p className="text-xs text-cyan-400 font-medium capitalize">
                {createdMemory.memory_type} • {createdMemory.category}
              </p>
              <p className="text-xs text-gray-400 truncate mt-1">
                📍 {createdMemory.location}
              </p>
            </div>
          </div>

          {/* Have I Seen This Before notification card */}
          <HaveISeenThis
            similarity={similarity}
            onViewMemory={onViewMemory}
            isChecking={isCheckingSimilarity}
          />

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => onViewMemory(createdMemory)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-glow"
            >
              <span>View Memory Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetCapture}
              className="py-2.5 px-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              Capture Another
            </button>
          </div>
        </div>
      )}

      {/* Capture Controls / Form */}
      {!createdMemory && (
        <div className="space-y-5">
          {/* Image Selection / Preview */}
          {!selectedImage ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Camera Trigger */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-gray-900/60 border-2 border-dashed border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900/90 transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-white">Open Camera</span>
                <span className="text-[11px] text-gray-400 mt-1">Capture real-world view</span>
              </button>

              {/* Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-gray-900/60 border-2 border-dashed border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/90 transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-white">Upload Photo</span>
                <span className="text-[11px] text-gray-400 mt-1">From gallery or files</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-900/60 p-2">
              <img
                src={selectedImage}
                alt="Memory preview"
                className="w-full h-64 sm:h-80 object-cover rounded-2xl"
              />
              <button
                onClick={handleResetCapture}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-950/80 text-gray-300 hover:text-white backdrop-blur-md border border-gray-800"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Context Details (Visible after photo is selected) */}
          {selectedImage && (
            <div className="space-y-4 bg-gray-900/40 border border-gray-800/80 rounded-3xl p-5">
              {/* Optional memory note */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Add a memory note (optional)
                </label>
                <input
                  type="text"
                  value={userNote}
                  onChange={e => setUserNote(e.target.value)}
                  placeholder="What should I remember about this? (e.g. favorite book, friend's gift, certificate)"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Location Picker */}
              <LocationPicker
                location={location}
                latitude={latitude}
                longitude={longitude}
                onChangeLocation={(loc, lat, lng) => {
                  setLocation(loc);
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleRememberThis}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Remember This</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
