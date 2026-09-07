import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, X, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
  onSelectFileFallback?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose, onSelectFileFallback }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermissionPrompted, setHasPermissionPrompted] = useState(false);

  useEffect(() => {
    if (!hasPermissionPrompted) return;

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access was not allowed. You can still choose a photo from your gallery or files.'
            : 'Unable to start camera stream. Please choose a photo from your gallery.'
        );
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, hasPermissionPrompted]);

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        onCapture(base64);
      }
    } catch (err) {
      console.error('Error snapping photo:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Permission Pre-Screen (Requirement 10)
  if (!hasPermissionPrompted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-glow">
            <Camera className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white">
              Camera Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              LostInMyLife uses your camera to understand things you want to remember.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setHasPermissionPrompted(true)}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs sm:text-sm shadow-glow transition-all active:scale-[0.98]"
            >
              Allow Camera
            </button>

            <button
              onClick={() => {
                onClose();
                if (onSelectFileFallback) onSelectFileFallback();
              }}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white font-semibold text-xs transition-all active:scale-[0.98]"
            >
              Not Now (Choose Photo Instead)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Top action bar */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-10">
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-900/80 text-gray-200 hover:text-white active:scale-90"
          aria-label="Close Camera"
        >
          <X className="w-6 h-6" />
        </button>

        <span className="text-xs font-semibold tracking-wide text-cyan-300 bg-gray-900/80 px-3.5 py-1.5 rounded-full border border-cyan-500/30">
          Point at what you want to remember
        </span>

        <button
          onClick={toggleCamera}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-900/80 text-gray-200 hover:text-white active:scale-90"
          aria-label="Flip Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-950">
        {cameraError ? (
          <div className="p-6 max-w-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {cameraError}
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onSelectFileFallback) onSelectFileFallback();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Choose Photo from Gallery</span>
              </button>
              <button
                onClick={onClose}
                className="w-full min-h-[40px] px-4 py-2 rounded-2xl bg-gray-800 text-gray-300 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Centered Guide Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-cyan-400/40 rounded-3xl relative shadow-glow">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Shutter bar */}
      {!cameraError && (
        <div className="p-6 pb-8 flex items-center justify-center bg-gradient-to-t from-black/95 to-transparent">
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform bg-white/20 hover:bg-white/30 group shadow-glow"
            aria-label="Take Photo"
          >
            <div className="w-16 h-16 rounded-full bg-white group-hover:scale-90 transition-transform"></div>
          </button>
        </div>
      )}
    </div>
  );
};
