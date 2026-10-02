import React from 'react';
import { Snowflake, CheckCircle2, Flame, PlusCircle } from 'lucide-react';
import { DailyRecord } from '../../types/winterArc';
import { StatusBadge } from '../common/StatusBadge';

interface NavbarProps {
  todayRecord?: DailyRecord;
  onOpenCheckIn: () => void;
  isSavedJustNow: boolean;
  currentDayNumber: number;
  currentStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  todayRecord,
  onOpenCheckIn,
  isSavedJustNow,
  currentDayNumber,
  currentStreak,
}) => {
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-[#090a0f]/90 backdrop-blur-md border-b border-[#1f2434] sticky top-0 z-20 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title / Mobile Header */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400">
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">WINTER ARC</h1>
              <p className="text-[10px] text-sky-400 font-mono">DAY {currentDayNumber}/90</p>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400">{formattedToday}</span>
              {isSavedJustNow && (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved ✓
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side stats & CTA */}
        <div className="flex items-center gap-3">
          {/* Today's Status Pill */}
          {todayRecord ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-400">Today:</span>
              <StatusBadge status={todayRecord.status} showScore={todayRecord.score} size="sm" />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-500">Today:</span>
              <StatusBadge status="Not Recorded" size="sm" />
            </div>
          )}

          <div className="md:hidden flex items-center gap-1 text-amber-400 font-mono text-xs font-bold bg-amber-950/30 border border-amber-900/40 px-2 py-1 rounded-md">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Check-in Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-sky-950/50 hover:shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{todayRecord ? "Edit Today's Check-In" : "Start Today's Check-In"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
