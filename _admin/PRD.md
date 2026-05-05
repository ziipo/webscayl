# webscayl — Product Requirements Document

_Status: working draft (v2). Supersedes `initialPRD.md` in the repo root._

## 1. Concept
A purely client-side, serverless image upscaling web app that runs Real-ESRGAN models in the browser via WebGPU/WASM. Wrapped in a Neo-brutalist UI. Hosted on GitHub Pages. Spiritual cousin of Upscayl, but on the web.

## 2. Vision & Goals
- **Zero-server upscaling.** No image leaves the user's machine. Inference runs in-browser via ONNX Runtime Web (WebGPU EP, WASM fallback).
- **Distinctive UX.** Neo-brutalist: high contrast, hard shadows, chunky controls, monospace technical readouts. Feels like an industrial tool, not a SaaS dashboard.
- **User empowerment.** Expose tile size, model choice, and multiplier so users can balance quality vs. their machine's limits — and learn how browser ML actually works in the process.

## 3. Target Audience
Digital artists, meme creators, and developers who want a free, private, quick upscale. Bonus: people who like raw, unconventional web UIs.

## 4. UI/UX Design System: Neo-brutalism

### Color palettes (randomized per page load)
At least three palettes ship in v1. One is selected at random on each load. Each palette defines: `--bg`, `--fg` (always near-black), `--accent`, `--accent-2` (optional secondary).

Initial palettes:
1. **CONSTRUCTION** — raw beige bg, pitch-black fg, safety orange accent.
2. **HAZARD** — pure white bg, pitch-black fg, neon yellow accent.
3. **PUNK** — off-white bg, pitch-black fg, electric pink accent.

Easy to add more by appending to the palette registry.

### Typography
- Headers: a brutal sans (Space Grotesk or Archivo Black).
- Technical readouts / controls / log: monospace (JetBrains Mono or Courier).
- Large, unrefined sizing. No subtle hierarchy — sizes jump.

### Components
- 2–4px solid black borders on all interactive elements.
- Hard offset black box-shadows (no blur). Buttons translate down on press to simulate physical depression.
- Visible grid lines / harsh dividers between sections.

## 5. Core Features & Controls

### A. Input Zone
- Massive dashed-border drop zone. Also accepts click-to-pick.
- Formats: JPG, PNG, WEBP.
- **Hard input limit: 1024×1024.** Larger images are rejected with an aggressive error card. (This is the documented headroom we commit to supporting at MVP.)

### B. Engine Room (controls)
- **Model selector** (chunky toggle blocks):
  - Real-ESRGAN General (photos)
  - Real-ESRGAN Anime (illustrations / 2D)
- **Upscale multiplier:** 2x or 4x. 4x is tagged `[HEAVY]`.
- **Tile size slider:** 64–256, default 128. Tooltip explains the tradeoff: smaller = slower but safer, larger = faster but VRAM-hungry.

### C. Processing State
- Monospace text log streaming actual stages: `FETCHING MODEL_WEIGHTS... [OK]`, `INITIALIZING WebGPU... [OK]`, `PROCESSING TILE 4/16...`.
- Thick blocky progress bar in the active palette's accent color.

### D. Output Zone
- Before/after canvas slider with a thick black divider and a chunky `< >` handle.
- Massive `DOWNLOAD` button — exports PNG.

## 6. Technical Architecture
- **Hosting:** GitHub Pages (static).
- **ML runtime:** [ONNX Runtime Web](https://onnxruntime.ai/) with the WebGPU execution provider, falling back to WASM. Chosen over `web-realesrgan`/NCNN-WASM ports for active maintenance and a real WebGPU EP.
- **Frontend stack:** Vite + vanilla TypeScript. Raw CSS with custom properties — no Tailwind, no framework. Bundle stays tiny.
- **Models:** Real-ESRGAN ONNX weights are **fetched live from a public source** (e.g., Hugging Face hub or a community ONNX mirror) — we do not self-host. Cached in IndexedDB after first fetch via the Cache API. This trades some cold-start fragility for a clean repo and zero hosting concerns; acceptable for MVP.
- **Tiling:** done in JS. The input is sliced into overlapping tiles (default overlap 16px), each tile is run through the model, and outputs are stitched with linear blending in overlap regions to avoid seams.

## 7. Risks & Limitations
- **Browser OOM** is the biggest threat. Mitigations: hard 1024×1024 input cap, default tile size 128, try/catch around inference with an "out of memory — try smaller tile" recovery message.
- **Mobile.** WebGPU support and memory headroom are weaker. A prominent banner appears on mobile UAs warning that the app is desktop-first.
- **Cold start.** First upscale downloads the model (~17–67MB). Progress is shown in the log. IndexedDB caching makes subsequent runs instant.
- **External model hosting fragility.** If the upstream host changes URLs or revokes access, the app breaks. Documented and accepted for MVP. Mitigation path: switch to GitHub Release-hosted assets if it becomes a problem.

## 8. Out of Scope (v1)
- Server-side fallback.
- Batch upload / multi-image queue.
- Video upscaling.
- Alpha-channel-aware processing (PNG transparency may be flattened — TBD during phase 5).
- User accounts, history, sharing.
