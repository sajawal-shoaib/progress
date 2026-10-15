import { DailyRecord, UserSettings } from '../types/winterArc';
import { computeDailyRecordScore } from './scoreCalculator';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  RECORDS: 'winter_arc_daily_records_v1',
  SETTINGS: 'winter_arc_user_settings_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  startDate: new Date().toISOString().split('T')[0],
  gamingTargetMinutes: 60,
  deepWorkTargetHours: 4,
  readingTargetMinutes: 30,
  sleepTargetHours: 7.5,
  waterTargetLiters: 3,
  weightUnit: 'kg',
  theme: 'dark',
};

/**
 * Returns the earliest date key found in stored records, or today's date.
 * Used to auto-detect startDate when settings have never been explicitly saved.
 */
function detectEarliestRecordDate(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return new Date().toISOString().split('T')[0];
    const records = JSON.parse(raw) as Record<string, unknown>;
    const dates = Object.keys(records).sort();
    return dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      // No settings saved yet — auto-detect startDate from earliest record
      return {
        ...DEFAULT_SETTINGS,
        startDate: detectEarliestRecordDate(),
      };
    }
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    saveUserSettingsToSupabase(settings);
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function getStoredRecords(): Record<string, DailyRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading records from localStorage:', err);
    return {};
  }
}

export function saveStoredRecords(records: Record<string, DailyRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving records to localStorage:', err);
  }
}

export function saveDailyRecord(
  recordInput: Omit<DailyRecord, 'score' | 'status' | 'updatedAt'> & { score?: number; status?: any },
  settings: UserSettings = getStoredSettings()
): DailyRecord {
  const records = getStoredRecords();
  const { score, status } = computeDailyRecordScore(recordInput as DailyRecord, settings);
  
  const updatedRecord: DailyRecord = {
    ...recordInput,
    score,
    status,
    updatedAt: new Date().toISOString(),
  };

  records[recordInput.date] = updatedRecord;
  saveStoredRecords(records);

  // Sync with Supabase asynchronously
  saveDailyRecordToSupabase(updatedRecord);

  // Auto-save settings if not yet persisted, so startDate is locked-in correctly.
  const settingsRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!settingsRaw) {
    const newStartDate = recordInput.date < settings.startDate ? recordInput.date : settings.startDate;
    saveStoredSettings({ ...settings, startDate: newStartDate });
  } else {
    const saved = JSON.parse(settingsRaw) as UserSettings;
    if (recordInput.date < saved.startDate) {
      saveStoredSettings({ ...saved, startDate: recordInput.date });
    }
  }

  return updatedRecord;
}

export function deleteDailyRecord(date: string): void {
  const records = getStoredRecords();
  if (records[date]) {
    delete records[date];
    saveStoredRecords(records);
    deleteDailyRecordFromSupabase(date);
  }
}

/* ========================================================================
   SUPABASE CLOUD SYNC HELPERS
   ======================================================================== */

export async function saveDailyRecordToSupabase(record: DailyRecord): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from('daily_records').upsert({
      user_id: userData.user.id,
      date: record.date,
      workout: record.workout,
      movement: record.movement,
      nutrition: record.nutrition,
      water: record.water,
      sleep_hours: record.sleepHours,
      weight: record.weight ?? null,
      scrolling_controlled: record.scrollingControlled,
      scrolling_minutes: record.scrollingMinutes ?? (record.scrollingControlled ? 15 : 60),
      gaming_minutes: record.gamingMinutes ?? 30,
      meditation: record.meditation,
      reading: record.reading,
      promises_kept: record.promisesKept,
      deep_work: record.deepWork,
      deep_work_hours: record.deepWorkHours,
      work_description: record.workDescription ?? '',
      learning: record.learning ?? '',
      biggest_win: record.biggestWin ?? '',
      biggest_distraction: record.biggestDistraction ?? '',
      tomorrow_focus: record.tomorrowFocus ?? '',
      score: record.score,
      status: record.status,
      updated_at: record.updatedAt || new Date().toISOString(),
    }, { onConflict: 'user_id,date' });
  } catch (err) {
    console.error('Failed to sync daily record to Supabase:', err);
  }
}

export async function saveUserSettingsToSupabase(settings: UserSettings): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from('user_settings').upsert({
      id: userData.user.id,
      start_date: settings.startDate,
      total_days: 90,
      sleep_target_hours: settings.sleepTargetHours ?? 7.5,
      water_target_liters: settings.waterTargetLiters ?? 3.0,
      max_scrolling_target_minutes: settings.maxScrollingTargetMinutes ?? 30,
      gaming_target_minutes: settings.gamingTargetMinutes ?? 60,
      deep_work_target_hours: settings.deepWorkTargetHours ?? 4.0,
      weight_unit: settings.weightUnit ?? 'kg',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to sync settings to Supabase:', err);
  }
}

