import { missionData } from "../data/courseData.js";

export const STORAGE_KEY = "aiExplorerProgress";
export const NOTES_STORAGE_KEY = "aiExplorerLearningNotes";

export function defaultProgress() {
  return {
    missions: Object.fromEntries(missionData.map((mission) => [mission.id, { progress: 0, completed: false }]))
  };
}

export function normaliseProgress(raw) {
  const base = defaultProgress();
  const savedMissions = raw && typeof raw === "object" && raw.missions && typeof raw.missions === "object" ? raw.missions : {};
  return {
    missions: Object.fromEntries(missionData.map((mission) => {
      const saved = savedMissions[mission.id] && typeof savedMissions[mission.id] === "object" ? savedMissions[mission.id] : {};
      const completed = saved.completed === true;
      const numericProgress = Number(saved.progress);
      const progress = completed ? 100 : Number.isFinite(numericProgress) ? Math.min(100, Math.max(0, numericProgress)) : 0;
      return [mission.id, { progress, completed }];
    }))
  };
}

export function readProgress() {
  try {
    return normaliseProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return defaultProgress();
  }
}

export function writeProgress(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseProgress(next)));
}

export function readLearningNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "[]");
    if (Array.isArray(notes)) return notes;
  } catch {
    // Ignore malformed local notes and fall back to an empty list.
  }
  return [];
}

export function saveLearningNote(note) {
  const notes = readLearningNotes();
  const next = [
    { ...note, savedAt: new Date().toISOString() },
    ...notes.filter((item) => item.id !== note.id)
  ];
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function completedCount(progress) {
  return missionData.filter((mission) => progress.missions[mission.id]?.completed).length;
}

export function isUnlocked(progress, id) {
  if (id === 1) return true;
  return progress.missions[id - 1]?.completed;
}

export function canAccessMission(progress, id, qaMode = false) {
  return qaMode || isUnlocked(progress, id);
}

export function canAccessFinalChallenge(progress, qaMode = false) {
  return qaMode || completedCount(progress) === missionData.length;
}

export function activityRecords(progress, notes = readLearningNotes()) {
  const missionRecords = missionData.flatMap((mission) => {
    const state = progress.missions[mission.id] || {};
    if (state.completed) {
      return [{
        type: "Missions",
        title: `Completed Mission ${mission.id}`,
        detail: mission.title,
        route: mission.route,
        time: "Today"
      }];
    }
    if (state.progress > 0) {
      return [{
        type: "Missions",
        title: `Worked on Mission ${mission.id}`,
        detail: mission.title,
        route: mission.route,
        time: "Today"
      }];
    }
    return [];
  });

  const noteRecords = (Array.isArray(notes) ? notes : []).map((note) => ({
    type: "Notes",
    title: note.title || "Saved reflection",
    detail: note.text || note.answer || "Reflection saved",
    route: "/activity",
    time: note.savedAt ? new Date(note.savedAt).toLocaleDateString() : "Saved"
  }));

  const fallback = [{
    type: "System",
    title: "Learning path ready",
    detail: "Start Mission 1 when you are ready.",
    route: "/mission/1-tokenisation",
    time: "Today"
  }];

  return [
    ...missionRecords,
    ...noteRecords,
    ...(missionRecords.length || noteRecords.length ? [] : fallback)
  ].map((item, index) => ({ id: index + 1, ...item }));
}
