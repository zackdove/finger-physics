# Hand Physics

Interactive hand-tracked physics scene built with React Three Fiber, Rapier, MediaPipe, GSAP, and Leva.

The app opens your webcam, tracks your hand in real time, and maps your index-finger position to a kinematic physics body that interacts with a field of instanced spheres.

## What The App Does

1. Shows a full-screen loading UI while the hand tracker is initializing.
2. Fades out the loading UI and enables a short onboarding CTA.
3. Displays a hand prompt:
   - `Please raise a finger to the camera`
   - then `Hold`
   - then `Complete`
4. After onboarding, keeps the 3D scene interactive while your hand drives a tracked sphere.
5. Exposes scene controls (colors, counts, force params, tracked sphere settings) in a Leva panel.

## Core Interaction Flow

- `LoadScreen` is visible until MediaPipe hand tracking is ready.
- A blur overlay can appear between loading and CTA phases.
- `ShowHandCTA` is controlled imperatively from `App.tsx` via:
  - `start()` when a hand is detected long enough to begin hold timing
  - `cancel()` if tracking is lost
  - `complete()` after hold is satisfied
- CTA visibility can be persisted in `localStorage`, so returning users can skip onboarding.

## Stack

### Frontend / Runtime

- `React 19` + `TypeScript`
  - Component architecture, strict typing, hooks-based state/effects.
- `Vite 7`
  - Fast local dev server and production build pipeline.
- `GSAP`
  - Timeline/tween orchestration for:
    - loading screen fades
    - blur overlay in/out
    - CTA entry / hold / completion / exit transitions

### 3D + Physics

- `three`
  - Core 3D engine.
- `@react-three/fiber`
  - React renderer for Three.js.
- `@react-three/drei`
  - Helpers like environment maps and texture loading.
- `@react-three/rapier`
  - Physics engine bindings for rigid-body simulation.

### Hand Tracking

- `@mediapipe/tasks-vision`
  - Primary hand landmark detection pipeline (`HandLandmarker`) in VIDEO mode.
- Webcam input via browser `getUserMedia`.
- Landmark mapping:
  - Index fingertip landmark drives kinematic body position in world space.
  - Horizontal movement includes viewport-ratio compensation for mobile.

### UI Controls

- `leva`
  - Runtime control panel for scene and interaction tuning.
- Custom Leva theme and mobile wrapper styling are applied in:
  - `src/config/levaTheme.ts`
  - `src/index.css`

### Quality / Tooling

- `ESLint 9` + `typescript-eslint` + React hooks rules.
- TypeScript strict mode enabled in `tsconfig.app.json`.

## Project Structure

```txt
src/
  App.tsx                          # App composition + onboarding/persistence flow
  components/
    Balls.tsx                      # Instanced physics spheres
    ForceManager.ts                # Shared central-force behavior
    HandLandmarker/HandLandmarker.tsx
    HandTracker/HandTracker.tsx    # Webcam + hand detection + tracking timers
    Handpose/Handpose.tsx          # Kinematic tracked sphere mapped to fingertip
    LoadScreen/LoadScreen.tsx
    LoadScreen/LoadingText.tsx
    BlurOverlay/BlurOverlay.tsx
    ShowHandCTA/ShowHandCTA.tsx
    LevaControls/SceneControls.tsx
  config/levaTheme.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm (or yarn/pnpm if you prefer)
- A webcam-enabled browser (Chrome/Safari/Edge)

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Configuration

### CTA Persistence

By default, CTA completion is persisted in `localStorage` with key `hand_cta_shown`.

Environment toggle:

- `VITE_PERSIST_HAND_CTA=true` (default behavior)
- `VITE_PERSIST_HAND_CTA=false` (always show CTA)

Create `/.env.local`:

```bash
VITE_PERSIST_HAND_CTA=false
```

Runtime query-string override (highest precedence):

- `?handCtaPersist=0` force disable persistence
- `?handCtaPersist=1` force enable persistence

Examples:

- `http://localhost:5173/?handCtaPersist=0`
- `http://localhost:5173/?handCtaPersist=1`

## Notes

- Camera permission is required for tracking.
- The build may warn about large chunks because 3D/vision dependencies are heavy; this is expected for this kind of app.
- Some legacy dependencies are still present in `package.json` from earlier tracking experiments. The active runtime path currently uses MediaPipe Tasks Vision.
