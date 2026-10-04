import { DailyRecord, UserSettings } from '../types/winterArc';
import { computeDailyRecordScore } from './scoreCalculator';

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

  // Auto-save settings if not yet persisted, so startDate is locked-in correctly.
  // Use the earliest date between the record being saved and current startDate.
  const settingsRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!settingsRaw) {
    // First-time save — persist settings with the record's date as startDate
    const newStartDate = recordInput.date < settings.startDate ? recordInput.date : settings.startDate;
    saveStoredSettings({ ...settings, startDate: newStartDate });
  } else {
    // Settings exist — ensure startDate never drifts later than the earliest record
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
