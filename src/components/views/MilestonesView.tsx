import React from 'react';
import { Trophy, Award, Sparkles, Scale, Dumbbell, Brain, Flame, CheckCircle2, Star } from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { calculateMilestones } from '../../utils/arcStats';

interface MilestonesViewProps {
  records: Record<string, DailyRecord>;
  settings: UserSettings;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ records, settings }) => {
  const checkpoints = calculateMilestones(records, settings);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-[#12141c] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-widest">
            <Trophy className="w-4 h-4" /> Transformation Milestones
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            30 / 60 / 90 DAY CHECKPOINTS
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Major milestone audits marking significant phases of your 90-day physical and mental evolution.
          </p>
        </div>
      </div>

      {/* 3 Checkpoint Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {checkpoints.map((cp) => {
          const is90 = cp.targetDay === 90;
          return (
            <div
              key={cp.targetDay}
              className={`bg-[#12141c] border rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between ${
                is90
                  ? 'border-purple-500/50 bg-gradient-to-b from-[#161226] to-[#12141c]'
                  : 'border-gray-800/80'
              }`}
            >
              {is90 && (
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl border ${
                        is90
                          ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                          : 'bg-sky-950/60 border-sky-800 text-sky-400'
                      }`}
                    >
                      {is90 ? <Star className="w-6 h-6 fill-purple-400" /> : <Trophy className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 uppercase">DAY {cp.targetDay}</span>
                      <h3 className="text-lg font-bold text-white">{cp.label}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    <span className="text-gray-400 font-mono">Average Score:</span>
                    <span className="font-mono font-bold text-white text-sm">{cp.avgScore} / 100</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    <span className="text-gray-400 font-mono">Workout Consistency:</span>
                    <span className="font-mono font-bold text-sky-400 text-sm">{cp.workoutConsistencyPct}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    <span className="text-gray-400 font-mono">Total Deep Work:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{cp.totalDeepWorkHours} hrs</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    <span className="text-gray-400 font-mono">Avg Gaming:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{cp.avgGamingMinutes} mins/day</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                    <span className="text-gray-400 font-mono">Reading Consistency:</span>
                    <span className="font-mono font-bold text-purple-300 text-sm">{cp.readingConsistencyPct}%</span>
                  </div>

                  {cp.startingWeight && cp.currentWeight && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090a0f] border border-gray-800">
                      <span className="text-gray-400 font-mono">Weight Progression:</span>
                      <span className="font-mono font-bold text-indigo-300 text-sm">
                        {cp.startingWeight} → {cp.currentWeight} {settings.weightUnit}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Badge Footer */}
              <div className="pt-4 border-t border-gray-800/60">
                {cp.isUnlocked ? (
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-xl justify-center">
                    <CheckCircle2 className="w-4 h-4" /> Checkpoint Reached! ({cp.successfulDays} successful days)
                  </div>
                ) : (
                  <div className="text-center text-xs font-mono text-gray-500 bg-[#090a0f] p-2.5 rounded-xl border border-gray-800">
                    Locked • Keep pushing to Day {cp.targetDay}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final 90-Day Complete Banner (Shown when Day 90 is reached/unlocked) */}
      {checkpoints[2].isUnlocked && (
        <div className="bg-gradient-to-r from-purple-950 via-[#161426] to-sky-950 border-2 border-purple-500 p-8 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-purple-500/20 border border-purple-400 text-purple-300 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white tracking-widest uppercase">
              🏆 90 DAYS COMPLETE 🏆
            </h3>
            <p className="text-sm text-purple-200 max-w-xl mx-auto font-medium">
              You executed the Winter Arc challenge with unflinching discipline. Your habits, focus, and mindset have been transformed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
