import { ESCAPE_PROGRESS_VERSION, ESCAPE_STORAGE_KEY, rooms } from "./escapeRoomData";

const validScreens = new Set(["room-select", "room", "final-exit"]);

function roomById(roomId) {
  return rooms.find((room) => room.id === roomId || room.crystalId === roomId);
}

export function roomNumberFromId(roomId) {
  const index = rooms.findIndex((room) => room.id === roomId || room.crystalId === roomId);
  return index >= 0 ? index + 1 : null;
}

function defaultEscapeProgress() {
  return {
    version: ESCAPE_PROGRESS_VERSION,
    currentScreen: "room-select",
    currentRoom: null,
    currentStep: "hub",
    lastPlayedRoom: null,
    crystalCollected: {},
    inventory: [],
    completedRooms: {},
    roomState: {
      token: {
        inspectedDoor: false,
        activatedTokeniser: false,
        selectedToken: null,
        placedTokens: [],
        lockActivated: false,
        crystalRevealed: false
      }
    }
  };
}

function normaliseProgress(raw) {
  const base = defaultEscapeProgress();
  if (!raw || raw.version !== ESCAPE_PROGRESS_VERSION) return base;
  const rawScreen = typeof raw.currentScreen === "string" ? raw.currentScreen : base.currentScreen;
  const next = {
    ...base,
    ...raw,
    currentScreen: validScreens.has(rawScreen) ? rawScreen : "room-select",
    crystalCollected: { ...base.crystalCollected, ...(raw.crystalCollected || {}) },
    completedRooms: { ...base.completedRooms, ...(raw.completedRooms || {}) },
    roomState: { ...base.roomState, ...(raw.roomState || {}) },
    inventory: Array.isArray(raw.inventory) ? raw.inventory : []
  };
  next.roomState.token = { ...base.roomState.token, ...(raw.roomState?.token || {}) };

  for (const room of rooms) {
    if (next.completedRooms[room.id] && !next.crystalCollected[room.id]) next.completedRooms[room.id] = false;
    if (next.crystalCollected[room.id] && !next.inventory.includes(room.crystalId)) next.inventory.push(room.crystalId);
  }

  next.inventory = next.inventory.filter((crystalId, index, inventory) => inventory.indexOf(crystalId) === index && rooms.some((room) => room.crystalId === crystalId));

  if (next.currentRoom && !roomById(next.currentRoom)) {
    next.currentRoom = null;
  }
  if (next.lastPlayedRoom && !roomById(next.lastPlayedRoom)) {
    next.lastPlayedRoom = null;
  }
  if (!next.currentStep) next.currentStep = next.currentScreen === "room-select" ? "hub" : "playing";
  return next;
}

export function readEscapeProgress() {
  try {
    return normaliseProgress(JSON.parse(localStorage.getItem(ESCAPE_STORAGE_KEY) || "null"));
  } catch {
    return defaultEscapeProgress();
  }
}

export function writeEscapeProgress(next) {
  localStorage.setItem(ESCAPE_STORAGE_KEY, JSON.stringify(normaliseProgress(next)));
}

export function resetEscapeProgress() {
  const next = defaultEscapeProgress();
  writeEscapeProgress(next);
  return next;
}

export function resolveContinueDestination(progress = readEscapeProgress()) {
  const current = normaliseProgress(progress);
  const firstIncomplete = rooms.find((room) => !(current.completedRooms[room.id] && current.crystalCollected[room.id] && current.inventory.includes(room.crystalId)));
  if (firstIncomplete) {
    return { screen: "room", roomId: firstIncomplete.id, roomNumber: roomNumberFromId(firstIncomplete.id), replay: false, rewardEligible: true };
  }
  if (!current.finalCompleted) {
    return { screen: "final-exit", roomId: "final-exit", roomNumber: null, replay: false, rewardEligible: true };
  }
  return { screen: "room-select", roomId: null, roomNumber: null, replay: false, rewardEligible: false };
}

export function getStartupProgress(progress = readEscapeProgress()) {
  const current = normaliseProgress(progress);
  const shouldRestoreRoom = current.currentScreen === "room" && current.currentRoom && roomById(current.currentRoom);
  const shouldRestoreExit = current.currentScreen === "final-exit";
  const next = shouldRestoreRoom || shouldRestoreExit ? current : {
    ...current,
    currentScreen: "room-select",
    currentRoom: null,
    currentStep: "hub"
  };
  writeEscapeProgress(next);
  return readEscapeProgress();
}

export function updateEscapeNavigation(patch) {
  const current = readEscapeProgress();
  const nextScreen = validScreens.has(patch.currentScreen) ? patch.currentScreen : current.currentScreen || "room-select";
  const nextRoom = patch.currentRoom ? roomById(patch.currentRoom)?.id || null : patch.currentRoom === null ? null : current.currentRoom;
  const next = {
    ...current,
    currentScreen: nextScreen,
    currentRoom: nextRoom,
    currentStep: patch.currentStep || (nextScreen === "room-select" ? "hub" : current.currentStep || "playing"),
    lastPlayedRoom: patch.lastPlayedRoom ? roomById(patch.lastPlayedRoom)?.id || current.lastPlayedRoom : patch.lastPlayedRoom === null ? null : current.lastPlayedRoom
  };
  writeEscapeProgress(next);
  return readEscapeProgress();
}

export function collectCrystalTransaction(progress, roomId) {
  const next = normaliseProgress(progress);
  const room = roomById(roomId);
  if (!room) return next;
  next.crystalCollected[room.id] = true;
  if (!next.inventory.includes(room.crystalId)) next.inventory.push(room.crystalId);
  next.completedRooms[room.id] = true;
  next.currentScreen = "room";
  next.currentRoom = room.id;
  next.lastPlayedRoom = room.id;
  next.currentStep = "complete";
  writeEscapeProgress(next);
  return next;
}
