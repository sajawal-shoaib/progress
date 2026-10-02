import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Scale,
  Clock,
  Laptop,
  BookOpen,
  Moon,
  Droplet,
} from 'lucide-react';
import { UserSettings, DailyRecord } from '../../types/winterArc';
import { saveStoredSettings, exportDataAsJSON, importDataFromJSON, clearAllData } from '../../utils/storage';
import { generateSampleData } from '../../utils/arcStats';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updated: UserSettings) => void;
  onReloadRecords: (records: Record<string, DailyRecord>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onReloadRecords,
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(formData);
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winter-arc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success) {
        setImportMessage({ text: res.message });
        window.location.reload();
      } else {
        setImportMessage({ text: res.message, isError: true });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateDemoData = () => {
    if (window.confirm('Generate 45 days of realistic mock data for instant analytics & calendar testing? Existing dates will be updated.')) {
      const generated = generateSampleData(formData);
      onReloadRecords(generated);
      setImportMessage({ text: 'Generated 45 days of realistic Winter Arc history!' });
    }
  };

  const handleResetData = () => {
    clearAllData();
    window.location.reload();
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <SettingsIcon className="w-4 h-4" /> System Configuration
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            SETTINGS & DATA MANAGEMENT
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Customize target metrics, start dates, weight units, and data backups.
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved ✓
          </span>
        )}
      </div>

      {importMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-mono border flex items-center justify-between ${
            importMessage.isError
              ? 'bg-rose-950/60 text-rose-300 border-rose-800'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
          }`}
        >
          <span>{importMessage.text}</span>
          <button onClick={() => setImportMessage(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Arc Setup */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3">
            Winter Arc Program Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Winter Arc Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Body Weight Unit</label>
              <select
                value={formData.weightUnit}
                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as 'kg' | 'lb' })}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Habit Targets (Used for scoring calculation) */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3">
            Daily Habit Targets & Scoring Config
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 bg-[#090a0f] p-3 rounded-xl border border-gray-800">
              <label className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Daily Gaming Target (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={formData.gamingTargetMinutes}
                onChange={(e) => setFormData({ ...formData, gamingTargetMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <p className="text-[10px] text-gray-500">
                ≤ Target: 5 pts • ≤ 1.5x Target: 2.5 pts • Over: 0 pts
              </p>
            </div>

            <div className="space-y-1.5 bg-[#090a0f] p-3 rounded-xl border border-gray-800">
              <label className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" /> Daily Deep Work Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={formData.deepWorkTargetHours}
                onChange={(e) => setFormData({ ...formData, deepWorkTargetHours: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <p className="text-[10px] text-gray-500">Proportional 10 pts max score calculation.</p>
            </div>

            <div className="space-y-1.5 bg-[#090a0f] p-3 rounded-xl border border-gray-800">
              <label className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Daily Sleep Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="10"
                value={formData.sleepTargetHours}
                onChange={(e) => setFormData({ ...formData, sleepTargetHours: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5 bg-[#090a0f] p-3 rounded-xl border border-gray-800">
              <label className="font-semibold text-sky-400 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5" /> Water Target (Liters)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="6"
                value={formData.waterTargetLiters}
                onChange={(e) => setFormData({ ...formData, waterTargetLiters: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Demo Data & Persistence Actions */}
      <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 space-y-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3">
          Data Backup, Restore & Testing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Demo Data Generator */}
          <div className="bg-[#090a0f] border border-sky-500/30 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Demo Generator
              </span>
              <p className="text-gray-400 text-[11px]">
                Populate 45 days of realistic data to test analytics & calendar instantly.
              </p>
            </div>
            <button
              onClick={handleGenerateDemoData}
              className="w-full flex items-center justify-center gap-2 bg-sky-950 border border-sky-800 text-sky-300 hover:bg-sky-900 font-bold py-2 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate 45 Days
            </button>
          </div>

          {/* Export JSON */}
          <div className="bg-[#090a0f] border border-gray-800 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" /> Export Backup
              </span>
              <p className="text-gray-400 text-[11px]">Download all records and settings as JSON.</p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 font-bold py-2 rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          {/* Import JSON */}
          <div className="bg-[#090a0f] border border-gray-800 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-purple-400" /> Import Backup
              </span>
              <p className="text-gray-400 text-[11px]">Restore data from a JSON backup file.</p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 font-bold py-2 rounded-lg transition-all cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" /> Select JSON File
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Reset All Data Danger Zone */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Reset All Data
            </span>
            <p className="text-[11px] text-gray-500">Permanently delete all local records from this device.</p>
          </div>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 text-rose-400 hover:bg-rose-900 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-rose-900/60 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset All Application Data?</h3>
                <p className="text-xs text-rose-300 font-mono">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Are you sure you want to erase all 90-day daily records and reset user settings back to defaults?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl bg-gray-800/40 hover:bg-gray-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
