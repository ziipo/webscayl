# webscayl — TODO

Source-of-truth task list. Statuses: `[ ]` pending, `[~]` in progress, `[x]` done, `[-]` dropped.

Update `PROGRESS.md` whenever a phase flips state.

## Phase 1 — Skeleton & design system
- [x] Init Vite + TS project, commit baseline
- [x] Configure `vite.config.ts` for GitHub Pages base path
- [x] Add `.github/workflows/deploy.yml` (GH Pages on push to main)
- [x] Define ≥3 palettes in `src/ui/palettes.ts` and apply randomly on load (5 palettes: CONSTRUCTION, HAZARD, PUNK, MATRIX, BLUEPRINT)
- [x] Build brutalist component primitives (button, card, toggle, slider) in `styles.css`
- [x] Lay out static shell (header / dropzone / engine room / output)

## Phase 2 — Input zone
- [x] Drag-and-drop + click-to-pick
- [x] Decode via `createImageBitmap`; validate MIME type
- [x] Enforce 1024×1024 hard cap with brutalist error card
- [x] Render thumbnail + dimensions in mono

## Phase 3 — Engine room (UI only)
- [x] Model selector (general / anime) as toggle blocks
- [x] Multiplier control (2x / 4x with `[HEAVY]` tag)
- [x] Tile size slider (64–256, step 32, default 128) with tooltip
- [x] Capability banners: WebGPU absent → warning; mobile UA → desktop-recommended

## Phase 4 — Model fetching & caching
- [x] Identify upstream URLs (Hugging Face: Xenova/realesrgan-x4plus, Xenova/realesrgan-x4plus-anime)
- [x] Implement IndexedDB-backed `modelCache.ts` with streaming progress
- [x] Stream fetch progress into the log

## Phase 5 — Inference pipeline
- [x] ORT session bootstrap with WebGPU → WASM fallback
- [x] Implement `tiler.ts` (split with overlap=16, NCHW normalize)
- [x] Per-tile inference loop
- [x] Stitch with linear blending in overlap regions
- [x] Stream tile progress to log + progress bar
- [x] PNG alpha: flatten to white (v1 scope documented)

## Phase 6 — Output zone
- [x] Before/after canvas slider with `< >` handle
- [x] Download button → PNG blob save

## Phase 7 — Polish & resilience
- [ ] Try/catch around inference; OOM → suggest smaller tile size
- [ ] Lighthouse pass on production build
- [ ] Verify GH Pages deploy with live model fetch
- [ ] README with screenshots + known-limits section

## Backlog (not v1)
- [ ] Manual backend override (WebGPU vs WASM) in UI
- [ ] Batch / multi-image queue
- [ ] Alpha-aware processing
- [ ] Self-hosted model fallback (GitHub Releases) if upstream becomes unreliable
