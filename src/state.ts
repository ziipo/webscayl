import type { AppStore, AppState, StateListener } from "./types";

const store: AppStore = {
  state: "IDLE",
  config: {
    model: "general",
    scale: 4,
    tileSize: 128,
  },
  image: null,
  error: null,
  progress: 0,
  outputCanvas: null,
};

const listeners = new Set<StateListener>();

export function getStore(): Readonly<AppStore> {
  return store;
}

export function subscribe(fn: StateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  listeners.forEach((fn) => fn(store));
}

export function transition(next: AppState): void {
  store.state = next;
  store.error = null;
  if (next !== "PROCESSING" && next !== "FETCHING_MODEL") {
    store.progress = 0;
  }
  notify();
}

export function setError(msg: string): void {
  store.state = "ERROR";
  store.error = msg;
  store.progress = 0;
  notify();
}

export function setProgress(value: number): void {
  store.progress = Math.max(0, Math.min(1, value));
  notify();
}

export function setImage(image: AppStore["image"]): void {
  store.image = image;
  store.outputCanvas = null;
  notify();
}

export function setConfig(partial: Partial<AppStore["config"]>): void {
  Object.assign(store.config, partial);
  notify();
}

export function setOutputCanvas(canvas: HTMLCanvasElement): void {
  store.outputCanvas = canvas;
  notify();
}
