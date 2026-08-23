// Persistence: settings + per-scenario progress in localStorage.

const SETTINGS_KEY = "jpconv.settings";
const PROGRESS_KEY = "jpconv.progress";

const defaultSettings = {
  voiceURI: null,
  rate: 0.9,
  furigana: true,
  kanaOnly: false,
  showEnglish: true,
};

export function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadProgressMap() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) ?? {};
  } catch {
    return {};
  }
}

// progress[scenarioId] = { best: 0..1, completions: n, lastPlayed: iso-date }
export function getProgress(scenarioId) {
  return loadProgressMap()[scenarioId] ?? { best: null, completions: 0, lastPlayed: null };
}

export function recordCompletion(scenarioId, score) {
  const all = loadProgressMap();
  const prev = all[scenarioId] ?? { best: null, completions: 0, lastPlayed: null };
  all[scenarioId] = {
    best: Math.max(prev.best ?? 0, score),
    completions: prev.completions + 1,
    lastPlayed: new Date().toISOString().slice(0, 10),
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
