export const createMission1CoreProgress = () => ({
  introSeen: true,
  playgroundRun: false,
  partAComplete: false,
  partBComplete: false,
  summarySeen: false
});

export function isMission1CoreComplete(core) {
  return Boolean(core?.introSeen && core?.playgroundRun && core?.partAComplete && core?.partBComplete && core?.summarySeen);
}

export function completeMission1Progress(progress) {
  if (progress.missions[1]?.completed) return progress;
  const next = structuredClone(progress);
  next.missions[1] = { progress: 100, completed: true };
  return next;
}
