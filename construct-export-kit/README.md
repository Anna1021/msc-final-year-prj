# Construct 3 Export Kit for AI Literacy Escape Room

This folder is a handoff kit for building the real Final Challenge inside Construct 3.

The React site already has:

- the `/final-challenge` page;
- an iframe slot for `/escape-room/index.html`;
- progress, XP, crystal inventory and duplicate-reward protection;
- a postMessage bridge between React and the embedded HTML5 game.

The current `public/escape-room/index.html` is only a placeholder runtime. Do not build room gameplay in React. Build the actual escape room in Construct 3, export it as HTML5, then replace `public/escape-room/` with the Construct export.

## Files in this kit

- `construct-bridge.js`  
  Small JavaScript helper to include in Construct 3 browser scripts.

- `room1-spec.json`  
  Object names, asset names, token data and completion conditions for Room 1.

- `room1-event-sheet.md`  
  Suggested Construct Event Sheet logic for the Token Door room.

## Required Construct layouts

For the first milestone, build only:

1. `RoomSelect`
2. `Room1_TokenDoor`

Do not start Rooms 2-6 until Room 1 works end-to-end.

## Room 1 learning aim

Room 1 should teach:

> A token may be a word, part of a word, or punctuation.

Use the sentence:

> I can't wait!

The teaching tokeniser output is:

> I | can | 't | wait | !

Always show this as a learning simulation:

> Simplified tokenisation example. Different models may split text differently.

## React message flow

When Construct starts:

```js
EscapeBridge.ready();
```

React replies with `ESCAPE_ROOM_INIT`.

When Room 1 starts:

```js
EscapeBridge.roomStarted("token", replayMode);
```

When Room 1 is solved and the crystal is collected:

```js
EscapeBridge.roomComplete("token", "token", 100);
```

When returning to Room Select:

```js
EscapeBridge.returnedToHub();
```

React will save:

- `token` room completed;
- `token` crystal collected;
- XP awarded once only;
- inventory restored after refresh.

