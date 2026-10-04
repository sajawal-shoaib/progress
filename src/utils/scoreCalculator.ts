import { DailyRecord, ScoreBreakdown, DailyStatusLabel, UserSettings } from '../types/winterArc';

export function calculateDailyStatus(score: number): DailyStatusLabel {
  if (score >= 90) return 'Strong Day';
  if (score >= 85) return 'Good Day';
  if (score >= 75) return 'Weak Day';
  if (score >= 65) return 'Bad Day';
  return 'Not Recorded';
}

export function calculateScoreBreakdown(
  record: Partial<DailyRecord>,
  settings: UserSettings
): ScoreBreakdown {
  // Physical (30 pts max)
  const workoutPts = record.workout ? 10 : 0;
  const movementPts = record.movement ? 5 : 0;
  const nutritionPts = record.nutrition ? 5 : 0;
  const waterPts = record.water ? 5 : 0;
  
  // Sleep (5 pts max based on target)
  const sleepTarget = settings.sleepTargetHours || 7.5;
  const sleepHrs = record.sleepHours || 0;
  const sleepPts = sleepHrs >= sleepTarget 
    ? 5 
    : Math.round(Math.min(5, (sleepHrs / sleepTarget) * 5) * 10) / 10;
  
  const physicalTotal = workoutPts + movementPts + nutritionPts + waterPts + sleepPts;

  // Mental & Discipline (35 pts max base)
  const maxScrollingTarget = settings.maxScrollingTargetMinutes ?? 30;
  const scrollingMins = record.scrollingMinutes ?? (record.scrollingControlled ? 0 : 60);
  let scrollingPts = 0;
  if (scrollingMins <= maxScrollingTarget) {
    scrollingPts = 10; // Full 10 points if within allowed limit
  } else if (scrollingMins <= maxScrollingTarget * 1.5) {
    scrollingPts = 5; // Partial score if slightly over limit
  } else {
    scrollingPts = 0; // Exceeded limit significantly
  }
  
  // Gaming score: configurable target, partial scoring
  const gamingTarget = settings.gamingTargetMinutes ?? 60;
  const gamingMins = record.gamingMinutes ?? 0;
  let gamingPts = 0;
  if (gamingMins <= gamingTarget) {
    gamingPts = 5; // Full 5 points if within target
  } else if (gamingMins <= gamingTarget * 1.5) {
    gamingPts = 2.5; // Partial score if slightly over target
  } else {
    gamingPts = 0; // Exceeded target significantly
  }

  const meditationPts = record.meditation ? 5 : 0;
  const readingPts = record.reading ? 5 : 0;
  const promisesPts = record.promisesKept ? 10 : 0;

  const mentalTotal = scrollingPts + gamingPts + meditationPts + readingPts + promisesPts;

  // Learning / Career (35 pts max base, extra bonus points for exceeding deep work target!)
  const deepWorkPts = record.deepWork ? 20 : 0;
  const deepWorkTarget = settings.deepWorkTargetHours || 4;
  const deepWorkHrs = record.deepWorkHours || 0;

  let deepWorkHoursPts = 0;
  if (deepWorkHrs >= deepWorkTarget) {
    // Base 10 pts for meeting target + bonus points for extra hours!
    const extraHrs = deepWorkHrs - deepWorkTarget;
    const bonusPts = (extraHrs / deepWorkTarget) * 10;
    deepWorkHoursPts = Math.round((10 + bonusPts) * 10) / 10;
  } else {
    deepWorkHoursPts = Math.round((deepWorkHrs / deepWorkTarget) * 10 * 10) / 10;
  }
  
  const hasLearningText = Boolean(record.learning && record.learning.trim().length > 0);
  const learningDonePts = hasLearningText ? 5 : 0;

  const learningTotal = deepWorkPts + deepWorkHoursPts + learningDonePts;

  const totalScore = Math.min(100, Math.round(physicalTotal + mentalTotal + learningTotal));
  const status = calculateDailyStatus(totalScore);

  return {
    physical: {
      workout: workoutPts,
      movement: movementPts,
      nutrition: nutritionPts,
      water: waterPts,
      sleep: sleepPts,
      total: physicalTotal,
    },
    mental: {
      scrolling: scrollingPts,
      gaming: gamingPts,
      meditation: meditationPts,
      reading: readingPts,
      promises: promisesPts,
      total: mentalTotal,
    },
    learning: {
      deepWork: deepWorkPts,
      deepWorkHours: deepWorkHoursPts,
      learningDone: learningDonePts,
      total: learningTotal,
    },
    totalScore,
    status,
  };
}

export function computeDailyRecordScore(
  record: Omit<DailyRecord, 'score' | 'status'>,
  settings: UserSettings
): { score: number; status: DailyStatusLabel } {
  const breakdown = calculateScoreBreakdown(record, settings);
  return {
    score: breakdown.totalScore,
    status: breakdown.status,
  };
}
