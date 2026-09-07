import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Check, ArrowRight, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
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
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [captureSource, setCaptureSource] = useState<'camera' | 'upload'>('camera');

  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'extracting' | 'saving' | 'complete' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdMemory, setCreatedMemory] = useState<Memory | null>(null);
  const [similarity, setSimilarity] = useState<SimilarityMatch | null>(null);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid photo (JPEG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);
    setCreatedMemory(null);
    setSimilarity(null);
    setAnalysisResult(null);
    setCaptureSource('upload');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      triggerAutoAnalysis(base64);
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
    setAnalysisResult(null);
    setCaptureSource('camera');
    triggerAutoAnalysis(base64);
  };

  // Automatic gentle analysis after photo selection
  const triggerAutoAnalysis = async (imgBase64: string) => {
    setIsAnalyzing(true);
    setLoadingStage('analyzing');
    setErrorMessage(null);

    try {
      const analysis = await analyzeMemoryImage(imgBase64, userNote, location);
      setAnalysisResult(analysis);
      if (analysis.price) setPrice(analysis.price);
      if (analysis.brand) setBrand(analysis.brand);
      if (analysis.place_name && !location) setLocation(analysis.place_name);

      // Trigger similarity check
      const memTitle = analysis.title || analysis.object_name || 'Physical Memory';
      checkSimilarity(
        memTitle,
        analysis.category,
        analysis.brand,
        analysis.colors,
        analysis.visible_text
      );
    } catch (err: any) {
      console.warn('Auto analysis error:', err);
      setErrorMessage("Couldn't analyze this photo automatically. You can still save it!");
    } finally {
      setIsAnalyzing(false);
      setLoadingStage(null);
    }
  };

  const checkSimilarity = async (
    title: string,
    category: string,
    itemBrand: string | null,
    colors: string[],
    visible_text: string[]
  ) => {
    setIsCheckingSimilarity(true);
    try {
      const simMatch = await findSimilarMemory(
        title,
        category,
        itemBrand,
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

  const handleSaveMemory = async () => {
    if (!selectedImage) return;

    try {
      setErrorMessage(null);
      setLoadingStage('saving');

      const memoryTitle = analysisResult?.title || analysisResult?.object_name || userNote || 'Physical Memory';
      const finalLocation = location || analysisResult?.location_hint || analysisResult?.place_name || 'Physical World';

      // Upload image or use base64 fallback
      let finalImageUrl = selectedImage;
      try {
        const blob = await (await fetch(selectedImage)).blob();
        finalImageUrl = await uploadMemoryImage(blob, `${memoryTitle.replace(/\s+/g, '_')}.jpg`);
      } catch (uploadErr) {
        console.warn('Image storage fallback:', uploadErr);
      }

      const newMemory: Memory = {
        id: crypto.randomUUID(),
        image_url: finalImageUrl,
        title: memoryTitle,
        summary: analysisResult?.summary || userNote || 'Saved physical memory.',
        memory_type: analysisResult?.memory_type || 'object',
        source: captureSource,
        category: analysisResult?.category || 'Visual Memories',
        object_name: analysisResult?.object_name || memoryTitle,
        place_name: analysisResult?.place_name || null,
        brand: brand || analysisResult?.brand || null,
        model: analysisResult?.model || null,
        price: price || analysisResult?.price || null,
        currency: analysisResult?.currency || (price ? 'INR' : undefined),
        visible_text: analysisResult?.visible_text || [],
        colors: analysisResult?.colors || [],
        description: analysisResult?.description || userNote || 'Saved physical memory.',
        people_context: analysisResult?.people_context || [],
        important_details: analysisResult?.important_details || [],
        tags: [analysisResult?.category || 'General', analysisResult?.memory_type || 'object'],
        location: finalLocation,
        latitude: latitude,
        longitude: longitude,
        captured_at: new Date().toISOString(),
        confidence: analysisResult?.confidence || 0.95,
        is_demo: false,
      };

      const saved = await saveMemoryRecord(newMemory);
      onMemoryCreated(saved);
      setCreatedMemory(saved);
      setLoadingStage(null);
    } catch (err: any) {
      console.error('Save error:', err);
      setLoadingStage(null);
      setErrorMessage("Couldn't save this memory. Please try again.");
    }
  };

  const handleResetCapture = () => {
    setSelectedImage(null);
    setUserNote('');
    setLocation('');
    setLatitude(null);
    setLongitude(null);
    setPrice('');
    setBrand('');
    setAnalysisResult(null);
    setCreatedMemory(null);
    setSimilarity(null);
    setErrorMessage(null);
    setShowOptionalDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 pb-28 md:pb-12">
      {/* Friendly Loading Overlay */}
      <LoadingOverlay stage={loadingStage} />

      {/* Camera Fullscreen View */}
      {isCameraOpen && (
        <CameraView
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
          onSelectFileFallback={() => fileInputRef.current?.click()}
        />
      )}

      {/* Screen Title & Friendly Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Save a Memory
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Take a photo of something you want to remember in the physical world.
        </p>
      </div>

      {/* Friendly Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white p-1 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* State A: Saved Memory Confirmation */}
      {createdMemory && (
        <div className="bg-gradient-to-tr from-emerald-950/50 via-gray-900/80 to-cyan-950/50 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-glow space-y-5 animate-slide-up">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-500/50">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Memory Saved!</h3>
              <p className="text-xs text-emerald-300/90">Added to your physical memories archive</p>
            </div>
          </div>

          {/* Saved Memory Card Preview */}
          <div className="flex items-center space-x-3.5 bg-gray-950/80 rounded-2xl p-3.5 border border-gray-800">
            <img
              src={createdMemory.image_url}
              alt={createdMemory.title}
              className="w-20 h-20 rounded-xl object-cover border border-gray-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {createdMemory.title}
              </h4>
              <p className="text-xs text-cyan-400 font-medium capitalize mt-0.5">
                📍 {createdMemory.location || 'Saved location'}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{currentDateFormatted}</span>
              </p>
            </div>
          </div>

          {/* Have I Seen This Before notification card */}
          <HaveISeenThis
            similarity={similarity}
            onViewMemory={onViewMemory}
            isChecking={isCheckingSimilarity}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={() => onViewMemory(createdMemory)}
              className="w-full sm:flex-1 min-h-[46px] py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-glow active:scale-95"
            >
              <span>View Memory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCapture}
              className="w-full sm:w-auto min-h-[46px] py-3 px-5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors active:scale-95"
            >
              Save Another
            </button>
          </div>
        </div>
      )}

      {/* State B: Photo Selection or Captured View */}
      {!createdMemory && (
        <div className="space-y-5">
          {/* If no photo is selected yet: Big Touch-Friendly Buttons */}
          {!selectedImage ? (
            <div className="space-y-3">
              {/* Large Camera Card Trigger */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="w-full min-h-[140px] flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-gray-900/90 to-cyan-950/40 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-gray-900 transition-all duration-200 text-center group active:scale-[0.99] shadow-glow"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-base font-black text-white">📷 Take Photo</span>
                <span className="text-xs text-gray-300 mt-1">
                  Point at something in real life to remember it
                </span>
              </button>

              {/* Secondary Option: Choose Photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[52px] flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.99]"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>🖼 Choose Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Selected Photo Preview with Retake option */
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
                <img
                  src={selectedImage}
                  alt="Selected memory"
                  className="w-full max-h-80 object-cover rounded-3xl"
                />
                <button
                  onClick={handleResetCapture}
                  className="absolute top-3 right-3 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-gray-950/80 text-gray-300 hover:text-white backdrop-blur-md border border-gray-800 active:scale-90"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detected Information Card ("What I found:") */}
              <div className="bg-gray-900/60 border border-gray-800/90 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/60">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isAnalyzing ? 'Understanding your memory...' : 'What I found:'}
                    </h3>
                  </div>
                  {isAnalyzing && (
                    <span className="text-[11px] text-cyan-400 font-mono animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>

                {/* Extracted Core Details */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Item / Object */}
                  <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <span className="text-lg">🎒</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">What it is</span>
                      <span className="font-bold text-white truncate block">
                        {analysisResult?.title || analysisResult?.object_name || 'Object or scene observed'}
                      </span>
                    </div>
                  </div>

                  {/* Place */}
                  <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <span className="text-lg">📍</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Place</span>
                      <span className="font-semibold text-gray-200 truncate block">
                        {location || analysisResult?.place_name || analysisResult?.location_hint || 'Physical World'}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <span className="text-lg">📅</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date</span>
                      <span className="font-semibold text-gray-200 truncate block">
                        {currentDateFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Picker Editor */}
                <div className="pt-1">
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
                </div>

                {/* Optional Metadata Accordion (Price, Brand, Notes) - Not the main focus */}
                <div className="pt-2 border-t border-gray-800/60">
                  <button
                    type="button"
                    onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                    className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 py-1 transition-colors"
                  >
                    <span>Optional details (Notes, Price, Brand)</span>
                    {showOptionalDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showOptionalDetails && (
                    <div className="space-y-3 pt-3 animate-fade-in">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Memory note (optional)
                        </label>
                        <input
                          type="text"
                          value={userNote}
                          onChange={e => setUserNote(e.target.value)}
                          placeholder="e.g. friend's recommendation, bought at sale"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Price (optional)
                          </label>
                          <input
                            type="text"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="e.g. ₹1,499"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Brand (optional)
                          </label>
                          <input
                            type="text"
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                            placeholder="e.g. Sony, Nike"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Have I seen this before? Check Option */}
                <HaveISeenThis
                  similarity={similarity}
                  onCheckSimilarity={async () => {
                    const t = analysisResult?.title || userNote || 'Physical Memory';
                    await checkSimilarity(
                      t,
                      analysisResult?.category || 'Visual Memories',
                      brand || analysisResult?.brand || null,
                      analysisResult?.colors || [],
                      analysisResult?.visible_text || []
                    );
                  }}
                  onViewMemory={onViewMemory}
                  isChecking={isCheckingSimilarity}
                />

                {/* Big Primary Action: [ Save Memory ] */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveMemory}
                    disabled={isAnalyzing}
                    className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-base flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    <span>Save Memory</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
