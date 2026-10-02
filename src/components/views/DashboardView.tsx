import React from 'react';
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Dumbbell,
  Brain,
  Sparkles,
  Zap,
  Snowflake,
} from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { getOverallArcStats } from '../../utils/arcStats';
import { StatusBadge } from '../common/StatusBadge';

interface DashboardViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
  onOpenCheckIn: () => void;
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  settings,
  onOpenCheckIn,
  onNavigate,
}) => {
  const stats = getOverallArcStats(records, settings);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records[todayStr];

  const hasRecords = Object.keys(records).length > 0;

  // Progress ring math
  const strokeDasharray = 283; // 2 * pi * 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * stats.completionPercentage) / 100;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#12141c] via-[#181b26] to-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Personal Daily Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            WINTER ARC <span className="text-sky-400 font-mono text-xl md:text-2xl font-bold ml-2">DAY {stats.currentDayNumber} / 90</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium max-w-xl">
            "Am I becoming better than I was yesterday?" Consistency beats intensity. Keep the promise.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={onOpenCheckIn}
            className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-sky-950/60 transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{todayRecord ? "Review / Edit Today's Record" : "Start Today's Check-In"}</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no data */}
      {!hasRecords && (
        <div className="bg-[#12141c] border border-sky-500/30 p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-sky-950/80 border border-sky-800 text-sky-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-950/50">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Your Arc starts today.</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Record your daily physical, mental, and deep work habits to begin tracking your 90-day transformation.
            </p>
          </div>
          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-sky-950/60 transition-all cursor-pointer"
          >
            <span>START DAY 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Stats Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Done</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.daysCompleted}</div>
          <div className="text-[11px] text-gray-500">Out of 90 days total</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.daysRemaining}</div>
          <div className="text-[11px] text-gray-500">Days to transformation</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.currentStreak} <span className="text-xs text-gray-400">days</span></div>
          <div className="text-[11px] text-gray-500">Score ≥ 70 target</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Best Streak</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">{stats.longestStreak} <span className="text-xs text-gray-400">days</span></div>
          <div className="text-[11px] text-gray-500">All-time record</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.completionPercentage}%</div>
          <div className="text-[11px] text-gray-500">90-day progress</div>
        </div>

        {/* Metric 6 */}
        <div className="bg-[#12141c] border border-gray-800/80 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
            <Brain className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{stats.averageScore} <span className="text-xs text-gray-400">/100</span></div>
          <div className="text-[11px] text-gray-500">Overall discipline</div>
        </div>
      </div>

      {/* Progress Ring & Today's Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large 90-Day Radial Progress Indicator */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-sky-400" /> 90-Day Arc Progress
          </h3>

          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-gray-800/60"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-sky-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono">
                {stats.currentDayNumber} <span className="text-gray-500 text-lg">/ 90</span>
              </span>
              <span className="text-xs font-bold text-sky-400 font-mono mt-0.5">
                {stats.completionPercentage}% COMPLETE
              </span>
            </div>
          </div>

          <div className="mt-4 w-full bg-gray-900/60 border border-gray-800/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Successful Days:</span>
            <span className="text-emerald-400 font-bold">{stats.totalSuccessfulDays} Days (≥70 pts)</span>
          </div>
        </div>

        {/* Today's Record Summary Card */}
        <div className="lg:col-span-2 bg-[#12141c] border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">TODAY'S RECORD</span>
              <h3 className="text-xl font-bold text-white flex items-center gap-3 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            {todayRecord ? (
              <StatusBadge status={todayRecord.status} showScore={todayRecord.score} size="lg" />
            ) : (
              <StatusBadge status="Not Recorded" size="lg" />
            )}
          </div>

          {todayRecord ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
              <div className="bg-[#090a0f] border border-gray-800/60 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-400" /> Physical
                </span>
                <p className="text-xs font-semibold text-gray-200">
                  {todayRecord.workout ? '🏋️ Workout Done' : '❌ No Workout'}
                </p>
                <p className="text-[11px] text-gray-500 font-mono">{todayRecord.sleepHours}h sleep</p>
              </div>

              <div className="bg-[#090a0f] border border-gray-800/60 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-purple-400" /> Discipline
                </span>
                <p className="text-xs font-semibold text-gray-200">
                  {todayRecord.scrollingControlled ? '📱 Scrolling OK' : '📱 Mindless scroll'}
                </p>
                <p className="text-[11px] text-gray-500 font-mono">{todayRecord.gamingMinutes}m gaming</p>
              </div>

              <div className="bg-[#090a0f] border border-gray-800/60 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Deep Work
                </span>
                <p className="text-xs font-semibold text-gray-200">
                  {todayRecord.deepWork ? '💻 Completed' : '❌ Missed'}
                </p>
                <p className="text-[11px] text-gray-500 font-mono">{todayRecord.deepWorkHours}h deep work</p>
              </div>

              <div className="bg-[#090a0f] border border-gray-800/60 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Daily Win
                </span>
                <p className="text-xs font-semibold text-gray-200 truncate">
                  {todayRecord.biggestWin || 'Not recorded yet'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#090a0f]/60 border border-dashed border-gray-800 rounded-xl p-6 text-center space-y-3">
              <p className="text-sm text-gray-400">
                You haven't recorded today's progress yet. It takes less than 2 minutes!
              </p>
              <button
                onClick={onOpenCheckIn}
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Complete Check-In Now
              </button>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
            <span className="text-gray-500 italic">"Discipline is built in ordinary days."</span>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View 90-Day Heatmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
