import React, { useState } from 'react';
import { Calendar as CalendarIcon, Edit3, X, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { StatusBadge } from '../common/StatusBadge';
import { TodayCheckInView } from './TodayCheckInView';

interface CalendarViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
  onSaveRecord: (updated: DailyRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  settings,
  onSaveRecord,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);

  const startDate = new Date(settings.startDate);

  // Generate 90 day slots starting from startDate
  const dayTiles = Array.from({ length: 90 }, (_, index) => {
    const tileDate = new Date(startDate);
    tileDate.setDate(startDate.getDate() + index);
    const dateStr = tileDate.toISOString().split('T')[0];
    const record = records[dateStr];

    return {
      dayNumber: index + 1,
      dateStr,
      record,
      tileDate,
    };
  });

  const activeSelectedRecord = selectedDate ? records[selectedDate] : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4" /> Interactive Heatmap
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            90-DAY WINTER ARC CALENDAR
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Click any tile to inspect or edit records for that day.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-[#090a0f] p-3 rounded-xl border border-gray-800/80 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
            <span className="text-gray-300">Strong (85-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500 shadow-sm" />
            <span className="text-gray-300">Good (70-84)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 shadow-sm" />
            <span className="text-gray-300">Weak (50-69)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 shadow-sm" />
            <span className="text-gray-300">Bad (0-49)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-800 border border-gray-700" />
            <span className="text-gray-500">Not Recorded</span>
          </div>
        </div>
      </div>

      {/* 90-Day Grid */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-10 lg:grid-cols-15 gap-2.5">
          {dayTiles.map((tile) => {
            const { dayNumber, dateStr, record } = tile;

            let tileBg = 'bg-[#090a0f] border-gray-800 text-gray-500 hover:border-gray-700';
            if (record) {
              if (record.score >= 85) {
                tileBg = 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 shadow-emerald-950/30 hover:border-emerald-400';
              } else if (record.score >= 70) {
                tileBg = 'bg-sky-950/80 border-sky-600/70 text-sky-300 shadow-sky-950/30 hover:border-sky-400';
              } else if (record.score >= 50) {
                tileBg = 'bg-amber-950/80 border-amber-600/70 text-amber-300 shadow-amber-950/30 hover:border-amber-400';
              } else {
                tileBg = 'bg-rose-950/80 border-rose-600/70 text-rose-300 shadow-rose-950/30 hover:border-rose-400';
              }
            }

            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={dayNumber}
                onClick={() => {
                  setSelectedDate(dateStr);
                }}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all duration-200 aspect-square group cursor-pointer ${tileBg} ${
                  isToday ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#12141c]' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono opacity-80">
                  <span>D{dayNumber}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
                </div>

                <div className="font-mono font-black text-sm my-auto">
                  {record ? record.score : '—'}
                </div>

                <div className="text-[9px] font-mono truncate w-full text-center opacity-60">
                  {tile.tileDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal Drawer */}
      {selectedDate && !isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-in relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs font-mono text-gray-400">DAY RECORD DETAILS</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedDate}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeSelectedRecord ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between bg-[#090a0f] p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 font-mono">Daily Score:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-black text-white">{activeSelectedRecord.score}/100</span>
                    <StatusBadge status={activeSelectedRecord.status} size="sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div className="bg-[#090a0f] p-2.5 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-500 font-mono block">PHYSICAL</span>
                    <span>Workout: {activeSelectedRecord.workout ? '✅ Yes' : '❌ No'}</span><br />
                    <span>Sleep: {activeSelectedRecord.sleepHours}h</span>
                  </div>

                  <div className="bg-[#090a0f] p-2.5 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-500 font-mono block">DISCIPLINE</span>
                    <span>Gaming: {activeSelectedRecord.gamingMinutes}m</span><br />
                    <span>Scrolling OK: {activeSelectedRecord.scrollingControlled ? '✅ Yes' : '❌ No'}</span>
                  </div>
                </div>

                {activeSelectedRecord.biggestWin && (
                  <div className="bg-[#090a0f] p-3 rounded-lg border border-gray-800 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block">BIGGEST WIN</span>
                    <p className="text-gray-200">{activeSelectedRecord.biggestWin}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-gray-400">No record logged for this day yet.</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsEditingModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>{activeSelectedRecord ? 'Edit This Record' : 'Record This Day'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing View Overlay for Selected Past Day */}
      {selectedDate && isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-md overflow-y-auto p-4 md:p-8">
          <TodayCheckInView
            initialDate={selectedDate}
            records={records}
            settings={settings}
            onSaveSuccess={(updated) => {
              onSaveRecord(updated);
              setIsEditingModalOpen(false);
              setSelectedDate(null);
            }}
            onClose={() => setIsEditingModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
