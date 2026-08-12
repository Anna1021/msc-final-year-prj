# AI Literacy Escape Room Runtime

This folder is reserved for the Construct 3 HTML5 export for the Final Challenge.

The current `index.html` is only a clean integration placeholder. It is not the final Escape Room game and should not contain room gameplay. In normal mode it should only report that the bridge is connected and that the Construct export has not been installed yet. Debug controls are available only by opening LLM Explorer with `?debug=1`.

## How to replace this folder with Construct 3

1. Build the Escape Room in Construct 3.
2. Export the project as HTML5.
3. Replace the contents of `public/escape-room/` with the exported files.
4. Keep the exported entry file named `index.html`.
5. Preserve the bridge messages below so React can save progress and crystals.

The implementation handoff files are in `construct-export-kit/` at the project root. Use `construct-export-kit/construct-bridge.js` inside the Construct export, and follow `construct-export-kit/room1-event-sheet.md` for the Room 1 milestone.

## Required message contract

Construct should send this when the runtime is ready:

```js
window.parent.postMessage({ type: "ESCAPE_ROOM_READY" }, window.location.origin);
```

React will respond with:

```js
{
  type: "ESCAPE_ROOM_INIT",
  payload: {
    completedRooms: ["token"],
    crystals: ["token"],
    finalExitCompleted: false,
    currentScreen: "room-select",
    preferredLanguage: "en",
    currentRoom: null,
    currentStep: "hub",
    lastPlayedRoom: "token",
    rooms: [],
    finalExitPanels: {}
  }
}
```

The Construct game should start at the Room Select / Challenge Hub. Do not automatically open a final completion screen just because all six rooms are complete. Completion screens are temporary and should offer routes back to the Room Select hub.

React may send navigation commands at any time:

```js
{ type: "ESCAPE_ROOM_OPEN_HUB", payload: { progress: {} } }
{ type: "ESCAPE_ROOM_CONTINUE", payload: { destination: { screen: "room", roomId: "token", replay: false } } }
{ type: "ESCAPE_ROOM_OPEN_ROOM", payload: { roomId: "token", replay: true, rewardEligible: false } }
{ type: "ESCAPE_ROOM_REPLAY_ROOM", payload: { roomId: "token", replay: true, rewardEligible: false } }
{ type: "ESCAPE_ROOM_OPEN_FINAL_EXIT", payload: { destination: { screen: "final-exit" } } }
{ type: "ESCAPE_ROOM_RETURN_TO_HUB", payload: {} }
```

When replaying a completed room, allow gameplay interactions but do not send extra rewards. If a completion message is sent again, React will ignore duplicate crystals and keep progress idempotent.

When a room is completed, Construct should send:

```js
window.parent.postMessage({
  type: "ESCAPE_ROOM_ROOM_COMPLETE",
  payload: {
    roomId: "token",
    crystal: "token"
  }
}, window.location.origin);
```

When the final exit is completed, Construct should send:

```js
window.parent.postMessage({
  type: "ESCAPE_ROOM_COMPLETE",
  payload: {}
}, window.location.origin);
```

Optional messages:

```js
window.parent.postMessage({ type: "ESCAPE_ROOM_SCREEN_CHANGED", payload: { currentScreen: "room-select", step: "hub" } }, window.location.origin);
window.parent.postMessage({ type: "ESCAPE_ROOM_ROOM_STARTED", payload: { roomId: "token", replay: true } }, window.location.origin);
window.parent.postMessage({ type: "ESCAPE_ROOM_RETURNED_TO_HUB" }, window.location.origin);
window.parent.postMessage({ type: "ESCAPE_ROOM_PROGRESS", payload: { roomId: "token", step: "puzzle" } }, window.location.origin);
window.parent.postMessage({ type: "ESCAPE_ROOM_REQUEST_STATE" }, window.location.origin);
window.parent.postMessage({ type: "ESCAPE_ROOM_NAVIGATE", payload: { route: "missions" } }, window.location.origin);
```

## Room 1 milestone

Do not start Rooms 2-6 until Room 1 works end-to-end inside the Construct export:

- RoomSelect layout
- Room1 layout
- token drag-and-drop
- five matching door slots
- incorrect-token feedback
- door opening animation
- crystal collection
- inventory update
- `ESCAPE_ROOM_ROOM_COMPLETE` message
- transition back to RoomSelect or Room 2
- replay mode with no duplicate rewards
- final completion never traps the learner away from RoomSelect
