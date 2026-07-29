import { finalExitPuzzle, rooms } from "./escapeRoomData";

export const GAME_READY_TIMEOUT_MS = 10000;
export const GAME_BASE_SRC = "/escape-room/index.html";

const inboundTypes = new Set([
  "ESCAPE_ROOM_READY",
  "ESCAPE_ROOM_PROGRESS",
  "ESCAPE_ROOM_SCREEN_CHANGED",
  "ESCAPE_ROOM_ROOM_STARTED",
  "ESCAPE_ROOM_RETURNED_TO_HUB",
  "ESCAPE_ROOM_ROOM_COMPLETE",
  "ESCAPE_ROOM_COMPLETE",
  "ESCAPE_ROOM_NAVIGATE",
  "ESCAPE_ROOM_REQUEST_STATE"
]);

const routeMap = {
  home: "/dashboard",
  dashboard: "/dashboard",
  progress: "/progress",
  missions: "/missions"
};

const specialRoomIds = new Set(["intro", "room-select", "roomselect", "exit", "final-exit", "finalexit"]);

function roomById(roomId) {
  const key = String(roomId ?? "").toLowerCase().replace(/\s+/g, "-");
  return rooms.find((room, index) => {
    const number = String(index + 1);
    return room.id === key ||
      room.crystalId === key ||
      String(room.label).toLowerCase() === String(roomId).toLowerCase() ||
      `room-${number}` === key ||
      `room${number}` === key ||
      number === key;
  });
}

export function normaliseRoomId(roomId) {
  const key = String(roomId ?? "").toLowerCase().replace(/\s+/g, "-");
  if (specialRoomIds.has(key)) {
    if (key === "roomselect") return "room-select";
    if (key === "finalexit") return "final-exit";
    return key;
  }
  return roomById(roomId)?.id || "";
}

export function buildGameSrc(debug = false) {
  return `${GAME_BASE_SRC}${debug ? "?debug=1" : ""}`;
}

export function isDebugMode() {
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function buildInitPayload(escapeProgress, mainProgress, preferredLanguage = "en") {
  const completedRooms = rooms
    .filter((room) => escapeProgress.completedRooms?.[room.id] && escapeProgress.crystalCollected?.[room.id])
    .map((room) => room.id);

  return {
    currentScreen: escapeProgress.currentScreen || "room-select",
    completedRooms,
    crystals: Array.isArray(escapeProgress.inventory) ? escapeProgress.inventory : [],
    finalExitCompleted: Boolean(escapeProgress.finalCompleted),
    preferredLanguage,
    currentRoom: escapeProgress.currentRoom || null,
    currentStep: escapeProgress.currentStep || "hub",
    lastPlayedRoom: escapeProgress.lastPlayedRoom || null,
    progressVersion: escapeProgress.version,
    rooms: rooms.map(({ id, title, label, crystalId, crystalName, accent }) => ({ id, title, label, crystalId, crystalName, accent })),
    finalExitPuzzle
  };
}

export function sendGameInit(iframe, payload) {
  iframe?.contentWindow?.postMessage({ type: "ESCAPE_ROOM_INIT", payload }, window.location.origin);
}

export function sendGameCommand(iframe, type, payload = {}) {
  iframe?.contentWindow?.postMessage({ type, payload }, window.location.origin);
}

function unwrapPayload(data) {
  if (data && typeof data.payload === "object" && data.payload !== null) return data.payload;
  return data || {};
}

function normaliseIncoming(data) {
  const payload = unwrapPayload(data);
  if (data?.type === "ESCAPE_ROOM_ROOM_COMPLETE") {
    return {
      roomId: normaliseRoomId(payload.roomId || data.roomId || payload.crystal || data.crystal),
      crystal: payload.crystal || data.crystal
    };
  }
  if (data?.type === "ESCAPE_ROOM_PROGRESS") {
    return {
      roomId: normaliseRoomId(payload.roomId || data.roomId || payload.currentRoom || data.currentRoom),
      step: typeof payload.step === "string" ? payload.step : typeof data.step === "string" ? data.step : "playing"
    };
  }
  if (data?.type === "ESCAPE_ROOM_SCREEN_CHANGED") {
    return {
      currentScreen: payload.currentScreen || data.currentScreen || "room-select",
      roomId: normaliseRoomId(payload.roomId || data.roomId || payload.currentRoom || data.currentRoom),
      step: typeof payload.step === "string" ? payload.step : typeof data.step === "string" ? data.step : "playing"
    };
  }
  if (data?.type === "ESCAPE_ROOM_ROOM_STARTED") {
    return {
      roomId: normaliseRoomId(payload.roomId || data.roomId || payload.currentRoom || data.currentRoom),
      replay: Boolean(payload.replay || data.replay)
    };
  }
  if (data?.type === "ESCAPE_ROOM_RETURNED_TO_HUB") {
    return { currentScreen: "room-select" };
  }
  if (data?.type === "ESCAPE_ROOM_COMPLETE") {
    return {};
  }
  if (data?.type === "ESCAPE_ROOM_NAVIGATE") {
    const routeKey = payload.route || data.route;
    return { route: routeMap[routeKey] || "" };
  }
  return payload;
}

export function validateEscapeRoomMessage(event) {
  if (event.origin !== window.location.origin) return { ok: false, reason: "Unexpected message origin." };
  const data = event.data;
  if (!data || typeof data !== "object") return { ok: false, reason: "Message was not an object." };
  if (!inboundTypes.has(data.type)) return { ok: false, reason: "Unknown Escape Room message type." };

  const payload = normaliseIncoming(data);
  if (data.type === "ESCAPE_ROOM_ROOM_COMPLETE" && (!payload.roomId || !roomById(payload.roomId))) return { ok: false, reason: "Room completion message is missing a valid roomId." };
  if (data.type === "ESCAPE_ROOM_PROGRESS" && !payload.roomId) return { ok: false, reason: "Progress message is missing a valid roomId." };
  if (data.type === "ESCAPE_ROOM_ROOM_STARTED" && (!payload.roomId || !roomById(payload.roomId))) return { ok: false, reason: "Room start message is missing a valid roomId." };
  if (data.type === "ESCAPE_ROOM_SCREEN_CHANGED") {
    const validScreens = new Set(["room-select", "room", "final-exit", "completion"]);
    if (!validScreens.has(payload.currentScreen)) return { ok: false, reason: "Screen change message has an unsupported screen." };
    if (payload.currentScreen === "room" && (!payload.roomId || !roomById(payload.roomId))) return { ok: false, reason: "Room screen change is missing a valid roomId." };
  }
  if (data.type === "ESCAPE_ROOM_NAVIGATE" && !payload.route) return { ok: false, reason: "Navigate message has an unsupported route." };

  return { ok: true, type: data.type, payload };
}
