import { missionData } from "../data/courseData.js";

export const STORAGE_KEY = "aiExplorerProgress";
export const NOTES_STORAGE_KEY = "aiExplorerLearningNotes";

export function defaultProgress() {
  return {
    missions: Object.fromEntries(missionData.map((mission) => [mission.id, { progress: 0, completed: false }]))
  };
}

export function readProgress() {
  const base = defaultProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...base, ...saved, missions: { ...base.missions, ...(saved.missions || {}) } };
  } catch {
    return base;
  }
}

export function writeProgress(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
