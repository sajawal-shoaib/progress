import { DailyRecord, UserSettings, WeeklyReviewData, MilestoneCheckpoint } from '../types/winterArc';
import { computeDailyRecordScore } from './scoreCalculator';

/**
 * Calculates current streak and longest streak.
 * A day is successful if score >= 70.
 * Overall 90-day progress is based on total days elapsed / recorded, NEVER reset!
 */
export function calculateStreaks(records: Record<string, DailyRecord>, startDateStr: string) {
  const sortedDates = Object.keys(records).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalSuccessfulDays: 0 };
  }

  let longestStreak = 0;
  let currentStreak = 0;
  let totalSuccessfulDays = 0;

  // Find all consecutive successful days
  // Parse date sequence
  const start = new Date(startDateStr);
  const today = new Date();
  
  // Calculate day sequence from start date to today
  let tempStreak = 0;
  let curr = new Date(start);
  
  while (curr <= today) {
    const dateStr = curr.toISOString().split('T')[0];
    const rec = records[dateStr];
    
    if (rec && rec.score >= 70) {
      tempStreak++;
      totalSuccessfulDays++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate current active streak ending at today (or yesterday if today isn't recorded yet)
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let streakCheckDate = today;
  if (!records[todayStr] || records[todayStr].score < 70) {
    if (records[yesterdayStr] && records[yesterdayStr].score >= 70) {
      streakCheckDate = yesterday;
    } else {
      currentStreak = 0;
    }
  }

  if (records[streakCheckDate.toISOString().split('T')[0]]?.score >= 70) {
    let count = 0;
    let check = new Date(streakCheckDate);
    while (true) {
      const dStr = check.toISOString().split('T')[0];
      if (records[dStr] && records[dStr].score >= 70) {
        count++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    currentStreak = count;
  }

  return {
    currentStreak,
    longestStreak,
    totalSuccessfulDays,
  };
}

/**
 * Returns 90-day overall statistics.
 */
export function getOverallArcStats(records: Record<string, DailyRecord>, settings: UserSettings) {
  const startDate = new Date(settings.startDate);
  const today = new Date();
  
  // Difference in calendar days from start date
  const diffTime = today.getTime() - startDate.getTime();
  const dayNumberRaw = Math.floor(diffTime / (1000 * 3600 * 24)) + 1;
  const currentDayNumber = Math.min(90, Math.max(1, dayNumberRaw));
  
  const recordedDates = Object.keys(records);
  const daysCompleted = recordedDates.length;
  const daysRemaining = Math.max(0, 90 - currentDayNumber);
  const completionPercentage = Math.round((currentDayNumber / 90) * 100 * 10) / 10;

  const totalScoreSum = recordedDates.reduce((acc, d) => acc + (records[d]?.score || 0), 0);
  const averageScore = daysCompleted > 0 ? Math.round(totalScoreSum / daysCompleted) : 0;

  const { currentStreak, longestStreak, totalSuccessfulDays } = calculateStreaks(records, settings.startDate);

  return {
    currentDayNumber,
    daysCompleted,
    daysRemaining,
    completionPercentage,
    averageScore,
    currentStreak,
    longestStreak,
    totalSuccessfulDays,
  };
}

/**
 * Groups data into 13 weeks of the Winter Arc.
 */
export function calculateWeeklyReviews(
  records: Record<string, DailyRecord>,
  settings: UserSettings
): WeeklyReviewData[] {
  const startDate = new Date(settings.startDate);
  const weeks: WeeklyReviewData[] = [];

  for (let w = 1; w <= 13; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (w - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const dateStrings: string[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(weekStart);
      cur.setDate(cur.getDate() + d);
      dateStrings.push(cur.toISOString().split('T')[0]);
    }

    const weekRecords = dateStrings.map((d) => records[d]).filter(Boolean) as DailyRecord[];
    const recordedDays = weekRecords.length;

    let weeklyScoreSum = 0;
    let workoutDays = 0;
    let sleepSum = 0;
    let gamingSum = 0;
    let deepWorkHrsSum = 0;
    let readingDays = 0;
    let scrollingControlledDays = 0;
    let successfulDays = 0;
    let promisesDays = 0;
    let meditationDays = 0;

    weekRecords.forEach((r) => {
      weeklyScoreSum += r.score;
      if (r.workout) workoutDays++;
      sleepSum += r.sleepHours || 0;
      gamingSum += r.gamingMinutes || 0;
      deepWorkHrsSum += r.deepWorkHours || 0;
      if (r.reading) readingDays++;
      if (r.scrollingControlled) scrollingControlledDays++;
      if (r.promisesKept) promisesDays++;
      if (r.meditation) meditationDays++;
      if (r.score >= 70) successfulDays++;
    });

    const avgScore = recordedDays > 0 ? Math.round(weeklyScoreSum / recordedDays) : 0;
    const avgSleep = recordedDays > 0 ? Math.round((sleepSum / recordedDays) * 10) / 10 : 0;
    const avgGaming = recordedDays > 0 ? Math.round(gamingSum / recordedDays) : 0;
    const avgScreenTime = recordedDays > 0 ? Math.round((scrollingControlledDays / recordedDays) * 100) : 0;

    // Habit comparison for rule-based insights
    const habitStats = [
      { name: 'Workout', count: workoutDays },
      { name: 'Reading', count: readingDays },
      { name: 'Kept Promises', count: promisesDays },
      { name: 'Meditation', count: meditationDays },
      { name: 'Screen Control', count: scrollingControlledDays },
    ];

    habitStats.sort((a, b) => b.count - a.count);
    const strongestHabit = recordedDays > 0 ? habitStats[0].name : 'N/A';
    const weakestHabit = recordedDays > 0 ? habitStats[habitStats.length - 1].name : 'N/A';

    let mainImprovementArea = 'Maintain consistency across all areas';
    if (recordedDays > 0) {
      if (avgGaming > settings.gamingTargetMinutes) {
        mainImprovementArea = `Reduce gaming time (avg ${avgGaming}m vs target ${settings.gamingTargetMinutes}m)`;
      } else if (workoutDays < 4) {
        mainImprovementArea = `Increase workout frequency (${workoutDays}/7 days completed)`;
      } else if (deepWorkHrsSum < settings.deepWorkTargetHours * 4) {
        mainImprovementArea = `Boost deep work hours (${deepWorkHrsSum.toFixed(1)} hrs total this week)`;
      } else if (scrollingControlledDays < 4) {
        mainImprovementArea = 'Reduce mindless scrolling and social media usage';
      }
    }

    weeks.push({
      weekNumber: w,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      totalDays: 7,
      recordedDays,
      weeklyScore: weeklyScoreSum,
      avgScore,
      workoutDays,
      avgSleep,
      avgGaming,
      avgScreenTime,
      deepWorkHours: Math.round(deepWorkHrsSum * 10) / 10,
      readingDays,
      successfulDays,
      missedDays: 7 - successfulDays,
      strongestHabit,
      weakestHabit,
      mainImprovementArea,
    });
  }

  return weeks;
}

/**
 * Calculates milestone checkpoints for Day 30, 60, and 90.
 */
export function calculateMilestones(
  records: Record<string, DailyRecord>,
  settings: UserSettings
): MilestoneCheckpoint[] {
  const startDate = new Date(settings.startDate);
  const checkpoints: MilestoneCheckpoint[] = [
    { targetDay: 30, label: '30-Day Checkpoint' } as MilestoneCheckpoint,
    { targetDay: 60, label: '60-Day Checkpoint' } as MilestoneCheckpoint,
    { targetDay: 90, label: '90-Day Final Arc Results' } as MilestoneCheckpoint,
  ];

  const sortedDates = Object.keys(records).sort();
  const firstRecordDate = sortedDates[0];
  const startingWeight = firstRecordDate ? records[firstRecordDate]?.weight : undefined;

  return checkpoints.map((cp) => {
    const endDayDate = new Date(startDate);
    endDayDate.setDate(endDayDate.getDate() + cp.targetDay - 1);
    
    // Filter records up to targetDay
    const cpRecords = Object.values(records).filter((r) => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDayDate;
    });

    const recordedCount = cpRecords.length;
    const isUnlocked = recordedCount >= cp.targetDay / 2; // unlocked if half or more days recorded or reached date

    if (recordedCount === 0) {
      return {
        ...cp,
        isUnlocked: false,
        avgScore: 0,
        workoutConsistencyPct: 0,
        avgGamingMinutes: 0,
        scrollingControlledPct: 0,
        totalDeepWorkHours: 0,
        readingConsistencyPct: 0,
        longestStreak: 0,
        successfulDays: 0,
        startingWeight,
        currentWeight: undefined,
      };
    }

    const totalScore = cpRecords.reduce((a, b) => a + b.score, 0);
    const workouts = cpRecords.filter((r) => r.workout).length;
    const totalGaming = cpRecords.reduce((a, b) => a + (b.gamingMinutes || 0), 0);
    const scrolling = cpRecords.filter((r) => r.scrollingControlled).length;
    const deepWorkHrs = cpRecords.reduce((a, b) => a + (b.deepWorkHours || 0), 0);
    const reading = cpRecords.filter((r) => r.reading).length;
    const successful = cpRecords.filter((r) => r.score >= 70).length;

    // Weight logic
    const weightedRecords = cpRecords.filter((r) => r.weight !== undefined && r.weight > 0);
    const latestWeight = weightedRecords.length > 0 ? weightedRecords[weightedRecords.length - 1].weight : undefined;

    return {
      ...cp,
      isUnlocked,
      avgScore: Math.round(totalScore / recordedCount),
      workoutConsistencyPct: Math.round((workouts / recordedCount) * 100),
      avgGamingMinutes: Math.round(totalGaming / recordedCount),
      scrollingControlledPct: Math.round((scrolling / recordedCount) * 100),
      totalDeepWorkHours: Math.round(deepWorkHrs * 10) / 10,
      readingConsistencyPct: Math.round((reading / recordedCount) * 100),
      longestStreak: calculateStreaks(records, settings.startDate).longestStreak,
      successfulDays: successful,
      startingWeight,
      currentWeight: latestWeight,
    };
  });
}

/**
 * Demo Data Generator: Generates 45 realistic days of data ending today
 * to immediately allow testing/viewing analytics, calendar, weekly review, and milestones.
 */
export function generateSampleData(
  settings: UserSettings
): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {};
  const today = new Date();
  
  // Start 45 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 44);

  const wins = [
    'Completed 10km morning run and finished React architecture design',
    'Maintained 100% focus during 5 hours of deep work code refactoring',
    'Resisted social media distractions all day; read 40 pages of Atomic Habits',
    'Hit a new personal record on bench press; zero gaming today',
    'Structured weekly planning session & meal prepped for 5 days',
    'Mastered TypeScript generics and wrote high-coverage unit tests',
    'Woke up at 5:30 AM, cold shower, and completed morning workout',
  ];

  const distractions = [
    'YouTube rabbit hole during lunch break (30 mins)',
    'Late night smartphone scrolling before bed',
    'Over-checking email notifications during deep work block',
    'Slightly over-ate carbs at dinner',
    'Got drawn into Discord chat for 45 minutes',
    'Delayed starting morning workout by 20 minutes',
  ];

  const focusPoints = [
    'Complete the Winter Arc dashboard module with zero bugs',
    'Strict 4-hour deep work block before 1:00 PM',
    'Hydrate with 3.5L water and hit leg day heavy',
    'Read 30 pages before turning off lights at 10:30 PM',
    'No phone usage for the first hour after waking up',
    'Prep protein meals and complete 10k steps',
  ];

  let currentWeight = 82.5; // Starting kg

  for (let i = 0; i < 45; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // High consistency overall (80% chance of high score days)
    const isGoodDay = Math.random() > 0.18;
    const isSuperDay = isGoodDay && Math.random() > 0.4;

    const workout = isGoodDay;
    const movement = isGoodDay || Math.random() > 0.3;
    const nutrition = isGoodDay || Math.random() > 0.4;
    const water = Math.random() > 0.2;
    const sleepHours = isGoodDay ? 7.5 + (Math.random() * 1.5 - 0.5) : 5.8;
    
    // Weight fluctuates slightly downwards over 45 days
    if (i % 3 === 0) {
      currentWeight -= (Math.random() * 0.15 - 0.05);
    }
    const weight = Math.round(currentWeight * 10) / 10;

    const scrollingControlled = isGoodDay || Math.random() > 0.5;
    const gamingMinutes = isGoodDay 
      ? Math.floor(Math.random() * 45) 
      : Math.floor(60 + Math.random() * 75);
    const meditation = isSuperDay || Math.random() > 0.4;
    const reading = isGoodDay || Math.random() > 0.3;
    const promisesKept = isGoodDay;

    const deepWork = isGoodDay;
    const deepWorkHours = isGoodDay ? 3.5 + Math.random() * 2.5 : 1.5;
    const workDescription = 'Built modular features, optimized state & algorithms.';
    const learning = 'Learned advanced TypeScript utility types & system architecture.';

    const winIdx = i % wins.length;
    const distIdx = i % distractions.length;
    const focusIdx = i % focusPoints.length;

    const partialRecord = {
      date: dateStr,
      workout,
      movement,
      nutrition,
      water,
      sleepHours: Math.round(sleepHours * 10) / 10,
      weight,
      scrollingControlled,
      gamingMinutes,
      meditation,
      reading,
      promisesKept,
      deepWork,
      deepWorkHours: Math.round(deepWorkHours * 10) / 10,
      workDescription,
      learning,
      biggestWin: wins[winIdx],
      biggestDistraction: distractions[distIdx],
      tomorrowFocus: focusPoints[focusIdx],
    };

    const { score, status } = computeDailyRecordScore(partialRecord, settings);

    records[dateStr] = {
      ...partialRecord,
      score,
      status,
      updatedAt: new Date().toISOString(),
    };
  }

  return records;
}
