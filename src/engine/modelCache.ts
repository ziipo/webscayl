import type { ModelType } from "../types";

// Publicly available Real-ESRGAN ONNX models via Hugging Face
// These are the official xinntao/Real-ESRGAN models exported to ONNX format
const MODEL_URLS: Record<ModelType, string> = {
  general:
    "https://huggingface.co/Meeperomi/RealESRGAN_x4-onnx/resolve/main/RealESRGAN_x4.onnx",
  anime:
    "https://huggingface.co/deepghs/imgutils-models/resolve/main/real_esrgan/RealESRGAN_x4plus_anime_6B.onnx",
};

const DB_NAME = "webscayl-models";
const DB_VERSION = 1;
const STORE_NAME = "models";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromDB(db: IDBDatabase, key: string): Promise<ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToDB(db: IDBDatabase, key: string, data: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(data, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function fetchModel(
  modelType: ModelType,
  onProgress: (loaded: number, total: number) => void
): Promise<ArrayBuffer> {
  const url = MODEL_URLS[modelType];
  const db = await openDB();

  const cached = await getFromDB(db, url);
  if (cached) {
    onProgress(1, 1);
    return cached;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching model from ${url}`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    if (contentLength > 0) onProgress(loaded, contentLength);
  }

  const buffer = new Uint8Array(chunks.reduce((acc, c) => acc + c.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const arrayBuffer = buffer.buffer;
  try {
    await saveToDB(db, url, arrayBuffer);
  } catch {
    // Cache failure is non-fatal
  }

  return arrayBuffer;
}
