# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server on port 5173
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript validation (no emit)
```

There are no test or lint scripts defined.

## Architecture

Hush 3.0 is a browser-based cinematic 3D room visualization rendered entirely via Canvas 2D (no WebGL). It renders a lounge interior with interactive hotspots (window, TV, hi-fi, lamp, holographic cube) and a multi-pass post-processing pipeline.

**Entry point**: `src/main.ts` → `src/app.js`

### Multi-pass rendering pipeline

`src/app.js` (~3100 lines) is the core render loop. It maintains 9 offscreen canvases — one per effect pass — and composites them onto the main visible canvas each frame:

| Pass | File | Canvas var | Purpose |
|------|------|-----------|---------|
| Bloom | `src/render/passes/bloom.js` | `glowCanvas` | Glow from light sources |
| Contact shadows | `src/render/passes/contact-shadows.js` | `shadowCanvas` | Soft floor shadows |
| Atmosphere | `src/render/passes/atmosphere.js` | `airCanvas` | Haze / depth fog |
| Light wrap | `src/render/passes/light-wrap.js` | `lightCanvas` | Rim lighting / bleed |
| Material response | `src/render/passes/material.js` | `materialCanvas` | Sheen on surfaces |
| Reflection | `src/render/passes/reflection.js` | `reflectionCanvas` | Surface reflections |
| Colour grade | `src/render/passes/colour-grade.js` | `gradeCanvas` | LUT-style grading + vignette |
| Lens treatment | `src/render/passes/lens.js` | `lensCanvas` | Film grain, chromatic aberration, halation |
| Depth polish | `src/render/passes/depth-polish.js` | `depthCanvas` | Focal depth enhancement |

Each pass module exports a factory that returns a `render` function and a `composite` function. Heavy passes (atmosphere, material, reflection) are throttled — they only re-render every Nth frame.

### Key modules

- **`src/core/state.js`** — global mutable state: time, focus, mouse, animation counters, UI DOM refs
- **`src/core/math.js`** — shared helpers: `clamp`, `lerp`, `ease`, `gaussian`, `mixColor`, `rr` (rounded-rect draw)
- **`src/scene/config.js`** — layout positions, hotspot definitions, music track metadata
- **`src/assets/loader.js`** — preloads all PNG/video assets from `public/assets/`; exposes progress to the loader UI
- **`src/ui/controls.js`** — click/mousemove handling, hotspot hit-testing, focus management, wires DOM controls to state
- **`src/debug/controls.js`** — `Ctrl+Shift+G` enables debug mode; 80+ keybinds for live-tuning pass parameters and previewing individual passes

### Adaptive quality system

The app monitors frame rate and automatically scales render resolution (720p/900p/1080p) with hysteresis to prevent thrashing. There is also a bottom-left quality menu for manual override. Logical resolution is always 1920×1080; a `devicePixelRatio`-aware scale factor is applied.

### Interactive hotspots

Clicks on the canvas are routed through `src/ui/controls.js` against hotspot regions defined in `src/scene/config.js`. The single-focus model zooms into one hotspot at a time. Hotspots: window (weather modes), hi-fi (vinyl/Spotify/radio, play/pause), TV (ambient/anime channels), holographic cube (mood), lamp (toggle).

### TypeScript configuration

`tsconfig.json` uses `strict: false` with target ES2022. Most source files are `.js`; only the entry point is `.ts`. Type checking is lightweight — `pnpm typecheck` runs `tsc --noEmit`.

## Project Vision

Hush OS is an ambient second-monitor experience, not a normal app UI.

It should feel calm, premium, cinematic and atmospheric.

The room should feel inevitable, not obviously designed.

Avoid obvious software UI tropes where possible.

Prefer object-led interactions over cursor-led interactions.

Make small, testable changes.

Do not do large refactors unless explicitly asked.

Before changing code, explain which file will change and why.

Preserve the Canvas 2D architecture unless asked otherwise.

The long-term goal includes music/radio playback and possible TV video channels.