export async function deleteDailyRecordFromSupabase(date: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from('daily_records').delete().eq('user_id', userData.user.id).eq('date', date);
  } catch (err) {
    console.error('Failed to delete record from Supabase:', err);
  }
}

export async function syncWithSupabase(): Promise<{ settings: UserSettings; records: Record<string, DailyRecord> }> {
  const localSettings = getStoredSettings();
  const localRecords = getStoredRecords();

  if (!isSupabaseConfigured || !supabase) {
    return { settings: localSettings, records: localRecords };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { settings: localSettings, records: localRecords };
    }

    const userId = userData.user.id;

    // 1. Fetch remote settings
    const { data: remoteSettingsData } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    let mergedSettings = localSettings;
    if (remoteSettingsData) {
      mergedSettings = {
        ...localSettings,
        startDate: remoteSettingsData.start_date || localSettings.startDate,
        sleepTargetHours: Number(remoteSettingsData.sleep_target_hours ?? localSettings.sleepTargetHours),
        waterTargetLiters: Number(remoteSettingsData.water_target_liters ?? localSettings.waterTargetLiters),
        maxScrollingTargetMinutes: Number(remoteSettingsData.max_scrolling_target_minutes ?? localSettings.maxScrollingTargetMinutes),
        gamingTargetMinutes: Number(remoteSettingsData.gaming_target_minutes ?? localSettings.gamingTargetMinutes),
        deepWorkTargetHours: Number(remoteSettingsData.deep_work_target_hours ?? localSettings.deepWorkTargetHours),
        weightUnit: remoteSettingsData.weight_unit || localSettings.weightUnit,
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
    } else {
      saveUserSettingsToSupabase(localSettings);
    }

    // 2. Fetch remote records
    const { data: remoteRecordsData } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId);

    const mergedRecords: Record<string, DailyRecord> = { ...localRecords };

    if (remoteRecordsData && remoteRecordsData.length > 0) {
      for (const row of remoteRecordsData) {
        const remoteRec: DailyRecord = {
          date: row.date,
          workout: Boolean(row.workout),
          movement: Boolean(row.movement),
          nutrition: Boolean(row.nutrition),
          water: Boolean(row.water),
          sleepHours: Number(row.sleep_hours),
          weight: row.weight !== null ? Number(row.weight) : undefined,
          scrollingControlled: Boolean(row.scrolling_controlled),
          scrollingMinutes: Number(row.scrolling_minutes),
          gamingMinutes: Number(row.gaming_minutes),
          meditation: Boolean(row.meditation),
          reading: Boolean(row.reading),
          promisesKept: Boolean(row.promises_kept),
          deepWork: Boolean(row.deep_work),
          deepWorkHours: Number(row.deep_work_hours),
          workDescription: row.work_description || '',
          learning: row.learning || '',
          biggestWin: row.biggest_win || '',
          biggestDistraction: row.biggest_distraction || '',
          tomorrowFocus: row.tomorrow_focus || '',
          score: Number(row.score),
          status: row.status,
          updatedAt: row.updated_at,
        };

        const existingLocal = mergedRecords[row.date];
        if (!existingLocal || (remoteRec.updatedAt && (!existingLocal.updatedAt || remoteRec.updatedAt > existingLocal.updatedAt))) {
          mergedRecords[row.date] = remoteRec;
        }
      }

      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(mergedRecords));
    }

    for (const [date, localRec] of Object.entries(localRecords)) {
      const existsRemotely = remoteRecordsData?.some((r) => r.date === date);
      if (!existsRemotely) {
        saveDailyRecordToSupabase(localRec);
      }
    }

    return { settings: mergedSettings, records: mergedRecords };
  } catch (err) {
    console.error('Error during Supabase sync:', err);
    return { settings: localSettings, records: localRecords };
  }
}

export function exportDataAsJSON(): string {
  const settings = getStoredSettings();
  const records = getStoredRecords();
  return JSON.stringify({
    app: 'WINTER_ARC',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    records,
  }, null, 2);
}

export function importDataFromJSON(jsonString: string): { success: boolean; message: string; recordCount: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file format.', recordCount: 0 };
    }
    
    if (data.settings) {
      saveStoredSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    
    if (data.records && typeof data.records === 'object') {
      saveStoredRecords(data.records);
      const count = Object.keys(data.records).length;
      return { success: true, message: `Successfully imported ${count} daily records!`, recordCount: count };
    }
    
    return { success: false, message: 'No valid records found in file.', recordCount: 0 };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message || 'Unknown error'}`, recordCount: 0 };
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
