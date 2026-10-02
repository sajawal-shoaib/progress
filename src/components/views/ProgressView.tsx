import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Flame,
  Trophy,
  Calendar,
  Sparkles,
  Dumbbell,
  Brain,
  Moon,
  Clock,
  Laptop,
  Scale,
  Award,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { getOverallArcStats, calculateWeeklyReviews } from '../../utils/arcStats';
import {
  calculatePersonalRecords,
  calculateTrendAnalysis,
  calculateHabitPercentages,
} from '../../utils/progressStats';

interface ProgressViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
}

type TimeRangeFilter = '7' | '14' | '30' | '90';
type HabitFilter = 'all' | 'workout' | 'movement' | 'nutrition' | 'water' | 'dopamine' | 'gaming' | 'meditation' | 'reading' | 'deepWork' | 'sleep';

export const ProgressView: React.FC<ProgressViewProps> = ({ records, settings }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('90');
  const [habitFilter, setHabitFilter] = useState<HabitFilter>('all');
  const [selectedCell, setSelectedCell] = useState<{ dayNum: number; habitName: string; date: string; status: string; completed: boolean } | null>(null);

  const stats = getOverallArcStats(records, settings);
  const personalRecords = calculatePersonalRecords(records, settings);
  const trendAnalysis = calculateTrendAnalysis(records);
  const habitPercentages = calculateHabitPercentages(records, settings);
  const weeklyReviews = calculateWeeklyReviews(records, settings);

  const allDates = Object.keys(records).sort();
  const hasData = allDates.length > 0;

  // Filter dates based on selected time range
  const filteredDates = useMemo(() => {
    if (!hasData) return [];
    if (timeRange === '90') return allDates;
    const daysCount = parseInt(timeRange);
    return allDates.slice(Math.max(0, allDates.length - daysCount));
  }, [allDates, timeRange, hasData]);

  // Chart 1: 90-Day Score Data (Day 1 -> Day 90 array)
  const scoreChartData = useMemo(() => {
    const start = new Date(settings.startDate + 'T00:00:00');
    const result = [];
    for (let day = 1; day <= 90; day++) {
      const d = new Date(start);
      d.setDate(start.getDate() + (day - 1));
      const dateStr = d.toISOString().split('T')[0];
      const rec = records[dateStr];

      result.push({
        dayNumber: day,
        date: dateStr,
        label: `Day ${day}`,
        score: rec ? rec.score : null, // Future/unrecorded days are null (not zeroed out)
        status: rec ? rec.status : 'Not Recorded',
      });
    }
    return result;
  }, [records, settings.startDate]);

  // Chart 2: Weekly Performance Data
  const weeklyChartData = useMemo(() => {
    return weeklyReviews.map((w) => ({
      weekLabel: `W${w.weekNumber}`,
      weekNumber: w.weekNumber,
      avgScore: w.avgScore,
      successfulDays: w.successfulDays,
      workoutDays: w.workoutDays,
      deepWorkHours: w.deepWorkHours,
      readingDays: w.readingDays,
      hasData: w.recordedDays > 0,
    }));
  }, [weeklyReviews]);

  // Chart 3: Deep Work Trend
  const deepWorkChartData = useMemo(() => {
    return filteredDates.map((d) => ({
      date: d.slice(5),
      fullDate: d,
      hours: records[d].deepWorkHours || 0,
      target: settings.deepWorkTargetHours || 4,
    }));
  }, [records, filteredDates, settings]);

  // Chart 4: Gaming Trend
  const gamingChartData = useMemo(() => {
    return filteredDates.map((d) => ({
      date: d.slice(5),
      fullDate: d,
      minutes: records[d].gamingMinutes || 0,
      target: settings.gamingTargetMinutes || 45,
    }));
  }, [records, filteredDates, settings]);

  // Chart 5: Sleep Trend
  const sleepChartData = useMemo(() => {
    return filteredDates.map((d) => ({
      date: d.slice(5),
      fullDate: d,
      hours: records[d].sleepHours || 0,
      target: settings.sleepTargetHours || 7.5,
    }));
  }, [records, filteredDates, settings]);

  // Chart 6: Weight Progression
  const weightChartData = useMemo(() => {
    return allDates
      .filter((d) => records[d].weight && records[d].weight! > 0)
      .map((d) => ({
        date: d.slice(5),
        fullDate: d,
        weight: records[d].weight,
      }));
  }, [records, allDates]);

  // Chart 7: Workout Consistency per Week
  const workoutWeeklyData = useMemo(() => {
    return weeklyReviews.map((w) => ({
      weekLabel: `W${w.weekNumber}`,
      workouts: w.workoutDays,
    }));
  }, [weeklyReviews]);

  // Custom dark tooltip component
  const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#12141c] border border-gray-800 p-3 rounded-xl shadow-2xl text-xs font-mono">
          <p className="text-gray-400 font-bold mb-1">{data.fullDate || data.label || label}</p>
          {data.status && (
            <p className="text-sky-400 font-semibold mb-1">Status: {data.status}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value !== null ? `${entry.value} ${unit}` : 'Not Recorded'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dopamine Control %
  const dopamineControlPct = useMemo(() => {
    if (!hasData) return 0;
    const controlled = allDates.filter((d) => records[d].scrollingControlled).length;
    return Math.round((controlled / allDates.length) * 100);
  }, [records, allDates, hasData]);

  // Heatmap rows definition
  const heatmapHabits = [
    { id: 'workout', name: 'Workout', check: (r: DailyRecord) => r.workout },
    { id: 'movement', name: 'Movement', check: (r: DailyRecord) => r.movement },
    { id: 'nutrition', name: 'Nutrition', check: (r: DailyRecord) => r.nutrition },
    { id: 'water', name: 'Water', check: (r: DailyRecord) => r.water },
    { id: 'dopamine', name: 'Dopamine', check: (r: DailyRecord) => r.scrollingControlled },
    { id: 'gaming', name: 'Gaming', check: (r: DailyRecord) => r.gamingMinutes <= (settings.gamingTargetMinutes || 60) },
    { id: 'meditation', name: 'Meditation', check: (r: DailyRecord) => r.meditation },
    { id: 'reading', name: 'Reading', check: (r: DailyRecord) => r.reading },
    { id: 'deepWork', name: 'Deep Work', check: (r: DailyRecord) => r.deepWork },
    { id: 'promises', name: 'Promises', check: (r: DailyRecord) => r.promisesKept },
  ];

  const filteredHeatmapHabits = habitFilter === 'all'
    ? heatmapHabits
    : heatmapHabits.filter((h) => h.id === habitFilter);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" /> Transformation Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
            PROGRESS & ANALYTICS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            "Your 90-day transformation, visualized." • Am I actually getting better?
          </p>
        </div>

        {/* Compact Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-[#090a0f] p-2 rounded-xl border border-gray-800">
          <div className="flex items-center gap-1 text-xs text-gray-400 px-2 font-mono">
            <Filter className="w-3.5 h-3.5" /> Time:
          </div>
          {(['7', '14', '30', '90'] as TimeRangeFilter[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {range === '90' ? 'All 90D' : `${range}D`}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-800 mx-1" />

          <select
            value={habitFilter}
            onChange={(e) => setHabitFilter(e.target.value as HabitFilter)}
            className="bg-[#12141c] border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-200 font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Habits</option>
            <option value="workout">Workout</option>
            <option value="movement">Movement</option>
            <option value="nutrition">Nutrition</option>
            <option value="water">Water</option>
            <option value="dopamine">Dopamine</option>
            <option value="gaming">Gaming</option>
            <option value="meditation">Meditation</option>
            <option value="reading">Reading</option>
            <option value="deepWork">Deep Work</option>
            <option value="sleep">Sleep</option>
          </select>
        </div>
      </div>

      {/* 1. TOP SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Overall Progress</span>
          <p className="text-2xl font-black text-white font-mono">{stats.completionPercentage}%</p>
          <span className="text-[11px] text-sky-400 font-mono">Day {stats.currentDayNumber} / 90</span>
        </div>

        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Average Score</span>
          <p className="text-2xl font-black text-sky-400 font-mono">{stats.averageScore} <span className="text-xs text-gray-500">/ 100</span></p>
          <span className="text-[11px] text-gray-400 font-mono">{stats.daysCompleted} days recorded</span>
        </div>

        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Current Streak</span>
          <p className="text-2xl font-black text-amber-400 font-mono">{stats.currentStreak} <span className="text-xs text-gray-500">days</span></p>
          <span className="text-[11px] text-gray-400 font-mono">Score ≥ 70</span>
        </div>

        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Best Streak</span>
          <p className="text-2xl font-black text-purple-300 font-mono">{personalRecords.longestStreak} <span className="text-xs text-gray-500">days</span></p>
          <span className="text-[11px] text-gray-400 font-mono">Personal Record</span>
        </div>

        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Successful Days</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{stats.totalSuccessfulDays} <span className="text-xs text-gray-500">/ 90</span></p>
          <span className="text-[11px] text-emerald-400 font-mono">{Math.round((stats.totalSuccessfulDays / 90) * 100)}% target</span>
        </div>

        <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono block uppercase">Days Remaining</span>
          <p className="text-2xl font-black text-white font-mono">{stats.daysRemaining}</p>
          <span className="text-[11px] text-gray-500 font-mono">To transformation</span>
        </div>
      </div>

      {/* 2. 90-DAY DISCIPLINE SCORE GRAPH */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" /> 90-Day Discipline Score
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily score progression from Day 1 to Day 90.</p>
          </div>
          <span className="text-xs font-mono text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-xl">
            Target ≥ 70 pts
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
              <XAxis dataKey="dayNumber" stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(val) => `D${val}`} />
              <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip unit="pts" />} />
              <ReferenceLine y={70} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: '70 = Successful Day', fill: '#38bdf8', fontSize: 11, position: 'top' }} />
              <Line
                type="monotone"
                dataKey="score"
                name="Discipline Score"
                stroke="#38bdf8"
                strokeWidth={2.5}
                connectNulls={false}
                dot={{ fill: '#38bdf8', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 & 4. WEEKLY PERFORMANCE & CORE HABIT CONSISTENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Weekly Performance Bar Chart */}
        <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> Weekly Performance (Weeks 1–13)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                <XAxis dataKey="weekLabel" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#12141c] border border-gray-800 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1">
                          <p className="text-sky-400 font-bold">Week {data.weekNumber}</p>
                          <p className="text-white">Average Score: {data.avgScore} pts</p>
                          <p className="text-emerald-400">Successful Days: {data.successfulDays} / 7</p>
                          <p className="text-sky-300">Workout Days: {data.workoutDays} days</p>
                          <p className="text-purple-300">Deep Work: {data.deepWorkHours} hrs</p>
                          <p className="text-amber-300">Reading Days: {data.readingDays} days</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgScore" name="Avg Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Core Habit Consistency Horizontal Bar Chart */}
        <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Habit Consistency (%)
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">Sorted by execution</span>
          </div>

          {hasData ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {habitPercentages.map((item) => (
                <div key={item.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">{item.name}</span>
                    <span className="font-mono font-bold text-sky-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#090a0f] rounded-full h-2 overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#090a0f] border border-gray-800 p-8 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-gray-600 mx-auto" />
              <p className="text-xs text-gray-400">Complete your first check-in to see your habit consistency.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. PHYSICAL PROGRESS (BODY) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
          <Dumbbell className="w-5 h-5 text-sky-400" /> BODY — PHYSICAL PROGRESS
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Trend */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" /> Weight Progression ({settings.weightUnit})
              </h3>
            </div>
            {weightChartData.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip unit={settings.weightUnit} />} />
                    <Line type="monotone" dataKey="weight" name="Weight" stroke="#c084fc" strokeWidth={2.5} dot={{ fill: '#c084fc', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-[#090a0f] border border-gray-800/80 p-10 rounded-xl text-center space-y-2">
                <Scale className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-300">Start recording your weight to see your trend.</p>
                <p className="text-[11px] text-gray-500">Track body weight changes in Today's Check-In.</p>
              </div>
            )}
          </div>

          {/* Workout Consistency per Week */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-sky-400" /> Workouts Per Week
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="weekLabel" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 7]} ticks={[0, 2, 4, 6, 7]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="workouts" />} />
                  <Bar dataKey="workouts" name="Workouts" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MENTAL & DOPAMINE CONTROL (MIND) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
          <Brain className="w-5 h-5 text-purple-400" /> MIND — MENTAL & DOPAMINE CONTROL
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gaming Trend Line Chart */}
          <div className="lg:col-span-2 bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Gaming Time Trend (Minutes)
              </h3>
              <span className="text-xs font-mono text-amber-400">Target ≤ {settings.gamingTargetMinutes} min</span>
            </div>
            {hasData ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gamingChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip unit="mins" />} />
                    <ReferenceLine y={settings.gamingTargetMinutes} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Target ≤${settings.gamingTargetMinutes}m`, fill: '#f59e0b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="minutes" name="Gaming Mins" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-[#090a0f] border border-gray-800 p-8 rounded-xl text-center">
                <p className="text-xs text-gray-400">Complete your daily check-in to track gaming minutes.</p>
              </div>
            )}
          </div>

          {/* Dopamine Control Card */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Dopamine Control %
              </h3>
              <p className="text-xs text-gray-400">Days with mindless scrolling controlled.</p>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="text-5xl font-black text-purple-300 font-mono">{dopamineControlPct}%</div>
              <p className="text-xs text-gray-400 font-mono">
                {allDates.filter((d) => records[d].scrollingControlled).length} of {allDates.length} days controlled
              </p>
            </div>

            <div className="w-full bg-[#090a0f] rounded-full h-3 overflow-hidden border border-gray-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${dopamineControlPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7 & 8. DEEP WORK & SLEEP TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. Deep Work Graph */}
        <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" /> Deep Work Hours
            </h3>
            <span className="text-xs font-mono text-emerald-400">Target: {settings.deepWorkTargetHours} hrs/day</span>
          </div>

          {hasData ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deepWorkChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="hrs" />} />
                  <ReferenceLine y={settings.deepWorkTargetHours} stroke="#10b981" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="hours" name="Deep Work" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-[#090a0f] border border-gray-800 p-8 rounded-xl text-center space-y-1">
              <Laptop className="w-6 h-6 text-gray-600 mx-auto" />
              <p className="text-xs text-gray-400">Complete your first deep-work session to start this graph.</p>
            </div>
          )}
        </div>

        {/* 8. Sleep Trend */}
        <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" /> Sleep Duration Trend
            </h3>
            <span className="text-xs font-mono text-indigo-400">Target: {settings.sleepTargetHours} hrs</span>
          </div>

          {hasData ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 12]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="hrs" />} />
                  <ReferenceLine y={settings.sleepTargetHours} stroke="#818cf8" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="hours" name="Sleep Hours" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-[#090a0f] border border-gray-800 p-8 rounded-xl text-center">
              <p className="text-xs text-gray-400">Log your sleep hours to build pattern trends.</p>
            </div>
          )}
        </div>
      </div>

      {/* 9. 90-DAY CONSISTENCY HEATMAP */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" /> 90-Day Consistency Heatmap
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Habit execution matrix across all 90 days of the Arc.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80" /> Missed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" /> Unrecorded</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-3 no-scrollbar">
          <div className="min-w-[850px] space-y-2">
            {filteredHeatmapHabits.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <span className="w-28 text-xs font-mono font-semibold text-gray-300 truncate">{h.name}</span>
                <div className="flex-1 flex items-center gap-1">
                  {scoreChartData.map((d) => {
                    const rec = records[d.date];
                    const isRecorded = Boolean(rec);
                    const isDone = isRecorded && h.check(rec);

                    return (
                      <button
                        key={d.dayNumber}
                        onClick={() =>
                          setSelectedCell({
                            dayNum: d.dayNumber,
                            habitName: h.name,
                            date: d.date,
                            status: rec ? rec.status : 'Not Recorded',
                            completed: isDone,
                          })
                        }
                        title={`Day ${d.dayNumber} (${d.date}): ${h.name} - ${isDone ? 'Completed' : isRecorded ? 'Missed' : 'Unrecorded'}`}
                        className={`flex-1 h-5 rounded-sm transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-400 hover:brightness-125 shadow-sm'
                            : isRecorded
                            ? 'bg-rose-900/60 hover:bg-rose-800'
                            : 'bg-gray-800/60 border border-gray-800 hover:border-gray-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Cell Inspection Popup */}
        {selectedCell && (
          <div className="bg-[#090a0f] border border-sky-500/40 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in">
            <div className="space-y-0.5 font-mono">
              <span className="text-sky-400 font-bold">Day {selectedCell.dayNum} ({selectedCell.date})</span>
              <p className="text-white">Habit: <strong>{selectedCell.habitName}</strong></p>
              <p className="text-gray-400">Day Status: {selectedCell.status}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg font-bold font-mono ${selectedCell.completed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                {selectedCell.completed ? '✓ COMPLETED' : '❌ NOT COMPLETED'}
              </span>
              <button onClick={() => setSelectedCell(null)} className="text-gray-500 hover:text-white underline cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 10. PERSONAL RECORDS (PERSONAL BESTS) */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> PERSONAL RECORDS
        </h3>

        {personalRecords.totalRecordedDays >= 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">🔥 Longest Streak</span>
              <p className="text-base font-black text-amber-400 font-mono">{personalRecords.longestStreak} days</p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">🏋️ Peak Workouts/Wk</span>
              <p className="text-base font-black text-sky-400 font-mono">{personalRecords.mostWorkoutsInWeek} days</p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">💻 Peak Deep Work/Wk</span>
              <p className="text-base font-black text-emerald-400 font-mono">{personalRecords.mostDeepWorkInWeek} hrs</p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">📚 Reading Streak</span>
              <p className="text-base font-black text-purple-300 font-mono">{personalRecords.longestReadingStreak} days</p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">🎮 Lowest Gaming Avg</span>
              <p className="text-base font-black text-teal-300 font-mono">
                {personalRecords.lowestWeeklyGamingAvg !== null ? `${personalRecords.lowestWeeklyGamingAvg} m/d` : '—'}
              </p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">⭐ Highest Score</span>
              <p className="text-base font-black text-yellow-300 font-mono">{personalRecords.highestDailyScore} pts</p>
            </div>

            <div className="bg-[#090a0f] border border-gray-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono block">😴 Best Sleep Avg</span>
              <p className="text-base font-black text-indigo-300 font-mono">
                {personalRecords.bestSleepWeekAvg !== null ? `${personalRecords.bestSleepWeekAvg} h/d` : '—'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#090a0f] border border-gray-800 p-6 rounded-xl text-center">
            <span className="text-xs font-mono text-gray-500">Not enough data yet</span>
          </div>
        )}
      </div>

      {/* 11. TREND ANALYSIS (AM I IMPROVING?) */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" /> AM I IMPROVING? (Mathematical Analysis)
        </h3>

        {trendAnalysis.hasEnoughData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              trendAnalysis.scoreTrend,
              trendAnalysis.workoutTrend,
              trendAnalysis.gamingTrend,
              trendAnalysis.deepWorkTrend,
              trendAnalysis.readingTrend,
            ].map((trend) => {
              const isImproving = trend.direction === 'improving';
              const isDeclining = trend.direction === 'declining';

              return (
                <div key={trend.label} className="bg-[#090a0f] border border-gray-800 p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-gray-400 block truncate">{trend.label}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">
                      {trend.firstValue} → {trend.lastValue} {trend.unit}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        isImproving
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isDeclining
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {isImproving ? <ArrowUpRight className="w-3.5 h-3.5" /> : isDeclining ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      {isImproving ? 'Improving' : isDeclining ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#090a0f] border border-gray-800 p-6 rounded-xl text-center space-y-1">
            <p className="text-xs text-gray-400 font-mono">
              Complete at least 7 daily check-ins to unlock mathematical trend comparisons (First 7 vs Last 7 days).
            </p>
          </div>
        )}
      </div>

      {/* 12. 30 / 60 / 90 DAY TRANSFORMATION TIMELINE */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" /> 30 / 60 / 90 DAY TRANSFORMATION JOURNEY
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[30, 60, 90].map((milestoneDay) => {
            const isUnlocked = stats.daysCompleted >= milestoneDay;
            return (
              <div
                key={milestoneDay}
                className={`bg-[#090a0f] border p-5 rounded-xl space-y-3 ${
                  isUnlocked ? 'border-purple-500/50 bg-purple-950/20' : 'border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-mono font-bold text-purple-400">DAY {milestoneDay} CHECKPOINT</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${isUnlocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-500'}`}>
                    {isUnlocked ? '✓ UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-400">
                    <span>Target Phase:</span>
                    <span className="text-white font-bold">{milestoneDay === 30 ? 'Foundation' : milestoneDay === 60 ? 'Momentum' : 'Mastery'}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Status:</span>
                    <span className={isUnlocked ? 'text-emerald-400' : 'text-gray-500'}>
                      {isUnlocked ? 'Milestone Reached' : `In Progress (${stats.daysCompleted}/${milestoneDay} Days)`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
