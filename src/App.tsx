import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/views/DashboardView';
import { TodayCheckInView } from './components/views/TodayCheckInView';
import { CalendarView } from './components/views/CalendarView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { WeeklyReviewView } from './components/views/WeeklyReviewView';
import { MilestonesView } from './components/views/MilestonesView';
import { ProgressView } from './components/views/ProgressView';
import { JournalView } from './components/views/JournalView';
import { SettingsView } from './components/views/SettingsView';
import { AuthModal } from './components/auth/AuthModal';

import { NavigationTab, DailyRecord, UserSettings } from './types/winterArc';
import { getStoredSettings, getStoredRecords, saveStoredSettings, syncWithSupabase } from './utils/storage';
import { getOverallArcStats } from './utils/arcStats';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings);
  const [records, setRecords] = useState<Record<string, DailyRecord>>(getStoredRecords);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isSavedJustNow, setIsSavedJustNow] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleCloudSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { settings: syncedSettings, records: syncedRecords } = await syncWithSupabase();
      setSettings(syncedSettings);
      setRecords(syncedRecords);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial load + Supabase auth state listener
  useEffect(() => {
    setSettings(getStoredSettings());
    setRecords(getStoredRecords());

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setIsLoggedIn(true);
          handleCloudSync();
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const loggedIn = Boolean(session?.user);
        setIsLoggedIn(loggedIn);
        if (loggedIn) handleCloudSync();
      });

      return () => listener.subscription.unsubscribe();
    }
  }, [handleCloudSync]);

  const overallStats = getOverallArcStats(records, settings);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records[todayStr];

  const handleSaveRecord = (updatedRecord: DailyRecord) => {
    setRecords((prev) => ({ ...prev, [updatedRecord.date]: updatedRecord }));
    setIsSavedJustNow(true);
    setTimeout(() => setIsSavedJustNow(false), 3000);
  };

  const handleUpdateSettings = (updated: UserSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            records={records}
            settings={settings}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'today':
        return (
          <TodayCheckInView
            records={records}
            settings={settings}
            onSaveSuccess={handleSaveRecord}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            records={records}
            settings={settings}
            onSaveRecord={handleSaveRecord}
          />
        );
      case 'habits':
        return <ProgressView records={records} settings={settings} />;
      case 'analytics':
        return <AnalyticsView records={records} settings={settings} />;
      case 'journal':
        return (
          <JournalView
            records={records}
            settings={settings}
            onSaveRecord={handleSaveRecord}
          />
        );
      case 'milestones':
        return <MilestonesView records={records} settings={settings} />;
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReloadRecords={(reloaded) => setRecords(reloaded)}
          />
        );
      default:
        return (
          <DashboardView
            records={records}
            settings={settings}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col md:flex-row antialiased">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDayNumber={overallStats.currentDayNumber}
        currentStreak={overallStats.currentStreak}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
        {/* Top Navbar */}
        <Navbar
          todayRecord={todayRecord}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          isSavedJustNow={isSavedJustNow}
          currentDayNumber={overallStats.currentDayNumber}
          currentStreak={overallStats.currentStreak}
          onOpenAuth={() => setIsAuthOpen(true)}
          isLoggedIn={isLoggedIn}
          isSyncing={isSyncing}
          onSync={handleCloudSync}
        />

        {/* View Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Today's Check-In Floating Modal Overlay */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-md overflow-y-auto p-4 md:p-8">
          <TodayCheckInView
            records={records}
            settings={settings}
            onSaveSuccess={(updated) => {
              handleSaveRecord(updated);
              setIsCheckInOpen(false);
            }}
            onClose={() => setIsCheckInOpen(false)}
          />
        </div>
      )}

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSyncTriggered={handleCloudSync}
      />
    </div>
  );
};

export default App;
