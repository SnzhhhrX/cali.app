# Cali.app

> **AI-powered calisthenics technique assistant — running directly in the browser.**

Cali.app is a hackathon MVP that uses the device camera and **MediaPipe Pose** to track body landmarks, count repetitions, detect common technique errors, and give immediate feedback.

## Why Cali.app?

Training without a coach can make it difficult to know whether a movement is being performed correctly. Cali.app turns the camera into a lightweight technique assistant: the user chooses an exercise, gets into frame, and receives feedback while moving.

### Core idea

**Camera → Pose Detection → Body Landmarks → Movement Analysis → Error Detection → Feedback → Workout Result**

No account, backend, or app installation is required for the core experience.

## Features

- **Real-time pose tracking** with a visible skeleton overlay
- **Rep counting** for squats and push-ups
- **Timed plank mode**
- **Error Mode** with actionable technique feedback instead of a generic “Incorrect” message
- **Confidence filtering** so low-visibility frames do not casually create fake reps
- **Joint-angle overlay** showing the measurements used by movement logic
- **Camera controls**: front/back camera switch and fullscreen mode
- **Video demo mode** for analysing a prerecorded clip like a camera session
- **Workout goals and pause/resume** with automatic completion when a goal is reached
- **Workout summary** with reps, duration, and technique score
- **Shareable result image** generated in the browser
- **Statistics**: 7-day activity, technique graph, streaks, records, achievements, CSV export
- **RU / EN / KZ** interface and feedback
- **PWA support** for an app-like install experience
- **Responsive UI** for phones, tablets, and desktop

## Exercises

| Exercise | What Cali.app tracks |
|---|---|
| Squat | Repetitions + technique metrics |
| Push-up | Repetitions + technique metrics |
| Plank | Hold time + technique metrics |

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- [MediaPipe Pose](https://www.npmjs.com/package/@mediapipe/pose) via CDN
- Web Camera API
- Canvas API
- Service Worker / PWA APIs
- Local browser storage for workout history and settings

There is **no React, Node.js server, database, or build step** in this MVP.

## Project structure

```text
cali.app/
├── index.html              # Welcome screen + main application UI
├── app.js                  # Connects the application modules
├── style.css               # Full responsive visual system
├── manifest.json           # PWA metadata and app icons
├── sw.js                   # Service-worker caching
│
├── js/
│   ├── camera.js           # Camera / video input
│   ├── pose.js             # MediaPipe Pose + skeleton rendering
│   ├── exercises.js        # Angles, movement states, rep counting
│   ├── errorMode.js        # Technique error detection + feedback
│   ├── workout.js          # Workout state, goals and timing
│   ├── ui.js               # UI interactions and screen state
│   ├── i18n.js             # RU / EN / KZ translations
│   ├── content.js          # Welcome content, tips and summaries
│   ├── stats.js            # Statistics, achievements and CSV export
│   ├── share.js             # Result image generation / sharing
│   ├── storage.js          # Local persistence
│   └── voice.js             # Voice feedback
│
├── utils/
│   ├── angles.js           # Joint-angle calculations
│   ├── geometry.js         # Geometry helpers
│   └── thresholds.js       # Movement thresholds
│
└── assets/
    ├── icons/              # PWA icons and favicon
    ├── img/                # Local visual assets
    ├── sounds/             # Workout feedback sounds
    └── fonts/              # Local display/body fonts
```

## Run locally

Camera access requires a **secure context**: `https://` or `localhost`.

### Option 1 — Python

```bash
cd cali.app
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2 — Any static hosting

The project can be deployed as a static website. No server-side runtime is required for the MVP.

## Privacy model

The pose-processing flow is designed to run in the browser. The project does not include a backend endpoint for uploading camera frames. Workout history and settings use browser storage.

> **Important:** MediaPipe itself is loaded from a CDN on the first run, so an internet connection is normally required for the initial load. The service worker can cache resources after they have been loaded.

## Limitations

- Best results come from **one person** clearly visible in the frame.
- Side-view positioning is recommended for several exercises.
- Exercise selection is manual.
- Pose estimation can become less reliable with poor lighting, occlusion, unusual camera angles, or a partially visible body.
- This is a **fitness-tech prototype**, not a medical or professional coaching system.

## Hackathon MVP focus

The project focuses on one simple interaction loop:

1. Open Cali.app.
2. Choose an exercise.
3. Position yourself in the camera frame.
4. Start the workout.
5. Watch the skeleton and live feedback.
6. Finish the workout and review the result.

The goal is to demonstrate how computer vision can make basic bodyweight training more interactive without requiring a dedicated wearable device.

## Credits

- **MediaPipe Pose** — pose landmark detection
- **Pexels** — hero photography used in the landing page
- Local fonts and sound assets are bundled with the project.

## Status

**Hackathon MVP — September 2026**

Built as a browser-first prototype and intended for demonstration, testing, and further iteration.
