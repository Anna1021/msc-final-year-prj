# Room 1 Event Sheet Plan: Token Door

This is the suggested Construct 3 event flow for `Room1_TokenDoor`.

## Global variables

- `RoomState = "intro"`
- `SelectedToken = ""`
- `SlotsFilled = 0`
- `IsReplay = false`
- `RewardEligible = true`
- `HintLevel = 0`

## Object naming

Use stable object names so the event sheet stays readable:

- `Bg_Room1`
- `Door_Main`
- `Door_Glow`
- `Tokeniser_Machine`
- `Robot_Guide`
- `Panel_Message`
- `Button_Hint`
- `Button_InspectDoor`
- `Button_RunTokeniser`
- `Button_ActivateLock`
- `Button_CollectCrystal`
- `Inventory_Frame`
- `Crystal_Token`
- `Crystal_Effect`
- `Slot_1` ... `Slot_5`
- `Token_I`
- `Token_Can`
- `Token_T`
- `Token_Wait`
- `Token_Bang`
- `Token_CantDistractor`

## On layout start

1. Run JavaScript:

```js
EscapeBridge.ready();
EscapeBridge.roomStarted("token", false);
EscapeBridge.progress("token", "intro");
```

2. Hide:
   - slots;
   - tray tokens;
   - crystal;
   - crystal effect;
   - collect button;
   - activate lock button.

3. Show:
   - background;
   - door;
   - tokeniser machine idle;
   - robot guide;
   - message panel.

4. Message:

> The lock receives text as token pieces rather than one whole block.

## Step 1: Inspect the door

Event:

`On Button_InspectDoor clicked`

Actions:

- play door reject/glow animation;
- set `RoomState = "doorInspected"`;
- show `Button_RunTokeniser`;
- message:

> Convert the sentence into token pieces before sending it to the lock.

- JavaScript:

```js
EscapeBridge.progress("token", "door-inspected");
```

## Step 2: Activate tokeniser

Event:

`On Button_RunTokeniser clicked`

Actions:

- play tokeniser machine animation;
- show learning simulation label;
- show input sentence: `I can't wait!`;
- show teaching output: `I | can | 't | wait | !`;
- show simulation note:

> Simplified tokenisation example. Different models may split text differently.

- show token pieces in shuffled tray:

`wait`, `I`, `can't`, `!`, `can`, `'t`

- show slots only now. Do not show five empty slots before tokeniser output appears.
- set `RoomState = "slotsVisible"`;
- JavaScript:

```js
EscapeBridge.progress("token", "tokeniser-activated");
```

## Step 3: Place token pieces

Support both drag-and-drop and click-to-place.

Drag version:

- user drags a token onto a slot;
- if slot is empty, snap token to slot;
- if slot is filled, return token to tray.

Click version:

- click token to set `SelectedToken`;
- click empty slot to place selected token.

Rules:

- the distractor `can't` can be picked, but it is wrong for this teaching output;
- do not immediately fail the room;
- mark the slot with error artwork if the wrong piece is placed;
- allow the user to remove/replace a token.

## Step 4: Activate lock

Event:

`On Button_ActivateLock clicked`

If not all slots filled:

- message:

> The lock still has empty slots. Fill each slot with a token piece first.

Then start a short timer and hide the warning.

If order is wrong:

- play slot error animation;
- message:

> The pieces are not in the same order as the sentence. Read the tokeniser output from left to right.

Then start a short timer and hide the warning.

If correct:

- set `RoomState = "lockProcessing"`;
- play slot correct lights left-to-right;
- play door glow;
- after delay, show crystal effect;
- show token crystal;
- set `RoomState = "crystalRevealed"`;
- show collect button.

## Step 5: Collect crystal

Event:

`On Button_CollectCrystal clicked`

Actions:

- animate crystal flying into `Inventory_Frame`;
- set `RoomState = "crystalCollected"`;
- play door opening animation or door light transition;
- set `RoomState = "complete"`;
- JavaScript:

```js
EscapeBridge.roomComplete("token", "token", 100);
```

If this is replay mode, the same message is safe because React prevents duplicate XP and crystals.

## Hints

Hints reveal one at a time:

1. Start by rebuilding the sentence from left to right.
2. A token can be a whole word, part of a word, or punctuation. Look carefully at `can't` and the exclamation mark.
3. For this learning simulation, use: `I → can → 't → wait → !`

Do not show hint 3 first.

## Room complete transition

After room complete, show two buttons:

- `Return to Room Map`
- `Enter Room 2` (can show locked placeholder until Room 2 exists)

When returning:

```js
EscapeBridge.returnedToHub();
```

