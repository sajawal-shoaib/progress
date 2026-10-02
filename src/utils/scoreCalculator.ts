import { DailyRecord, ScoreBreakdown, DailyStatusLabel, UserSettings } from '../types/winterArc';

export function calculateDailyStatus(score: number): DailyStatusLabel {
  if (score >= 85) return 'Strong Day';
  if (score >= 70) return 'Good Day';
  if (score >= 50) return 'Weak Day';
  return 'Bad Day';
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

  // Mental & Discipline (35 pts max)
  const scrollingPts = record.scrollingControlled ? 10 : 0;
  
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

  // Learning / Career (35 pts max)
  const deepWorkPts = record.deepWork ? 20 : 0;
  const deepWorkTarget = settings.deepWorkTargetHours || 4;
  const deepWorkHrs = record.deepWorkHours || 0;
  const deepWorkHoursPts = deepWorkHrs >= deepWorkTarget 
    ? 10 
    : Math.round(Math.min(10, (deepWorkHrs / deepWorkTarget) * 10) * 10) / 10;
  
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
