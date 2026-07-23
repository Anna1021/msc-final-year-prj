/*
 * Construct 3 bridge helper for AI Explorer.
 *
 * Include this file in the Construct 3 HTML5 export or copy the functions
 * into a Construct script file. The React page validates these messages and
 * stores progress outside the game.
 */

window.EscapeBridge = (() => {
  const targetOrigin = window.location.origin;
  let latestInit = null;
  const listeners = new Set();

  function send(type, payload = {}) {
    window.parent.postMessage({ type, payload }, targetOrigin);
  }

  function onInit(callback) {
    listeners.add(callback);
    if (latestInit) callback(latestInit);
    return () => listeners.delete(callback);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== targetOrigin) return;
    const data = event.data || {};

    if (data.type === "ESCAPE_ROOM_INIT") {
      latestInit = data.payload || {};
      listeners.forEach((callback) => callback(latestInit));
    }

    if (data.type === "ESCAPE_ROOM_OPEN_HUB" || data.type === "ESCAPE_ROOM_RETURN_TO_HUB") {
      listeners.forEach((callback) => callback({ ...(latestInit || {}), command: "open-hub" }));
    }

    if (data.type === "ESCAPE_ROOM_CONTINUE") {
      listeners.forEach((callback) => callback({ ...(latestInit || {}), command: "continue", destination: data.payload?.destination }));
    }

    if (data.type === "ESCAPE_ROOM_OPEN_ROOM" || data.type === "ESCAPE_ROOM_REPLAY_ROOM") {
      listeners.forEach((callback) => callback({
        ...(latestInit || {}),
        command: data.type === "ESCAPE_ROOM_REPLAY_ROOM" ? "replay-room" : "open-room",
        roomId: data.payload?.roomId,
        replay: Boolean(data.payload?.replay)
      }));
    }
  });

  return {
    ready() {
      send("ESCAPE_ROOM_READY");
    },

    requestState() {
      send("ESCAPE_ROOM_REQUEST_STATE");
    },

    onInit,

    screenChanged(currentScreen, roomId = null, step = "playing") {
      send("ESCAPE_ROOM_SCREEN_CHANGED", { currentScreen, roomId, step });
    },

    roomStarted(roomId, replay = false) {
      send("ESCAPE_ROOM_ROOM_STARTED", { roomId, replay });
    },

    progress(roomId, step) {
      send("ESCAPE_ROOM_PROGRESS", { roomId, step });
    },

    roomComplete(roomId, crystal = roomId, xp = 100) {
      send("ESCAPE_ROOM_ROOM_COMPLETE", { roomId, crystal, xp });
    },

    finalComplete(xp = 150) {
      send("ESCAPE_ROOM_COMPLETE", { xp });
    },

    returnedToHub() {
      send("ESCAPE_ROOM_RETURNED_TO_HUB");
    },

    navigate(route) {
      send("ESCAPE_ROOM_NAVIGATE", { route });
    },

    getLatestInit() {
      return latestInit;
    }
  };
})();

