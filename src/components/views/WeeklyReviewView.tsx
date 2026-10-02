import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Award, Zap, AlertTriangle, CheckCircle2, TrendingUp, Dumbbell, Brain, Moon, Clock } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { calculateWeeklyReviews } from '../../utils/arcStats';

interface WeeklyReviewViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({ records, settings }) => {
  const weeks = calculateWeeklyReviews(records, settings);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);

  const selectedWeek = weeks.find((w) => w.weekNumber === selectedWeekNum) || weeks[0];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <Calendar className="w-4 h-4" /> 7-Day Performance Audits
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            WEEKLY REVIEWS & AUDITS
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Automated 7-day retrospective analysis identifying strong habits, weak points, and focus areas.
          </p>
        </div>

        {/* Week Selector Dropdown / Carousel */}
        <div className="flex items-center gap-2 bg-[#090a0f] p-1.5 rounded-xl border border-gray-800">
          <button
            disabled={selectedWeekNum <= 1}
            onClick={() => setSelectedWeekNum((prev) => Math.max(1, prev - 1))}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-white px-3">
            WEEK {selectedWeekNum} / 13
          </span>
          <button
            disabled={selectedWeekNum >= 13}
            onClick={() => setSelectedWeekNum((prev) => Math.min(13, prev + 1))}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {weeks.map((w) => {
          const isSelected = w.weekNumber === selectedWeekNum;
          const hasRecords = w.recordedDays > 0;
          return (
            <button
              key={w.weekNumber}
              onClick={() => setSelectedWeekNum(w.weekNumber)}
              className={`flex-1 min-w-[70px] py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-md shadow-sky-950/30 font-bold'
                  : hasRecords
                  ? 'bg-[#12141c] border-gray-800 text-gray-300 hover:border-gray-700'
                  : 'bg-[#090a0f] border-gray-800/40 text-gray-600'
              }`}
            >
              <div className="text-[10px] font-mono opacity-80">W{w.weekNumber}</div>
              <div className="text-xs font-mono font-bold mt-0.5">
                {hasRecords ? `${w.avgScore} pts` : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Week Detailed Card */}
      <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>Dates: {selectedWeek.startDate} to {selectedWeek.endDate}</span>
              <span>•</span>
              <span className="text-sky-400 font-bold">{selectedWeek.recordedDays} / 7 Days Recorded</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Week {selectedWeek.weekNumber} Summary
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#090a0f] border border-gray-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-500 font-mono block uppercase">Weekly Avg</span>
              <span className="text-2xl font-black text-sky-400 font-mono">{selectedWeek.avgScore}</span>
            </div>
            <div className="bg-[#090a0f] border border-gray-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-500 font-mono block uppercase">Successful Days</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{selectedWeek.successfulDays} <span className="text-xs text-gray-500">/ 7</span></span>
            </div>
          </div>
        </div>

        {/* Dynamic Rule-Based Insights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strongest Habit */}
          <div className="bg-[#090a0f] border border-emerald-900/50 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" /> STRONGEST HABIT
            </span>
            <p className="text-base font-extrabold text-white">{selectedWeek.strongestHabit}</p>
            <p className="text-[11px] text-gray-400">Highest consistency in this 7-day period.</p>
          </div>

          {/* Weakest Habit */}
          <div className="bg-[#090a0f] border border-amber-900/50 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> WEAKEST HABIT
            </span>
            <p className="text-base font-extrabold text-white">{selectedWeek.weakestHabit}</p>
            <p className="text-[11px] text-gray-400">Requires targeted discipline next week.</p>
          </div>

          {/* Main Improvement Area */}
          <div className="bg-[#090a0f] border border-sky-900/50 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-mono text-sky-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> MAIN IMPROVEMENT AREA
            </span>
            <p className="text-xs font-bold text-gray-200">{selectedWeek.mainImprovementArea}</p>
            <p className="text-[11px] text-gray-400">Calculated directly from stored habit logs.</p>
          </div>
        </div>

        {/* 7 Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Workouts</span>
            <p className="text-base font-black text-white font-mono">{selectedWeek.workoutDays} <span className="text-xs text-gray-500">/ 7 days</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Avg Sleep</span>
            <p className="text-base font-black text-white font-mono">{selectedWeek.avgSleep} <span className="text-xs text-gray-500">hrs</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Avg Gaming</span>
            <p className="text-base font-black text-white font-mono">{selectedWeek.avgGaming} <span className="text-xs text-gray-500">mins</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Deep Work</span>
            <p className="text-base font-black text-white font-mono">{selectedWeek.deepWorkHours} <span className="text-xs text-gray-500">hrs total</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Reading Days</span>
            <p className="text-base font-black text-white font-mono">{selectedWeek.readingDays} <span className="text-xs text-gray-500">/ 7 days</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Successful</span>
            <p className="text-base font-black text-emerald-400 font-mono">{selectedWeek.successfulDays} <span className="text-xs text-gray-500">days</span></p>
          </div>

          <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Missed Days</span>
            <p className="text-base font-black text-rose-400 font-mono">{selectedWeek.missedDays} <span className="text-xs text-gray-500">days</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
