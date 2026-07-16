# AI Explorer

Homepage dashboard prototype for a 14-16 age learning website about how ChatGPT generates text.

## Homepage Purpose

The homepage immediately tells students:

- This website teaches how ChatGPT generates text.
- They need to complete 6 missions.
- The Final Challenge unlocks after all missions are complete.

## Current UI

- Mission 1 tokenisation page matching the provided mission layout.
- Mission 2 next-token prediction page with guessing, probability bars, and temperature exploration.
- Missions list page for real sidebar/back navigation.
- Left sidebar with Home, Missions, Progress, Badges, Glossary, and About.
- User profile card showing Explorer, Level 3, XP, and progress.
- Top status bar with XP, 7 day streak, Settings, and Profile.
- Hero section: "Understand how ChatGPT thinks."
- Six mission cards with locked states for later missions.
- Final Challenge card with locked feedback.
- Progress section with a 0% circular progress indicator.
- Skills You'll Learn links to glossary anchors.
- Recent Badges section with locked badge states.
- Settings modal with sound, animation speed, text size, dark mode, and reset progress.

## Click Behaviour

This is a static prototype. Clicks currently simulate routing with toast feedback and update the browser path using the requested URLs, including:

- `/dashboard`
- `/missions`
- `/progress`
- `/badges`
- `/glossary`
- `/about`
- `/profile`
- `/mission/1-tokenisation`
- `/mission/2-next-token`
- `/mission/3-hallucination`
- `/mission/4-context`
- `/mission/5-training-data`
- `/mission/6-bias`
- `/final-challenge`

Locked missions and the Final Challenge show unlock messages.

## Files

- `index.html` - homepage dashboard
- `mission-1-tokenisation.html` - Mission 1 learning page
- `mission-2-next-token.html` - Mission 2 next-token prediction page
- `missions.html` - all missions list page
- `assets/css/style.css` - dashboard visual design
- `assets/css/mission.css` - mission page visual design
- `assets/js/app.js` - routing feedback, locked states, and settings modal
- `assets/js/mission1.js` - Mission 1 tokenisation and mini challenge logic
- `assets/js/mission2.js` - Mission 2 prediction, probability, and temperature logic
- `assets/js/missions.js` - missions list interactions
- `assets/img/mission-robot-reading.png` - 3D robot reading illustration
- `assets/img/mission-robot-pointing.png` - 3D robot prediction illustration
- `project.json` - project metadata

## Run Locally

Open `index.html` directly in a browser, or run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
