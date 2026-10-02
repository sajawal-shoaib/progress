import React, { useState } from 'react';
import { BookOpen, Search, Calendar, Award, Zap, Flame, Edit3 } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { StatusBadge } from '../common/StatusBadge';
import { TodayCheckInView } from './TodayCheckInView';

interface JournalViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
  onSaveRecord: (updated: DailyRecord) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ records, settings, onSaveRecord }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const sortedDates = Object.keys(records).sort().reverse(); // Chronological descending

  const filteredEntries = sortedDates.map((d) => records[d]).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.date.includes(q) ||
      (r.biggestWin && r.biggestWin.toLowerCase().includes(q)) ||
      (r.biggestDistraction && r.biggestDistraction.toLowerCase().includes(q)) ||
      (r.tomorrowFocus && r.tomorrowFocus.toLowerCase().includes(q)) ||
      (r.workDescription && r.workDescription.toLowerCase().includes(q)) ||
      (r.learning && r.learning.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <BookOpen className="w-4 h-4" /> Daily Reflections Timeline
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            WINTER ARC JOURNAL
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Chronological archive of your wins, obstacles, key learnings, and daily reflections.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by date or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090a0f] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((r) => (
            <div
              key={r.date}
              className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl hover:border-gray-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#090a0f] border border-gray-800 text-sky-400 font-mono font-bold text-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{r.date}</h3>
                    <span className="text-[11px] text-gray-500">
                      {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} showScore={r.score} size="md" />
                  <button
                    onClick={() => setEditingDate(r.date)}
                    className="p-1.5 text-gray-400 hover:text-white bg-[#090a0f] hover:bg-gray-800 border border-gray-800 rounded-lg transition-all cursor-pointer"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reflection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#090a0f] border border-gray-800/80 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> BIGGEST WIN
                  </span>
                  <p className="text-gray-200">{r.biggestWin || 'None logged'}</p>
                </div>

                <div className="bg-[#090a0f] border border-gray-800/80 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> BIGGEST DISTRACTION
                  </span>
                  <p className="text-gray-200">{r.biggestDistraction || 'None logged'}</p>
                </div>

                <div className="bg-[#090a0f] border border-gray-800/80 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-sky-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> TOMORROW'S FOCUS
                  </span>
                  <p className="text-gray-200">{r.tomorrowFocus || 'None logged'}</p>
                </div>
              </div>

              {/* Work & Learning notes if available */}
              {(r.workDescription || r.learning) && (
                <div className="bg-[#090a0f]/50 border border-gray-800/50 p-3 rounded-xl space-y-1.5 text-xs">
                  {r.workDescription && (
                    <p className="text-gray-400">
                      <strong className="text-gray-300">Deep Work:</strong> {r.workDescription} ({r.deepWorkHours}h)
                    </p>
                  )}
                  {r.learning && (
                    <p className="text-gray-400">
                      <strong className="text-gray-300">Learning:</strong> {r.learning}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-[#12141c] border border-gray-800 p-8 rounded-2xl text-center space-y-2">
            <BookOpen className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400">No journal reflections found matching your search.</p>
          </div>
        )}
      </div>

      {/* Editing View Overlay for Selected Date */}
      {editingDate && (
        <div className="fixed inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-md overflow-y-auto p-4 md:p-8">
          <TodayCheckInView
            initialDate={editingDate}
            records={records}
            settings={settings}
            onSaveSuccess={(updated) => {
              onSaveRecord(updated);
              setEditingDate(null);
            }}
            onClose={() => setEditingDate(null)}
          />
        </div>
      )}
    </div>
  );
};
