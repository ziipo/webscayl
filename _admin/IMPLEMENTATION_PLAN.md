# webscayl — Implementation Plan

Companion to `PRD.md`. Describes _how_ we build it.

## Stack decisions
- **Vite + TypeScript + vanilla DOM.** No framework. State is a small finite state machine.
- **ONNX Runtime Web** (`onnxruntime-web`) with WebGPU EP, WASM fallback.
- **Raw CSS** with CSS custom properties for theming. Palette swap = changing variables on `:root`.
- **Models fetched at runtime from a public source** (Hugging Face / community ONNX mirror). Cached in IndexedDB after first fetch. The exact URLs will be locked in during phase 4 after verifying availability + license; candidates: `xinntao/Real-ESRGAN` re-exports on Hugging Face.

## Repository layout
```
webscayl/
├── _admin/                      # PRD, plan, todos, progress (this folder)
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── public/
│   └── fonts/                   # self-hosted brutalist + mono fonts
├── src/
│   ├── main.ts                  # bootstrap; wires UI → engine
│   ├── state.ts                 # FSM + event bus
│   ├── ui/
│   │   ├── styles.css
│   │   ├── palettes.ts          # palette registry + random picker
│   │   ├── dropzone.ts
│   │   ├── controls.ts
│   │   ├── log.ts
│   │   ├── progress.ts
│   │   └── compare.ts
│   ├── engine/
│   │   ├── capabilities.ts      # WebGPU + mobile detection
│   │   ├── modelCache.ts        # IndexedDB-backed fetch+cache
│   │   ├── session.ts           # ORT session creation
│   │   ├── tiler.ts             # split + stitch with overlap blending
│   │   └── upscale.ts           # orchestrator
│   └── types.ts
└── .github/workflows/deploy.yml
```

## State machine
`IDLE → IMAGE_LOADED → CONFIGURED → FETCHING_MODEL → WARMING_UP → PROCESSING → DONE`

`ERROR` is reachable from any non-terminal state. The log component subscribes to transitions and emits `[OK]` / `[ERR]` lines in monospace.

## Build phases

### Phase 1 — Skeleton & design system
- Vite + TS scaffold. `npm create vite@latest`.
- GitHub Pages deploy workflow on push to `main`.
- CSS variables for palette tokens. Palette registry with ≥3 entries. Random selection on load (seeded from `Date.now()` or `crypto.getRandomValues`).
- Brutalist primitives: `.brut-button`, `.brut-card`, `.brut-toggle`, `.brut-slider`. Verify the click-translate shadow effect works.
- Static layout shell: header / dropzone / engine room / output zone.

### Phase 2 — Input zone
- Drag-and-drop + click-to-pick.
- Decode via `createImageBitmap`. Reject unsupported MIME types.
- Reject >1024×1024 with a brutalist error card.
- Show thumbnail + dimensions in mono font.

### Phase 3 — Engine room (UI only)
- Model selector, multiplier (with `[HEAVY]` tag on 4x), tile slider (64–256, default 128, stepped at 32).
- Capability banners: WebGPU absent → warning. Mobile UA → desktop-recommended banner.

### Phase 4 — Model fetching & caching
- Lock in upstream model URLs. Verify availability + BSD-3 license compatibility.
- `modelCache.ts`: check IndexedDB → on miss, `fetch` with streaming progress → store as Blob → return ArrayBuffer.
- Stream progress to log: `FETCHING MODEL_WEIGHTS [████░░░░] 47%`.

### Phase 5 — Inference pipeline
- ORT session: try WebGPU EP first, fall back to WASM. Log the chosen backend.
- Tiler: slice input into tiles of size T with overlap O=16. Normalize to `[0,1]` Float32 NCHW.
- Per-tile inference. Stitch into output canvas of size `(W·scale)×(H·scale)`. Linear blend overlap regions.
- Stream tile completion events to log + progress bar.
- Resolve PNG alpha channel handling (likely: flatten to white background for v1; document).

### Phase 6 — Output zone
- Two stacked canvases + draggable divider with `< >` handle. No library.
- Download button → `canvas.toBlob('image/png')` → trigger save.

### Phase 7 — Polish & resilience
- Wrap inference in try/catch. On `RangeError` / WebGPU device-lost → brutalist error suggesting smaller tile size.
- Lighthouse pass on the static build.
- Verify GH Pages deploy with model fetching from upstream.
- README with screenshots, known limits, and the "external model host" caveat.

## Open questions resolved
- **Model hosting:** fetch live from public source; do not self-host. (User decision.)
- **Models in v1:** ship both general + anime. (User decision.)
- **Color palettes:** ≥3, random per page load. (User decision.)

## Open questions remaining
- Exact upstream URLs for the two ONNX models — resolve in phase 4.
- PNG alpha channel: flatten or preserve? Decide in phase 5.
- Whether to expose backend choice (WebGPU vs WASM) as a manual override in the UI, or auto-detect only. Default: auto-only for MVP.
