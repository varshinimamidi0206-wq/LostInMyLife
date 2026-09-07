import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Memory } from './types/memory';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { TopNav } from './components/navigation/TopNav';
import { HomeScreen } from './components/home/HomeScreen';
import { CaptureScreen } from './components/capture/CaptureScreen';
import { MemoriesScreen } from './components/memories/MemoriesScreen';
import { AskScreen } from './components/ask/AskScreen';
import { MemoryStudio } from './components/studio/MemoryStudio';
import { MemoryDetailPage } from './components/memories/MemoryDetailPage';
import { PrivacyModal } from './components/common/PrivacyModal';
import { DemoBanner } from './components/common/DemoBanner';
import { LoginScreen } from './components/auth/LoginScreen';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import {
  getLocalMemories,
  addLocalMemory,
  removeLocalMemory,
  clearAllLocalMemories,
  resetToDemoData,
  syncMemories,
  persistMemory,
  deleteMemoryRecord,
  getDemoModeSetting,
  setDemoModeSetting,
} from './services/storage';

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<boolean>(getDemoModeSetting());
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');

  // Initial and reactive memory loading per authenticated user
  useEffect(() => {
    const userId = user?.id || null;
    const initial = getLocalMemories(userId);
    setMemories(initial);

    if (userId) {
      syncMemories(userId).then(synced => {
        if (synced) {
          setMemories(synced);
        }
      });
    }
  }, [user?.id]);

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    setDemoModeSetting(next);
    if (next && memories.length === 0) {
      const reloaded = resetToDemoData(user?.id);
      setMemories(reloaded);
    }
  };

  const handleMemoryCreated = async (newMem: Memory) => {
    const updated = addLocalMemory(newMem, user?.id);
    setMemories(updated);
    if (user?.id) {
      await persistMemory(newMem, user.id);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemoryRecord(id, user?.id);
    const updated = removeLocalMemory(id, user?.id);
    setMemories(updated);
  };

  const handleClearAll = () => {
    const empty = clearAllLocalMemories(user?.id);
    setMemories(empty);
  };

  const handleResetDemo = () => {
    const reset = resetToDemoData(user?.id);
    setMemories(reset);
  };

  const handleQuickAsk = (question: string) => {
    setAskInitialQuery(question);
    navigate('/ask');
  };

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Application Layout */}
      <Route
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-950 text-slate-100 font-sans">
              {/* Desktop Navigation Sidebar (1024px+) */}
              <Sidebar
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
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
                    onNavigate={tab => navigate(`/${tab}`)}
                  />
                )}

                {/* Dynamic Screen Views via Outlet */}
                <main className="flex-1">
                  <Outlet />
                </main>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
              </div>

              {/* Privacy & Data Settings Modal */}
              <PrivacyModal
                isOpen={isPrivacyOpen}
                onClose={() => setIsPrivacyOpen(false)}
                onClearAllMemories={handleClearAll}
                onResetDemo={handleResetDemo}
                memoryCount={memories.length}
              />
            </div>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <HomeScreen
              recentMemories={memories}
              onNavigate={tab => navigate(`/${tab}`)}
              onSelectMemory={mem => navigate(`/memory/${mem.id}`)}
            />
          }
        />
        <Route
          path="/capture"
          element={
            <CaptureScreen
              existingMemories={memories}
              onMemoryCreated={handleMemoryCreated}
              onViewMemory={mem => navigate(`/memory/${mem.id}`)}
            />
          }
        />
        <Route
          path="/memories"
          element={
            <MemoriesScreen
              memories={memories}
              onSelectMemory={mem => navigate(`/memory/${mem.id}`)}
              onNavigateCapture={() => navigate('/capture')}
            />
          }
        />
        <Route
          path="/ask"
          element={
            <AskScreen
              memories={memories}
              onSelectMemory={mem => navigate(`/memory/${mem.id}`)}
              initialQuery={askInitialQuery}
            />
          }
        />
        <Route
          path="/timeline"
          element={
            <MemoryStudio
              memories={memories}
              onSelectMemory={mem => navigate(`/memory/${mem.id}`)}
              onNavigateCapture={() => navigate('/capture')}
            />
          }
        />
        <Route path="/studio" element={<Navigate to="/timeline" replace />} />
        <Route
          path="/memory/:id"
          element={
            <MemoryDetailPage
              memories={memories}
              onDeleteMemory={handleDeleteMemory}
            />
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
