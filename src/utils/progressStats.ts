import { DailyRecord, UserSettings } from '../types/winterArc';

export interface PersonalRecords {
  longestStreak: number;
  mostWorkoutsInWeek: number;
  mostDeepWorkInWeek: number;
  longestReadingStreak: number;
  lowestWeeklyGamingAvg: number | null;
  highestDailyScore: number;
  bestSleepWeekAvg: number | null;
  totalRecordedDays: number;
}

export interface MetricTrend {
  label: string;
  firstValue: number;
  lastValue: number;
  unit: string;
  direction: 'improving' | 'stable' | 'declining';
  changeText: string;
  isHigherBetter: boolean;
}

export interface TrendAnalysisResult {
  hasEnoughData: boolean;
  scoreTrend: MetricTrend;
  workoutTrend: MetricTrend;
  gamingTrend: MetricTrend;
  deepWorkTrend: MetricTrend;
  readingTrend: MetricTrend;
}

export interface HabitConsistencyItem {
  id: string;
  name: string;
  percentage: number;
  completedDays: number;
  totalDays: number;
}

export const calculatePersonalRecords = (
  records: Record<string, DailyRecord>,
  settings: UserSettings
): PersonalRecords => {
  const dates = Object.keys(records).sort();
  const totalRecordedDays = dates.length;

  if (totalRecordedDays === 0) {
    return {
      longestStreak: 0,
      mostWorkoutsInWeek: 0,
      mostDeepWorkInWeek: 0,
      longestReadingStreak: 0,
      lowestWeeklyGamingAvg: null,
      highestDailyScore: 0,
      bestSleepWeekAvg: null,
      totalRecordedDays: 0,
    };
  }

  let highestDailyScore = 0;
  let currentReadingStreak = 0;
  let longestReadingStreak = 0;

  dates.forEach((d) => {
    const r = records[d];
    if (r.score > highestDailyScore) highestDailyScore = r.score;

    if (r.reading) {
      currentReadingStreak++;
      if (currentReadingStreak > longestReadingStreak) longestReadingStreak = currentReadingStreak;
    } else {
      currentReadingStreak = 0;
    }
  });

  // Calculate rolling 7-day windows for weekly peaks
  let mostWorkoutsInWeek = 0;
  let mostDeepWorkInWeek = 0;
  let lowestWeeklyGamingAvg: number | null = null;
  let bestSleepWeekAvg: number | null = null;

  for (let i = 0; i <= dates.length - 1; i++) {
    const window = dates.slice(Math.max(0, i - 6), i + 1);
    if (window.length >= 4) { // Needs at least 4 recorded days in a 7-day window
      let workouts = 0;
      let deepWork = 0;
      let gamingSum = 0;
      let sleepSum = 0;

      window.forEach((wd) => {
        const r = records[wd];
        if (r.workout) workouts++;
        deepWork += r.deepWorkHours || 0;
        gamingSum += r.gamingMinutes || 0;
        sleepSum += r.sleepHours || 0;
      });

      if (workouts > mostWorkoutsInWeek) mostWorkoutsInWeek = workouts;
      if (deepWork > mostDeepWorkInWeek) mostDeepWorkInWeek = Math.round(deepWork * 10) / 10;

      const gamingAvg = Math.round(gamingSum / window.length);
      if (lowestWeeklyGamingAvg === null || gamingAvg < lowestWeeklyGamingAvg) {
        lowestWeeklyGamingAvg = gamingAvg;
      }

      const sleepAvg = Math.round((sleepSum / window.length) * 10) / 10;
      if (bestSleepWeekAvg === null || Math.abs(sleepAvg - settings.sleepTargetHours) < Math.abs(bestSleepWeekAvg - settings.sleepTargetHours)) {
        bestSleepWeekAvg = sleepAvg;
      }
    }
  }

  // Calculate longest overall streak (score >= 70)
  let longestStreak = 0;
  let tempStreak = 0;
  dates.forEach((d) => {
    if (records[d].score >= 70) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  return {
    longestStreak,
    mostWorkoutsInWeek,
    mostDeepWorkInWeek,
    longestReadingStreak,
    lowestWeeklyGamingAvg,
    highestDailyScore,
    bestSleepWeekAvg,
    totalRecordedDays,
  };
};

export const calculateTrendAnalysis = (
  records: Record<string, DailyRecord>
): TrendAnalysisResult => {
  const dates = Object.keys(records).sort();
  if (dates.length < 7) {
    const defaultTrend = (label: string, unit: string, isHigherBetter = true): MetricTrend => ({
      label,
      firstValue: 0,
      lastValue: 0,
      unit,
      direction: 'stable',
      changeText: '0',
      isHigherBetter,
    });

    return {
      hasEnoughData: false,
      scoreTrend: defaultTrend('Average Score', 'pts'),
      workoutTrend: defaultTrend('Workout Consistency', '%'),
      gamingTrend: defaultTrend('Gaming Average', 'mins', false),
      deepWorkTrend: defaultTrend('Deep Work Average', 'hrs'),
      readingTrend: defaultTrend('Reading Consistency', '%'),
    };
  }

  const sampleSize = Math.min(7, Math.floor(dates.length / 2));
  const firstSample = dates.slice(0, sampleSize).map((d) => records[d]);
  const lastSample = dates.slice(dates.length - sampleSize).map((d) => records[d]);

  const calcAvg = (arr: DailyRecord[], key: keyof DailyRecord) =>
    arr.reduce((acc, r) => acc + (typeof r[key] === 'number' ? (r[key] as number) : 0), 0) / arr.length;

  const calcPct = (arr: DailyRecord[], key: keyof DailyRecord) =>
    Math.round((arr.filter((r) => Boolean(r[key])).length / arr.length) * 100);

  const scoreFirst = Math.round(calcAvg(firstSample, 'score'));
  const scoreLast = Math.round(calcAvg(lastSample, 'score'));

  const workoutFirst = calcPct(firstSample, 'workout');
  const workoutLast = calcPct(lastSample, 'workout');

  const gamingFirst = Math.round(calcAvg(firstSample, 'gamingMinutes'));
  const gamingLast = Math.round(calcAvg(lastSample, 'gamingMinutes'));

  const deepWorkFirst = Math.round(calcAvg(firstSample, 'deepWorkHours') * 10) / 10;
  const deepWorkLast = Math.round(calcAvg(lastSample, 'deepWorkHours') * 10) / 10;

  const readingFirst = calcPct(firstSample, 'reading');
  const readingLast = calcPct(lastSample, 'reading');

  const makeTrend = (
    label: string,
    first: number,
    last: number,
    unit: string,
    isHigherBetter = true
  ): MetricTrend => {
    const diff = Math.round((last - first) * 10) / 10;
    let direction: 'improving' | 'stable' | 'declining' = 'stable';

    if (Math.abs(diff) >= 0.5) {
      if (isHigherBetter) {
        direction = diff > 0 ? 'improving' : 'declining';
      } else {
        direction = diff < 0 ? 'improving' : 'declining';
      }
    }

    const sign = diff > 0 ? '+' : '';
    return {
      label,
      firstValue: first,
      lastValue: last,
      unit,
      direction,
      changeText: `${sign}${diff} ${unit}`,
      isHigherBetter,
    };
  };

  return {
    hasEnoughData: true,
    scoreTrend: makeTrend('Average Score', scoreFirst, scoreLast, 'pts', true),
    workoutTrend: makeTrend('Workout Consistency', workoutFirst, workoutLast, '%', true),
    gamingTrend: makeTrend('Gaming Average', gamingFirst, gamingLast, 'mins', false),
    deepWorkTrend: makeTrend('Deep Work Average', deepWorkFirst, deepWorkLast, 'hrs', true),
    readingTrend: makeTrend('Reading Consistency', readingFirst, readingLast, '%', true),
  };
};

export const calculateHabitPercentages = (
  records: Record<string, DailyRecord>,
  settings: UserSettings
): HabitConsistencyItem[] => {
  const dates = Object.keys(records);
  const total = dates.length;

  if (total === 0) return [];

  const habits = [
    {
      id: 'workout',
      name: 'Workout',
      check: (r: DailyRecord) => r.workout,
    },
    {
      id: 'movement',
      name: 'Daily Movement',
      check: (r: DailyRecord) => r.movement,
    },
    {
      id: 'nutrition',
      name: 'Nutrition Followed',
      check: (r: DailyRecord) => r.nutrition,
    },
    {
      id: 'water',
      name: 'Water Target',
      check: (r: DailyRecord) => r.water,
    },
    {
      id: 'sleep',
      name: 'Sleep Target',
      check: (r: DailyRecord) => r.sleepHours >= (settings.sleepTargetHours || 7.5),
    },
    {
      id: 'dopamine',
      name: 'Dopamine Control',
      check: (r: DailyRecord) => r.scrollingControlled,
    },
    {
      id: 'gaming',
      name: 'Gaming Control',
      check: (r: DailyRecord) => r.gamingMinutes <= (settings.gamingTargetMinutes || 60),
    },
    {
      id: 'meditation',
      name: 'Meditation',
      check: (r: DailyRecord) => r.meditation,
    },
    {
      id: 'reading',
      name: 'Reading Target',
      check: (r: DailyRecord) => r.reading,
    },
    {
      id: 'deepWork',
      name: 'Deep Work',
      check: (r: DailyRecord) => r.deepWork,
    },
    {
      id: 'promises',
      name: 'Kept Promises',
      check: (r: DailyRecord) => r.promisesKept,
    },
  ];

  return habits
    .map((h) => {
      const completedDays = dates.filter((d) => h.check(records[d])).length;
      const percentage = Math.round((completedDays / total) * 100);
      return {
        id: h.id,
        name: h.name,
        percentage,
        completedDays,
        totalDays: total,
      };
    })
    .sort((a, b) => b.percentage - a.percentage); // Sorted by completion percentage
};
