import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Sparkles, Shield, Info, Loader2, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import {
  isGooglePhotosConfigured,
  DEMO_GOOGLE_PHOTOS_CATALOG,
  DemoSelectablePhoto,
  launchGooglePhotosPicker,
} from '../../services/googlePhotos';
import { analyzeMemoryImage, saveMemoryRecord } from '../../services/api';
import { Memory } from '../../types/memory';

interface GooglePhotosImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoriesImported: (imported: Memory[]) => void;
}

export const GooglePhotosImportModal: React.FC<GooglePhotosImportModalProps> = ({
  isOpen,
  onClose,
  onMemoriesImported,
}) => {
  const [photosCatalog, setPhotosCatalog] = useState<DemoSelectablePhoto[]>(DEMO_GOOGLE_PHOTOS_CATALOG);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isPickingLive, setIsPickingLive] = useState(false);
  const [pickerStatus, setPickerStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedPhotoIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleLaunchLivePicker = async () => {
    setIsPickingLive(true);
    setErrorMessage(null);
    setPickerStatus('Connecting to Google...');

    try {
      const pickedPhotos = await launchGooglePhotosPicker((status) => {
        setPickerStatus(status);
      });

      if (pickedPhotos.length > 0) {
        setPhotosCatalog(pickedPhotos);
        // Automatically select all picked photos
        setSelectedPhotoIds(pickedPhotos.map(p => p.id));
      }
    } catch (err: any) {
      console.error('Google Photos Picker error:', err);
      setErrorMessage(err.message || 'Failed to select photos from Google Photos.');
    } finally {
      setIsPickingLive(false);
      setPickerStatus(null);
    }
  };

  const handleExecuteImport = async () => {
    if (selectedPhotoIds.length === 0) return;

    setIsImporting(true);
    setImportStatus('Understanding selected photos with Gemini...');
    setErrorMessage(null);

    try {
      const selectedItems = photosCatalog.filter(p =>
        selectedPhotoIds.includes(p.id)
      );

      const created: Memory[] = [];

      for (const item of selectedItems) {
        setImportStatus(`Analyzing "${item.title}"...`);
        const analysis = await analyzeMemoryImage(item.image_url, item.note, item.location);

        const newMemory: Memory = {
          id: crypto.randomUUID(),
          image_url: item.image_url,
          title: analysis.title || item.title,
          summary: analysis.summary || item.note,
          memory_type: analysis.memory_type || 'object',
          source: 'google_photos',
          source_reference: `Google Photos / ${item.id}`,
          context: `Imported via Google Photos Picker on ${new Date().toLocaleDateString()}`,
          is_imported: true,
          people_context: analysis.people_context || [],
          tags: ['Google Photos', analysis.category],
          object_name: analysis.object_name || undefined,
          place_name: analysis.place_name || item.location,
          category: analysis.category || 'Imported Photos',
          brand: analysis.brand,
          model: analysis.model,
          price: analysis.price,
          currency: analysis.currency || (analysis.price ? 'INR' : undefined),
          visible_text: analysis.visible_text || [],
          colors: analysis.colors || [],
          description: analysis.description || item.note,
          important_details: analysis.important_details || ['Imported from user-selected Google Photo'],
          location: item.location,
          captured_at: new Date(item.date).toISOString(),
          confidence: analysis.confidence || 0.95,
          is_demo: !isGooglePhotosConfigured,
        };

        const saved = await saveMemoryRecord(newMemory);
        created.push(saved);
      }

      onMemoriesImported(created);
      setIsImporting(false);
      setImportStatus(null);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setIsImporting(false);
      setImportStatus('Import failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 flex items-center justify-center p-0.5 shadow-sm">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Import from Google Photos
              </h3>
              <p className="text-xs text-gray-400">
                Turn your selected photos into searchable physical memories
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isImporting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Promise Banner */}
        <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-xs text-cyan-300 flex items-start space-x-2.5">
          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white">
              Privacy First • Google Photos Picker API
            </p>
            <p className="text-[11px] text-cyan-200/90 leading-relaxed">
              "LostInMyLife only processes the photos you choose." We never scan or access your entire photo library.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-red-100">Google Photos Error</span>
              <span className="text-red-300/90 text-[11px]">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Live Picker Action / Setup Status Notice */}
        {isGooglePhotosConfigured ? (
          <div className="p-3.5 bg-gradient-to-r from-cyan-950/50 to-blue-950/40 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Google Photos Connected</span>
              </p>
              <p className="text-[11px] text-gray-400">
                Click below to select specific photos directly from your personal Google Photos library.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLaunchLivePicker}
              disabled={isPickingLive || isImporting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 flex-shrink-0"
            >
              {isPickingLive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Selecting...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pick from Google Photos</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Demo Mode Active: </span>
              <span>
                To access your personal Google Photos in real time, add your Google OAuth Client ID as{' '}
                <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-100 font-mono text-[10px]">
                  VITE_GOOGLE_CLIENT_ID
                </code>{' '}
                in <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-100 font-mono text-[10px]">.env</code>.
              </span>
            </div>
          </div>
        )}

        {/* Live Picker Status Notice */}
        {isPickingLive && pickerStatus && (
          <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-2xl text-xs text-cyan-200 flex items-center space-x-2.5 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
            <span>{pickerStatus}</span>
          </div>
        )}

        {/* Photo Selection Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Choose photos to remember ({selectedPhotoIds.length} selected):
          </label>

          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {photosCatalog.map((photo: DemoSelectablePhoto) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  onClick={() => toggleSelect(photo.id)}
                  className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-glow'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-950'
                  }`}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />

                  {/* Selection Checkmark */}
                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'bg-black/60 text-transparent border border-white/40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-bold text-white truncate">{photo.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{photo.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={handleExecuteImport}
            disabled={isImporting || selectedPhotoIds.length === 0}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-glow disabled:opacity-40 transition-all"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{importStatus || 'Importing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Import {selectedPhotoIds.length > 0 ? `${selectedPhotoIds.length} Photos` : 'Selected Photos'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isImporting}
            className="py-3 px-4 rounded-2xl bg-gray-800 text-gray-300 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
