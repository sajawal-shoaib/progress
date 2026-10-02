import React from 'react';
import { Activity, Dumbbell, Footprints, Salad, Moon, Smartphone, Gamepad2, BookOpen, Laptop, Brain, Flame } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';

interface HabitsViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
}

export const HabitsView: React.FC<HabitsViewProps> = ({ records, settings }) => {
  const dates = Object.keys(records).sort();
  const totalRecorded = dates.length;

  const coreHabits = [
    {
      id: 'workout',
      name: 'Workout',
      icon: <Dumbbell className="w-5 h-5 text-sky-400" />,
      check: (r: DailyRecord) => r.workout,
    },
    {
      id: 'movement',
      name: 'Daily Movement',
      icon: <Footprints className="w-5 h-5 text-emerald-400" />,
      check: (r: DailyRecord) => r.movement,
    },
    {
      id: 'nutrition',
      name: 'Nutrition Followed',
      icon: <Salad className="w-5 h-5 text-green-400" />,
      check: (r: DailyRecord) => r.nutrition,
    },
    {
      id: 'sleep',
      name: 'Sleep Target',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
      check: (r: DailyRecord) => r.sleepHours >= (settings.sleepTargetHours || 7.5),
    },
    {
      id: 'dopamine',
      name: 'Dopamine Control',
      icon: <Smartphone className="w-5 h-5 text-purple-400" />,
      check: (r: DailyRecord) => r.scrollingControlled,
    },
    {
      id: 'gaming',
      name: 'Gaming Control',
      icon: <Gamepad2 className="w-5 h-5 text-amber-400" />,
      check: (r: DailyRecord) => r.gamingMinutes <= (settings.gamingTargetMinutes || 60),
    },
    {
      id: 'reading',
      name: 'Reading Target',
      icon: <BookOpen className="w-5 h-5 text-teal-400" />,
      check: (r: DailyRecord) => r.reading,
    },
    {
      id: 'deepWork',
      name: 'Deep Work',
      icon: <Laptop className="w-5 h-5 text-blue-400" />,
      check: (r: DailyRecord) => r.deepWork,
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: <Brain className="w-5 h-5 text-rose-400" />,
      check: (r: DailyRecord) => r.meditation,
    },
    {
      id: 'promises',
      name: 'Kept Promises',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      check: (r: DailyRecord) => r.promisesKept,
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <Activity className="w-4 h-4" /> Non-Negotiable Routines
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            CORE HABIT TRACKER
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Track individual completion percentages, streaks, and day-by-day execution logs for each core habit.
          </p>
        </div>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coreHabits.map((habit) => {
          let successCount = 0;
          let currentStreak = 0;
          let bestStreak = 0;
          let tempStreak = 0;

          const history = dates.map((date) => {
            const r = records[date];
            const isSuccess = habit.check(r);
            if (isSuccess) {
              successCount++;
              tempStreak++;
              if (tempStreak > bestStreak) bestStreak = tempStreak;
            } else {
              tempStreak = 0;
            }
            return { date, isSuccess };
          });

          // Calculate active current streak
          for (let i = dates.length - 1; i >= 0; i--) {
            const r = records[dates[i]];
            if (habit.check(r)) {
              currentStreak++;
            } else {
              break;
            }
          }

          const completionPct = totalRecorded > 0 ? Math.round((successCount / totalRecorded) * 100) : 0;

          return (
            <div
              key={habit.id}
              className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl hover:border-gray-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    {habit.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{habit.name}</h3>
                    <span className="text-[11px] font-mono text-gray-400">
                      {successCount} / {totalRecorded} days completed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black font-mono text-sky-400">{completionPct}%</span>
                  <span className="text-[10px] text-gray-500 font-mono block">COMPLETION</span>
                </div>
              </div>

              {/* Streaks row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#090a0f] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                  <span className="text-gray-400 font-mono">Current Streak:</span>
                  <span className="font-mono font-bold text-amber-400">{currentStreak} days</span>
                </div>
                <div className="bg-[#090a0f] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                  <span className="text-gray-400 font-mono">Best Streak:</span>
                  <span className="font-mono font-bold text-purple-400">{bestStreak} days</span>
                </div>
              </div>

              {/* 90-Day Mini History Blocks */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Log History</span>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {history.length > 0 ? (
                    history.map((h, idx) => (
                      <div
                        key={idx}
                        title={`${h.date}: ${h.isSuccess ? 'Completed' : 'Missed'}`}
                        className={`w-3.5 h-3.5 rounded-sm transition-all flex-shrink-0 ${
                          h.isSuccess
                            ? 'bg-sky-400 shadow-sm shadow-sky-950'
                            : 'bg-gray-800 border border-gray-700'
                        }`}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-gray-600 italic">No records logged yet.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
