import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, X, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
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
            ? 'Camera access was denied. Please allow camera permissions in your browser or use the file upload option.'
            : 'Unable to start camera stream. Please use the upload photo option.'
        );
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

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
        // Stop stream
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

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Top action bar */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-900/80 text-gray-200 hover:text-white"
          aria-label="Close Camera"
        >
          <X className="w-6 h-6" />
        </button>

        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-gray-900/60 px-3 py-1 rounded-full border border-cyan-500/20">
          Point at physical object
        </span>

        <button
          onClick={toggleCamera}
          className="p-2 rounded-full bg-gray-900/80 text-gray-200 hover:text-white"
          aria-label="Flip Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-950">
        {cameraError ? (
          <div className="p-6 max-w-sm text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium text-xs hover:bg-cyan-500"
            >
              Back to Image Upload
            </button>
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
            {/* Memory Scanner Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-64 h-64 border-2 border-cyan-400/50 rounded-2xl relative shadow-glow">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400"></div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="text-[11px] text-cyan-300/80 font-mono tracking-wider bg-black/40 px-2 py-0.5 rounded">
                    ALIGN OBJECT
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Shutter bar */}
      {!cameraError && (
        <div className="p-6 flex items-center justify-center bg-gradient-to-t from-black/90 to-transparent">
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
