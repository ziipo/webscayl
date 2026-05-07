import "./ui/styles.css";
import { applyRandomPalette, applyNextPalette } from "./ui/palettes";
import { initDropzone } from "./ui/dropzone";
import { initControls } from "./ui/controls";
import { initLog, clearLog } from "./ui/log";
import { initProgress, hideFetchProgress, hideProgressGrid } from "./ui/progress";
import { initCompare, populateCompare } from "./ui/compare";
import { detectCapabilities } from "./engine/capabilities";
import { runUpscale } from "./engine/upscale";
import { subscribe, getStore } from "./state";

async function main(): Promise<void> {
  // Apply random palette
  const paletteName = applyRandomPalette();
  const paletteTag = document.getElementById("palette-tag");
  if (paletteTag) {
    paletteTag.innerHTML = `PALETTE: ${paletteName} <span class="palette-refresh">↻</span>`;
    paletteTag.addEventListener("click", () => {
      const newPalette = applyNextPalette();
      paletteTag.innerHTML = `PALETTE: ${newPalette} <span class="palette-refresh">↻</span>`;
    });
  }

  // Detect capabilities & show banners
  const caps = await detectCapabilities();
  const bannersEl = document.getElementById("banners")!;
  if (!caps.webgpu) {
    const b = document.createElement("div");
    b.className = "brut-banner brut-banner--warn";
    b.textContent = "⚠ WEBGPU NOT DETECTED — RUNNING ON CPU (WASM). EXPECT SLOW PERFORMANCE.";
    bannersEl.appendChild(b);
  }
  if (caps.mobile) {
    const b = document.createElement("div");
    b.className = "brut-banner brut-banner--warn";
    b.textContent = "⚠ MOBILE DEVICE DETECTED. THIS APP IS DESIGNED FOR DESKTOP BROWSERS.";
    bannersEl.appendChild(b);
  }

  // Wire up log
  initLog(
    document.getElementById("log-section")!,
    document.getElementById("log-output")!
  );

  // Wire up progress
  initProgress(
    document.getElementById("progress-bar-wrap")!,
    document.getElementById("progress-bar-fill")!,
    document.getElementById("progress-section")!,
    document.getElementById("progress-base-canvas")! as HTMLCanvasElement,
    document.getElementById("progress-grid")!
  );

  // Wire up dropzone
  initDropzone(
    document.getElementById("dropzone")!,
    document.getElementById("file-input") as HTMLInputElement
  );

  // Wire up controls
  initControls(
    document.querySelectorAll<HTMLElement>("[data-control=model]"),
    document.querySelectorAll<HTMLElement>("[data-control=scale]"),
    document.getElementById("tile-slider") as HTMLInputElement,
    document.getElementById("tile-value")!
  );

  // Wire up compare
  const compareWrap = document.getElementById("compare-wrap")!;
  const canvasBefore = document.getElementById("canvas-before") as HTMLCanvasElement;
  const canvasAfter = document.getElementById("canvas-after") as HTMLCanvasElement;
  const compareDivider = document.getElementById("compare-divider")!;
  const compareHandle = document.getElementById("compare-handle")!;
  initCompare(compareWrap, canvasAfter, compareDivider, compareHandle);

  // Upscale button
  const upscaleBtn = document.getElementById("btn-upscale") as HTMLButtonElement;
  upscaleBtn.addEventListener("click", async () => {
    const store = getStore();
    if (!store.image) return;
    clearLog();
    hideFetchProgress();
    hideProgressGrid();
    document.getElementById("output-section")!.classList.remove("visible");
    await runUpscale(store.config);
  });

  // Download button
  const downloadBtn = document.getElementById("btn-download") as HTMLButtonElement;
  downloadBtn.addEventListener("click", () => {
    const store = getStore();
    if (!store.outputCanvas) return;
    store.outputCanvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const base = store.image?.name.replace(/\.[^.]+$/, "") ?? "upscaled";
      a.download = `${base}_${store.config.scale}x_webscayl.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  });

  // Error display
  const errorCard = document.getElementById("error-card")!;
  const errorMsg = document.getElementById("error-msg")!;

  // Subscribe to state changes
  subscribe((store) => {
    // Upscale button
    upscaleBtn.disabled =
      store.state === "FETCHING_MODEL" ||
      store.state === "WARMING_UP" ||
      store.state === "PROCESSING" ||
      store.state === "IDLE";

    upscaleBtn.textContent =
      store.state === "FETCHING_MODEL" ? "LOADING MODEL..." :
      store.state === "WARMING_UP" ? "WARMING UP..." :
      store.state === "PROCESSING" ? "PROCESSING..." :
      "UPSCALE";

    // Download button
    downloadBtn.disabled = store.state !== "DONE";
    document.getElementById("output-section")!.classList.toggle("visible", store.state === "DONE");

    // Error banner
    if (store.state === "ERROR" && store.error) {
      errorCard.style.display = "block";
      errorMsg.textContent = store.error;
    } else {
      errorCard.style.display = "none";
    }

    // Populate compare slider when done
    if (store.state === "DONE" && store.outputCanvas && store.image) {
      populateCompare(
        canvasBefore, canvasAfter,
        compareDivider, compareHandle,
        store.image.bitmap, store.outputCanvas
      );
    }
  });
}

main();
