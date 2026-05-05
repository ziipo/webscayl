export type AppState =
  | "IDLE"
  | "IMAGE_LOADED"
  | "CONFIGURED"
  | "FETCHING_MODEL"
  | "WARMING_UP"
  | "PROCESSING"
  | "DONE"
  | "ERROR";

export type ModelType = "general" | "anime";
export type ScaleMultiplier = 2 | 4;

export interface AppConfig {
  model: ModelType;
  scale: ScaleMultiplier;
  tileSize: number;
}

export interface ImageInfo {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  name: string;
}

export interface AppStore {
  state: AppState;
  config: AppConfig;
  image: ImageInfo | null;
  error: string | null;
  progress: number; // 0–1
  outputCanvas: HTMLCanvasElement | null;
}

export type StateListener = (store: Readonly<AppStore>) => void;
