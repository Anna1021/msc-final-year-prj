import { missionData } from "../data/courseData.js";

export const STORAGE_KEY = "aiExplorerProgress";
export const NOTES_STORAGE_KEY = "aiExplorerLearningNotes";
export const CURRICULUM_VERSION = 2;

function cleanMissionState(saved = {}) {
  const completed = saved.completed === true;
  const numericProgress = Number(saved.progress);
  const progress = completed ? 100 : Number.isFinite(numericProgress) ? Math.min(100, Math.max(0, numericProgress)) : 0;
  return { progress, completed };
}

export function defaultProgress() {
  return {
    curriculumVersion: CURRICULUM_VERSION,
    missions: Object.fromEntries(missionData.map((mission) => [mission.id, { progress: 0, completed: false }]))
  };
}

export function normaliseProgress(raw) {
  const base = defaultProgress();
  const savedMissions = raw && typeof raw === "object" && raw.missions && typeof raw.missions === "object" ? raw.missions : {};
  if (raw?.curriculumVersion === CURRICULUM_VERSION) return {
    curriculumVersion: CURRICULUM_VERSION,
    missions: Object.fromEntries(missionData.map((mission) => [mission.id, cleanMissionState(savedMissions[mission.id])]))
  };

  const old2 = cleanMissionState(savedMissions[2]);
  const old4 = cleanMissionState(savedMissions[4]);
  const combinedMission2 = {
    completed: old2.completed && old4.completed,
    progress: old2.completed && old4.completed ? 100 : Math.round((old2.progress + old4.progress) / 2)
  };
  return {
    curriculumVersion: CURRICULUM_VERSION,
    missions: {
      1: cleanMissionState(savedMissions[1]),
      2: combinedMission2,
      3: cleanMissionState(savedMissions[3]),
      5: cleanMissionState(savedMissions[5]),
      6: cleanMissionState(savedMissions[6])
    }
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
  return missionData.some((mission) => mission.id === id);
}

export function canAccessMission(_progress, id, _qaMode = false) {
  return missionData.some((mission) => mission.id === id);
}

export function recommendedMissionId(progress) {
  return missionData.find((mission) => !progress.missions[mission.id]?.completed)?.id ?? null;
}

export function missionLearningState(progress, id, visitedIds = []) {
  const missionState = progress.missions[id] || { progress: 0, completed: false };
  return {
    available: canAccessMission(progress, id),
    recommended: recommendedMissionId(progress) === id,
    visited: visitedIds instanceof Set ? visitedIds.has(id) : visitedIds.includes?.(id) === true,
    activityComplete: missionState.progress > 0 || missionState.completed,
    missionComplete: missionState.completed === true
  };
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
        title: `Completed Mission ${mission.order}`,
        detail: mission.title,
        route: mission.route,
        time: "Today"
      }];
    }
    if (state.progress > 0) {
      return [{
        type: "Missions",
        title: `Worked on Mission ${mission.order}`,
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
    route: "/mission/1-tokenisation-paged",
    time: "Today"
  }];

  return [
    ...missionRecords,
    ...noteRecords,
    ...(missionRecords.length || noteRecords.length ? [] : fallback)
  ].map((item, index) => ({ id: index + 1, ...item }));
}
