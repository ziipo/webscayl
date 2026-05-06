import { fetchModel } from "./modelCache";
import { createSession } from "./session";
import { runTiledInference, imageDataFromBitmap } from "./tiler";
import { transition, setProgress, setOutputCanvas, getStore, setError } from "../state";
import { logLine } from "../ui/log";
import {
  setFetchProgress,
  hideFetchProgress,
  initProgressGrid,
  setTileDone,
  hideProgressGrid,
} from "../ui/progress";
import type { AppConfig } from "../types";

export async function runUpscale(config: AppConfig): Promise<void> {
  const store = getStore();
  if (!store.image) return;

  try {
    // ── Fetch model ────────────────────────────────────────────────
    transition("FETCHING_MODEL");
    logLine(`LOADING MODEL: real-esrgan-${config.model.toUpperCase()}`);

    const modelBuffer = await fetchModel(config.model, (loaded, total) => {
      if (total > 0) {
        const pct = Math.min(1, loaded / total);
        const bars = Math.round(pct * 20);
        const bar = "█".repeat(bars) + "░".repeat(20 - bars);
        logLine(`FETCHING MODEL_WEIGHTS [${bar}] ${Math.round(pct * 100)}%`);
        setProgress(pct * 0.4); // model fetch = first 40%
        setFetchProgress(pct);
      }
    });

    logLine("MODEL_WEIGHTS", "OK");
    hideFetchProgress();

    // ── Init session ───────────────────────────────────────────────
    transition("WARMING_UP");
    logLine("INITIALIZING ONNX RUNTIME");

    const preferWebGPU = "gpu" in navigator;
    const { session, backend } = await createSession(modelBuffer, preferWebGPU);

    logLine(`BACKEND: ${backend.toUpperCase()}`, "OK");
    setProgress(0.5);

    // ── Run inference ──────────────────────────────────────────────
    transition("PROCESSING");
    logLine(`UPSCALING ${store.image.width}×${store.image.height} → ${store.image.width * config.scale}×${store.image.height * config.scale}`);

    const imageData = imageDataFromBitmap(store.image.bitmap);

    const outputData = await runTiledInference(
      imageData,
      { session, backend },
      config.tileSize,
      config.scale,
      (done, total) => {
        logLine(`PROCESSING TILE ${done}/${total}`);
        const pct = 0.5 + (done / total) * 0.5;
        setProgress(pct);
        setTileDone();
      },
      (cols, rows) => {
        initProgressGrid(store.image!.bitmap, cols, rows);
      }
    );

    logLine("INFERENCE COMPLETE", "OK");

    // ── Write to canvas ────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.width = outputData.width;
    canvas.height = outputData.height;
    canvas.getContext("2d")!.putImageData(outputData, 0, 0);

    setOutputCanvas(canvas);
    setProgress(1);
    hideProgressGrid();
    transition("DONE");
    logLine("DONE", "OK");

    session.release();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    hideFetchProgress();
    hideProgressGrid();
    const isOom =
      msg.includes("memory") ||
      msg.includes("RangeError") ||
      msg.includes("device lost") ||
      msg.includes("Out of memory");

    logLine(isOom ? "OUT OF MEMORY — TRY A SMALLER TILE SIZE" : `ERROR: ${msg}`, "ERR");
    setError(
      isOom
        ? "OUT OF MEMORY. REDUCE TILE SIZE AND TRY AGAIN."
        : `UPSCALE FAILED: ${msg}`
    );
  }
}
