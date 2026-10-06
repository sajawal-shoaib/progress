import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Brain,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
  Info,
  Clock,
  Droplet,
  Moon,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { DailyRecord, UserSettings } from '../../types/winterArc';
import { calculateScoreBreakdown } from '../../utils/scoreCalculator';
import { saveDailyRecord } from '../../utils/storage';
import { StatusBadge } from '../common/StatusBadge';

interface TodayCheckInViewProps {
  initialDate?: string;
  records: Record<string, DailyRecord>;
  settings: UserSettings;
  onSaveSuccess: (updatedRecord: DailyRecord) => void;
  onClose?: () => void;
}

export const TodayCheckInView: React.FC<TodayCheckInViewProps> = ({
  initialDate,
  records,
  settings,
  onSaveSuccess,
  onClose,
}) => {
  const targetDate = initialDate || new Date().toISOString().split('T')[0];
  const existingRecord = records[targetDate];

  // State initialization
  const [workout, setWorkout] = useState<boolean>(existingRecord?.workout ?? false);
  const [movement, setMovement] = useState<boolean>(existingRecord?.movement ?? false);
  const [nutrition, setNutrition] = useState<boolean>(existingRecord?.nutrition ?? false);
  const [water, setWater] = useState<boolean>(existingRecord?.water ?? false);
  const [sleepHours, setSleepHours] = useState<number>(existingRecord?.sleepHours ?? 0);
  const [weight, setWeight] = useState<string>(existingRecord?.weight !== undefined ? String(existingRecord.weight) : '');

  const [scrollingMinutes, setScrollingMinutes] = useState<number>(
    existingRecord?.scrollingMinutes ?? (existingRecord?.scrollingControlled === false ? 60 : 60)
  );
  const [gamingMinutes, setGamingMinutes] = useState<number>(existingRecord?.gamingMinutes ?? 120);
  const [meditation, setMeditation] = useState<boolean>(existingRecord?.meditation ?? false);
  const [reading, setReading] = useState<boolean>(existingRecord?.reading ?? false);
  const [promisesKept, setPromisesKept] = useState<boolean>(existingRecord?.promisesKept ?? false);

  const [deepWork, setDeepWork] = useState<boolean>(existingRecord?.deepWork ?? false);
  const [deepWorkHours, setDeepWorkHours] = useState<number>(existingRecord?.deepWorkHours ?? 0);
  const [workDescription, setWorkDescription] = useState<string>(existingRecord?.workDescription ?? '');
  const [learning, setLearning] = useState<string>(existingRecord?.learning ?? '');

  const [biggestWin, setBiggestWin] = useState<string>(existingRecord?.biggestWin ?? '');
  const [biggestDistraction, setBiggestDistraction] = useState<string>(existingRecord?.biggestDistraction ?? '');
  const [tomorrowFocus, setTomorrowFocus] = useState<string>(existingRecord?.tomorrowFocus ?? '');

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const maxScrollingTarget = settings.maxScrollingTargetMinutes ?? 30;
  const isScrollingWithinLimit = scrollingMinutes <= maxScrollingTarget;

  // Compute live breakdown
  const currentRecordInput = {
    date: targetDate,
    workout,
    movement,
    nutrition,
    water,
    sleepHours: Number(sleepHours),
    weight: weight !== '' ? Number(weight) : undefined,
    scrollingControlled: isScrollingWithinLimit,
    scrollingMinutes: Number(scrollingMinutes),
    gamingMinutes: Number(gamingMinutes),
    meditation,
    reading,
    promisesKept,
    deepWork,
    deepWorkHours: Number(deepWorkHours),
    workDescription,
    learning,
    biggestWin,
    biggestDistraction,
    tomorrowFocus,
  };

  const breakdown = calculateScoreBreakdown(currentRecordInput, settings);

  const handleSave = () => {
    const saved = saveDailyRecord(currentRecordInput, settings);
    setIsSaved(true);
    onSaveSuccess(saved);
    setTimeout(() => setIsSaved(false), 3500);
  };

  // Helper toggle button component
  const ToggleButton = ({
    label,
    value,
    onChange,
    subtext,
  }: {
    label: string;
    value: boolean;
    onChange: (val: boolean) => void;
    subtext?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 hover:border-gray-700 transition-all">
      <div>
        <p className="text-xs font-semibold text-gray-200">{label}</p>
        {subtext && <p className="text-[11px] text-gray-500">{subtext}</p>}
      </div>
      <div className="flex items-center gap-1 bg-[#12141c] p-1 rounded-lg border border-gray-800">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
            value
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
            !value
              ? 'bg-rose-500/80 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          NO
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl shadow-xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Daily Record Check-In
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <span>{targetDate}</span>
            {targetDate === new Date().toISOString().split('T')[0] && (
              <span className="text-xs font-semibold font-mono text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded-full">
                TODAY
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4" /> Saved ✓
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-gray-800/40 hover:bg-gray-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Score Display Card */}
      <div className="bg-gradient-to-br from-[#12141c] via-[#161a26] to-[#0f111a] border border-sky-500/30 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center bg-[#090a0f] rounded-2xl border border-sky-500/40 shadow-inner">
            <div className="text-center">
              <span className="text-3xl font-black text-white font-mono">{breakdown.totalScore}</span>
              <span className="text-[10px] block font-mono text-sky-400">/ 100 PTS</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">STATUS:</span>
              <StatusBadge status={breakdown.status} size="md" />
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-gray-300">
              <span className="text-sky-400">Physical: {breakdown.physical.total}/30</span>
              <span className="text-purple-400">Mental: {breakdown.mental.total}/35</span>
              <span className="text-emerald-400">Learning: {breakdown.learning.total}/35</span>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              {breakdown.totalScore >= 90 && "💪 Strong Day! Peak discipline & consistency."}
              {breakdown.totalScore >= 85 && breakdown.totalScore < 90 && "⚡ Good Day! Solid progress made today."}
              {breakdown.totalScore >= 75 && breakdown.totalScore < 85 && "⚠️ Weak Day. Refocus tomorrow for a strong response."}
              {breakdown.totalScore < 50 && "🔄 Bad Day. Reset tomorrow, keep moving forward."}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-950/60 active:scale-95 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Record ({breakdown.totalScore} pts)</span>
        </button>
      </div>

      {/* 4 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: PHYSICAL */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-sky-400" /> 1. Physical Fitness (30 pts)
            </h3>
            <span className="text-xs font-mono text-sky-400">{breakdown.physical.total}/30 pts</span>
          </div>

          <div className="space-y-3">
            <ToggleButton
              label="Workout Completed"
              subtext="10 pts — Heavy lifting / intense training session"
              value={workout}
              onChange={setWorkout}
            />
            <ToggleButton
              label="Daily Movement"
              subtext="5 pts — 8k-10k steps or active recovery walk"
              value={movement}
              onChange={setMovement}
            />
            <ToggleButton
              label="Nutrition Followed"
              subtext="5 pts — Clean diet, hit protein targets"
              value={nutrition}
              onChange={setNutrition}
            />
            <ToggleButton
              label="Water Goal Met"
              subtext={`5 pts — ${settings.waterTargetLiters || 3}L clean water intake`}
              value={water}
              onChange={setWater}
            />

            {/* Sleep input */}
            <div className="p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
                </label>
                <span className="text-xs font-mono text-indigo-400">{sleepHours} Hours (Target: {settings.sleepTargetHours}h)</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Weight input (Body tracking only) */}
            <div className="p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-200">
                  Body Weight ({settings.weightUnit || 'kg'}) <span className="text-gray-500 font-normal">(Optional, body tracking only)</span>
                </label>
              </div>
              <input
                type="number"
                step="0.1"
                placeholder={`e.g. 78.5 ${settings.weightUnit || 'kg'}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MENTAL & DISCIPLINE */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> 2. Mental & Discipline (35 pts)
            </h3>
            <span className="text-xs font-mono text-purple-400">{breakdown.mental.total}/35 pts</span>
          </div>

          <div className="space-y-3">
            {/* Doom Scrolling Duration Slider */}
            <div className="p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Doom Scrolling Duration
                </label>
                <span className="text-xs font-mono text-purple-400">
                  {scrollingMinutes} mins (Limit: ≤{maxScrollingTarget}m)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={scrollingMinutes}
                onChange={(e) => setScrollingMinutes(parseInt(e.target.value) || 0)}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[0, 15, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setScrollingMinutes(m)}
                      className={`px-2 py-0.5 text-[10px] rounded font-mono cursor-pointer transition-all ${
                        scrollingMinutes === m
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  Earned: {breakdown.mental.scrolling}/10 pts
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                {scrollingMinutes <= maxScrollingTarget
                  ? '⚡ Full 10 pts! Controlled scrolling limits.'
                  : scrollingMinutes <= maxScrollingTarget * 1.5
                  ? '⚠️ Partial 5 pts. Exceeded daily target limit.'
                  : '❌ 0 pts. Excessive doom scrolling today.'}
              </p>
            </div>

            {/* Gaming Time with partial scoring */}
            <div className="p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Gaming Time
                </label>
                <span className="text-xs font-mono text-amber-400">
                  {gamingMinutes} mins (Target: ≤{settings.gamingTargetMinutes || 60}m)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="480"
                  step="5"
                  value={gamingMinutes}
                  onChange={(e) => setGamingMinutes(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
                <div className="flex items-center gap-1">
                  {[0, 30, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGamingMinutes(m)}
                      className="px-2 py-1 bg-gray-800 text-[10px] text-gray-300 rounded hover:bg-gray-700 font-mono cursor-pointer"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                Points earned: {breakdown.mental.gaming} / 5 pts ({gamingMinutes <= (settings.gamingTargetMinutes || 60) ? 'Full score' : gamingMinutes <= (settings.gamingTargetMinutes || 60) * 1.5 ? 'Partial score' : '0 pts'})
              </p>
            </div>

            <ToggleButton
              label="Meditation / Breathwork"
              subtext="5 pts — 10+ mins of mindfulness practice"
              value={meditation}
              onChange={setMeditation}
            />
            <ToggleButton
              label="Reading Target"
              subtext={`5 pts — Read ${settings.readingTargetMinutes || 30}+ mins of non-fiction`}
              value={reading}
              onChange={setReading}
            />
            <ToggleButton
              label="Kept Promises to Myself"
              subtext="10 pts — Honor your personal commitments"
              value={promisesKept}
              onChange={setPromisesKept}
            />
          </div>
        </div>

        {/* SECTION 3: LEARNING / CAREER */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> 3. Learning / Career (35 pts)
            </h3>
            <span className="text-xs font-mono text-emerald-400">{breakdown.learning.total}/35 pts</span>
          </div>

          <div className="space-y-3">
            <ToggleButton
              label="Deep Work Block"
              subtext="20 pts — Uninterrupted high-focus execution"
              value={deepWork}
              onChange={setDeepWork}
            />

            <div className="p-3 rounded-xl bg-[#090a0f] border border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-200">
                  Deep Work Hours ({breakdown.learning.deepWorkHours} pts {deepWorkHours > (settings.deepWorkTargetHours || 4) ? '🔥 +BONUS!' : '/ 10 pts'})
                </label>
                <span className="text-xs font-mono text-emerald-400">{deepWorkHours} Hrs (Target: {settings.deepWorkTargetHours || 4}h)</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={deepWorkHours}
                onChange={(e) => setDeepWorkHours(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-200">What did I work on today?</label>
              <input
                type="text"
                placeholder="e.g. Built Winter Arc dashboard architecture and API state"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-200">What did I learn today? (5 pts)</label>
              <input
                type="text"
                placeholder="e.g. Mastered Recharts custom tooltip styling and clean state persistence"
                value={learning}
                onChange={(e) => setLearning(e.target.value)}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DAILY REFLECTION */}
        <div className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> 4. Daily Reflection
            </h3>
            <span className="text-xs font-mono text-gray-400">Journal & Mindset</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Biggest Win
              </label>
              <input
                type="text"
                placeholder="What was your greatest victory today?"
                value={biggestWin}
                onChange={(e) => setBiggestWin(e.target.value)}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Biggest Distraction
              </label>
              <input
                type="text"
                placeholder="What pulled your attention away?"
                value={biggestDistraction}
                onChange={(e) => setBiggestDistraction(e.target.value)}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Tomorrow's Primary Focus
              </label>
              <input
                type="text"
                placeholder="Single non-negotiable mission for tomorrow"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Action Footer */}
      <div className="sticky bottom-4 z-30 bg-[#12141c]/95 backdrop-blur-md border border-sky-500/40 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black font-mono text-white">{breakdown.totalScore}</span>
          <div>
            <StatusBadge status={breakdown.status} size="sm" />
            <p className="text-[11px] text-gray-400 font-mono">
              Score auto-calculated with custom targets
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-sky-950/60 active:scale-95 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Check-In</span>
        </button>
      </div>
    </div>
  );
};
