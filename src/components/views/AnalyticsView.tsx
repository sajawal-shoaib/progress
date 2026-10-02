import React, { useMemo } from 'react';
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
import { TrendingUp, Dumbbell, Clock, Moon, Scale, Activity, Brain } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';

interface AnalyticsViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, settings }) => {
  const chartData = useMemo(() => {
    const dates = Object.keys(records).sort();
    return dates.map((date) => {
      const r = records[date];
      return {
        date: date.slice(5), // MM-DD format for clean X axis
        fullDate: date,
        score: r.score,
        workout: r.workout ? 1 : 0,
        gamingMinutes: r.gamingMinutes || 0,
        gamingTarget: settings.gamingTargetMinutes || 60,
        deepWorkHours: r.deepWorkHours || 0,
        deepWorkTarget: settings.deepWorkTargetHours || 4,
        sleepHours: r.sleepHours || 0,
        sleepTarget: settings.sleepTargetHours || 7.5,
        weight: r.weight && r.weight > 0 ? r.weight : null,
      };
    });
  }, [records, settings]);

  const hasData = chartData.length > 0;
  const hasWeightData = chartData.some((d) => d.weight !== null);

  // Custom tooltip component for sleek dark theme
  const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#12141c] border border-gray-800 p-3 rounded-xl shadow-2xl text-xs font-mono">
          <p className="text-gray-400 font-bold mb-1">{payload[0]?.payload?.fullDate || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value} {unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <Activity className="w-4 h-4" /> Performance Metrics
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            ANALYTICS & PATTERNS
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Data-driven visual breakdown of your daily discipline across physical, mental, and deep work routines.
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-[#12141c] border border-gray-800 p-12 rounded-2xl text-center space-y-3">
          <Brain className="w-10 h-10 text-gray-600 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Keep checking in</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your behavioral patterns and trend lines will automatically generate here as you log your progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Daily Score Trend */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" /> Daily Score Progression
              </h3>
              <span className="text-xs font-mono text-sky-400">Target ≥ 70</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="pts" />} />
                  <ReferenceLine y={70} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Target 70', fill: '#38bdf8', fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ fill: '#38bdf8', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Deep Work Hours */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" /> Deep Work Hours
              </h3>
              <span className="text-xs font-mono text-emerald-400">Target: {settings.deepWorkTargetHours}h/day</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="hrs" />} />
                  <ReferenceLine y={settings.deepWorkTargetHours} stroke="#10b981" strokeDasharray="3 3" />
                  <Bar dataKey="deepWorkHours" name="Deep Work" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Gaming Time vs Configured Target */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Gaming Time (Mins)
              </h3>
              <span className="text-xs font-mono text-amber-400">Target ≤ {settings.gamingTargetMinutes}m</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="mins" />} />
                  <ReferenceLine y={settings.gamingTargetMinutes} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target Max', fill: '#f59e0b', fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="gamingMinutes"
                    name="Gaming"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Sleep Trend */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" /> Sleep Duration (Hours)
              </h3>
              <span className="text-xs font-mono text-indigo-400">Target: {settings.sleepTargetHours}h</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 12]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit="hrs" />} />
                  <ReferenceLine y={settings.sleepTargetHours} stroke="#818cf8" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="sleepHours"
                    name="Sleep"
                    stroke="#818cf8"
                    strokeWidth={2}
                    dot={{ fill: '#818cf8', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Workout Consistency */}
          <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-sky-400" /> Workout Consistency
              </h3>
              <span className="text-xs font-mono text-sky-400">1 = Workout Done</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="workout" name="Workout Done" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Weight Progression (if recorded) */}
          {hasWeightData && (
            <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" /> Body Weight Progression ({settings.weightUnit})
                </h3>
                <span className="text-xs font-mono text-purple-400">Physical metric only</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.filter((d) => d.weight !== null)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2434" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit={settings.weightUnit} />} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Weight"
                      stroke="#c084fc"
                      strokeWidth={2.5}
                      dot={{ fill: '#c084fc', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
