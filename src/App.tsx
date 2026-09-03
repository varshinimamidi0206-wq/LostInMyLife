import { useState, useEffect } from 'react';
import { NavigationTab, Memory } from './types/memory';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { TopNav } from './components/navigation/TopNav';
import { HomeScreen } from './components/home/HomeScreen';
import { CaptureScreen } from './components/capture/CaptureScreen';
import { MemoriesScreen } from './components/memories/MemoriesScreen';
import { AskScreen } from './components/ask/AskScreen';
import { MemoryStudio } from './components/studio/MemoryStudio';
import { MemoryDetailModal } from './components/memories/MemoryDetailModal';
import { PrivacyModal } from './components/common/PrivacyModal';
import { DemoBanner } from './components/common/DemoBanner';
import { GooglePhotosImportModal } from './components/photos/GooglePhotosImportModal';
import {
  getLocalMemories,
  addLocalMemory,
  removeLocalMemory,
  clearAllLocalMemories,
  resetToDemoData,
  syncMemories,
  getDemoModeSetting,
  setDemoModeSetting,
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isPhotosImportOpen, setIsPhotosImportOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<boolean>(getDemoModeSetting());
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');

  useEffect(() => {
    // Initial memory loading & synchronization
    const initial = getLocalMemories();
    setMemories(initial);

    syncMemories().then(synced => {
      if (synced && synced.length > 0) {
        setMemories(synced);
      }
    });
  }, []);

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    setDemoModeSetting(next);
    if (next && memories.length === 0) {
      const reloaded = resetToDemoData();
      setMemories(reloaded);
    }
  };

  const handleMemoryCreated = (newMem: Memory) => {
    const updated = addLocalMemory(newMem);
    setMemories(updated);
  };

  const handleMemoriesImported = (imported: Memory[]) => {
    let current = memories;
    for (const item of imported) {
      current = addLocalMemory(item);
    }
    setMemories(current);
    setActiveTab('memories');
  };

  const handleDeleteMemory = (id: string) => {
    const updated = removeLocalMemory(id);
    setMemories(updated);
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleClearAll = () => {
    const empty = clearAllLocalMemories();
    setMemories(empty);
    setSelectedMemory(null);
  };

  const handleResetDemo = () => {
    const reset = resetToDemoData();
    setMemories(reset);
  };

  const handleQuickAsk = (question: string) => {
    setAskInitialQuery(question);
    setActiveTab('ask');
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-slate-100 font-sans">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenPhotosImport={() => setIsPhotosImportOpen(true)}
        memoryCount={memories.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <TopNav
          demoMode={demoMode}
          onToggleDemoMode={handleToggleDemoMode}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />

        {/* Demo Mode Judge Helper Banner */}
        {demoMode && (
          <DemoBanner
            onQuickAsk={handleQuickAsk}
            onNavigate={tab => setActiveTab(tab)}
          />
        )}

        {/* Dynamic Tab Views */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeScreen
              recentMemories={memories}
              onNavigate={tab => setActiveTab(tab)}
              onSelectMemory={mem => setSelectedMemory(mem)}
              onOpenPhotosImport={() => setIsPhotosImportOpen(true)}
            />
          )}

          {activeTab === 'capture' && (
            <CaptureScreen
              existingMemories={memories}
              onMemoryCreated={handleMemoryCreated}
              onViewMemory={mem => setSelectedMemory(mem)}
            />
          )}

          {activeTab === 'memories' && (
            <MemoriesScreen
              memories={memories}
              onSelectMemory={mem => setSelectedMemory(mem)}
              onNavigateCapture={() => setActiveTab('capture')}
              onOpenPhotosImport={() => setIsPhotosImportOpen(true)}
            />
          )}

          {activeTab === 'ask' && (
            <AskScreen
              memories={memories}
              onSelectMemory={mem => setSelectedMemory(mem)}
              initialQuery={askInitialQuery}
            />
          )}

          {activeTab === 'studio' && (
            <MemoryStudio
              memories={memories}
              onSelectMemory={mem => setSelectedMemory(mem)}
              onNavigateCapture={() => setActiveTab('capture')}
              onOpenPhotosImport={() => setIsPhotosImportOpen(true)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Google Photos Import Modal */}
      <GooglePhotosImportModal
        isOpen={isPhotosImportOpen}
        onClose={() => setIsPhotosImportOpen(false)}
        onMemoriesImported={handleMemoriesImported}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        allMemories={memories}
        onClose={() => setSelectedMemory(null)}
        onDeleteMemory={handleDeleteMemory}
        onSelectMemory={mem => setSelectedMemory(mem)}
      />

      {/* Privacy & Data Settings Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onClearAllMemories={handleClearAll}
        onResetDemo={handleResetDemo}
        memoryCount={memories.length}
      />
    </div>
  );
}
