import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Check,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { CameraView } from './CameraView';
import { LocationPicker } from './LocationPicker';
import { HaveISeenThis } from './HaveISeenThis';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { analyzeMemoryImage, findSimilarMemory, saveMemoryRecord } from '../../services/api';
import { uploadMemoryImage } from '../../services/supabase';
import { AIAnalysisResult, Memory, SimilarityMatch } from '../../types/memory';
import { extractPhotoMetadata } from '../../utils/exif';
import { reverseGeocode, getCurrentDeviceLocation } from '../../utils/location';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Date states: capturedAt stores original EXIF or camera capture timestamp
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [isExifDateAvailable, setIsExifDateAvailable] = useState<boolean>(true);
  const [manualDate, setManualDate] = useState<string>('');

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

  // Automatically attempt real location detection when CaptureScreen mounts
  useEffect(() => {
    let isCancelled = false;

    async function detectInitialLocation() {
      if (location) return;
      setIsLocating(true);
      setLocationStatus('Detecting your location...');

      const result = await getCurrentDeviceLocation();
      if (isCancelled) return;

      setIsLocating(false);
      if (result.error) {
        setLocationStatus(result.error);
      } else if (result.locationText) {
        setLocation(result.locationText);
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setLocationStatus('Current location detected');
      }
    }

    detectInitialLocation();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleManualLocationDetection = async () => {
    setIsLocating(true);
    setLocationStatus('Detecting your location...');

    const result = await getCurrentDeviceLocation();
    setIsLocating(false);

    if (result.error) {
      setLocationStatus(result.error);
    } else if (result.locationText) {
      setLocation(result.locationText);
      setLatitude(result.latitude);
      setLongitude(result.longitude);
      setLocationStatus('Current location detected');
    }
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid photo (JPEG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);
    setCreatedMemory(null);
    setSimilarity(null);
    setAnalysisResult(null);
    setCaptureSource('upload');

    // 1. Extract EXIF metadata (Original photo date & GPS coordinates)
    const exif = await extractPhotoMetadata(file);

    // Photo Date Priority: EXIF original date -> manual selection -> null ("unavailable")
    if (exif.originalDate) {
      setCapturedAt(exif.originalDate);
      setIsExifDateAvailable(true);
      setManualDate(exif.originalDate.slice(0, 10));
    } else {
      setCapturedAt(null);
      setIsExifDateAvailable(false);
      setManualDate('');
    }

    // Photo GPS Priority: If photo has EXIF GPS, it takes precedence over current device location
    if (exif.latitude !== null && exif.longitude !== null) {
      setLatitude(exif.latitude);
      setLongitude(exif.longitude);
      setLocationStatus('Resolving photo GPS location...');

      reverseGeocode(exif.latitude, exif.longitude).then(address => {
        setLocation(address);
        setLocationStatus('Photo GPS location detected');
      });
    }

    // 2. Read image for preview and trigger AI analysis
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

  const handleCameraCapture = (base64: string, captureTimestamp: string) => {
    setSelectedImage(base64);
    setIsCameraOpen(false);
    setCreatedMemory(null);
    setSimilarity(null);
    setAnalysisResult(null);
    setCaptureSource('camera');

    // Camera photo capture timestamp is recorded at the moment of snapping
    setCapturedAt(captureTimestamp);
    setIsExifDateAvailable(true);
    setManualDate(captureTimestamp.slice(0, 10));

    // Ensure location is detected for the camera photo
    if (!location) {
      handleManualLocationDetection();
    }

    triggerAutoAnalysis(base64);
  };

  // Automatic analysis after photo selection
  const triggerAutoAnalysis = async (imgBase64: string) => {
    setIsAnalyzing(true);
    setLoadingStage('analyzing');
    setErrorMessage(null);

    try {
      const analysis = await analyzeMemoryImage(imgBase64, userNote, location);
      setAnalysisResult(analysis);
      if (analysis.price) setPrice(analysis.price);
      if (analysis.brand) setBrand(analysis.brand);
      if (analysis.place_name && !location) {
        setLocation(analysis.place_name);
      }

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
      const finalLocation = location.trim() || analysisResult?.place_name || analysisResult?.location_hint || 'Location unavailable';

      // Upload image or use base64 fallback
      let finalImageUrl = selectedImage;
      try {
        const blob = await (await fetch(selectedImage)).blob();
        finalImageUrl = await uploadMemoryImage(blob, `${memoryTitle.replace(/\s+/g, '_')}.jpg`);
      } catch (uploadErr) {
        console.warn('Image storage fallback:', uploadErr);
      }

      const uploadTimestamp = new Date().toISOString();

      const newMemory: Memory = {
        id: crypto.randomUUID(),
        user_id: user?.id,
        image_url: finalImageUrl,
        title: memoryTitle,
        summary: analysisResult?.summary || userNote || 'Saved physical memory.',
        memory_type: analysisResult?.memory_type || 'object',
        source: captureSource,
        category: analysisResult?.category || 'Objects',
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
        tags: [analysisResult?.category || 'Objects', analysisResult?.memory_type || 'object'],
        location: finalLocation,
        latitude: latitude,
        longitude: longitude,
        captured_at: capturedAt || null,
        uploaded_at: uploadTimestamp,
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
    setLocationStatus(null);
    setCapturedAt(null);
    setIsExifDateAvailable(true);
    setManualDate('');
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

  const formatDisplayDate = (isoString: string | null) => {
    if (!isoString) return 'Original photo date unavailable';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Date unavailable';
    }
  };

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

      {/* Screen Title & Subtitle (Desktop) */}
      <div className="hidden lg:block space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {isAnalyzing ? 'Understanding...' : 'Save a Memory'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          {isAnalyzing
            ? 'Looking at your photo...'
            : 'Take a photo of something you want to remember.'}
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* State A: Saved Memory Confirmation */}
      {createdMemory && (
        <div className="bg-gradient-to-tr from-emerald-950/40 via-gray-900/80 to-cyan-950/40 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-glow space-y-5 animate-slide-up">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-500/50">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Memory Saved!</h3>
              <p className="text-xs text-emerald-300/90">Added to your physical memories</p>
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
              <p className="text-xs text-cyan-400 font-medium capitalize mt-0.5 flex items-center space-x-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{createdMemory.location || 'Location unavailable'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1 font-mono">
                <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span>
                  {createdMemory.captured_at
                    ? formatDisplayDate(createdMemory.captured_at)
                    : 'Date unavailable'}
                </span>
              </p>
            </div>
          </div>

          {/* Have I Seen This Before notification */}
          <HaveISeenThis
            similarity={similarity}
            onViewMemory={onViewMemory}
            isChecking={isCheckingSimilarity}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={() => onViewMemory(createdMemory)}
              className="w-full sm:flex-1 min-h-[46px] py-3 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-glow active:scale-95"
            >
              <span>View Memory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCapture}
              className="w-full sm:w-auto min-h-[46px] py-3 px-5 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors active:scale-95"
            >
              Save Another
            </button>
          </div>
        </div>
      )}

      {/* State B: Photo Selection or Captured View */}
      {!createdMemory && (
        <div className="space-y-5">
          {!selectedImage ? (
            /* No photo selected: Match Reference UI Screen 2 */
            <div className="space-y-4">
              {/* Dashed Camera Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-gray-800 hover:border-cyan-500/50 rounded-3xl p-8 sm:p-12 text-center bg-gray-900/30 hover:bg-gray-900/50 transition-all cursor-pointer space-y-4"
              >
                {/* Circular Camera Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                  <Camera className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-bold text-white">
                    Capture or choose a photo
                  </p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Point your camera at something in the physical world, or pick an existing photo from your gallery.
                  </p>
                </div>

                {/* Two Clear Pill Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <span className="text-xs text-gray-500 font-medium">or</span>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700/80 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Choose Photo</span>
                  </button>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Selected Photo Preview with Understanding Screen */
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
                <img
                  src={selectedImage}
                  alt="Selected memory"
                  className="w-full max-h-72 object-cover rounded-3xl"
                />
                <button
                  onClick={handleResetCapture}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gray-950/80 text-gray-300 hover:text-white backdrop-blur-md border border-gray-800 active:scale-90"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Circular Understanding Progress Animation */}
              {isAnalyzing && (
                <div className="text-center py-6 space-y-3 bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mx-auto flex items-center justify-center shadow-glow">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Looking at your photo...</h3>
                  <p className="text-xs text-gray-400">This may take a few seconds.</p>
                </div>
              )}

              {/* Detected Information Card ("What I found:") */}
              <div className="bg-gray-900/60 border border-gray-800/90 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/60">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isAnalyzing ? 'Analyzing photo...' : 'What I found:'}
                    </h3>
                  </div>
                  {isAnalyzing && (
                    <span className="text-xs text-cyan-400 flex items-center space-x-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processing</span>
                    </span>
                  )}
                </div>

                {/* Extracted Core Details with Clean Lucide SVG Icons */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Item / Object */}
                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">What it is</span>
                      <span className="font-bold text-white truncate block">
                        {analysisResult?.title || analysisResult?.object_name || 'Item observed'}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Location</span>
                      <span className="font-semibold text-gray-200 truncate block">
                        {location || 'Location unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Date — Prioritizes Original Photo Date */}
                  {isExifDateAvailable && capturedAt ? (
                    <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-950/70 border border-gray-800">
                      <div className="w-8 h-8 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date</span>
                        <span className="font-semibold text-gray-200 truncate block font-mono">
                          {formatDisplayDate(capturedAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* When photo does NOT have EXIF date */
                    <div className="p-3 rounded-2xl bg-gray-950/70 border border-amber-500/30 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-amber-400 uppercase font-semibold block">Date</span>
                          <span className="text-xs text-amber-300 font-medium block">
                            {capturedAt ? formatDisplayDate(capturedAt) : 'Original photo date unavailable'}
                          </span>
                        </div>
                      </div>

                      {/* Manual Date Input */}
                      <div className="pt-1">
                        <label className="text-[11px] text-gray-400 block mb-1">
                          Select photo date (optional)
                        </label>
                        <input
                          type="date"
                          value={manualDate}
                          onChange={e => {
                            const val = e.target.value;
                            setManualDate(val);
                            if (val) {
                              setCapturedAt(new Date(val).toISOString());
                            } else {
                              setCapturedAt(null);
                            }
                          }}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Picker Editor */}
                <div className="pt-1">
                  <LocationPicker
                    location={location}
                    latitude={latitude}
                    longitude={longitude}
                    locationStatus={locationStatus}
                    isLocating={isLocating}
                    onDetectLocation={handleManualLocationDetection}
                    onChangeLocation={(loc, lat, lng) => {
                      setLocation(loc);
                      setLatitude(lat);
                      setLongitude(lng);
                      if (loc) {
                        setLocationStatus(null);
                      }
                    }}
                  />
                </div>

                {/* Optional Metadata Accordion (Notes, Price, Brand) */}
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
                          placeholder="e.g. friend's recommendation, stored in top shelf"
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
                            placeholder="e.g. ₹2,499"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                            placeholder="e.g. Zara"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button: Save Memory */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveMemory}
                    disabled={isAnalyzing}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
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
