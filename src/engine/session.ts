import * as ort from "onnxruntime-web";

export type Backend = "webgpu" | "wasm";

export interface OrtSession {
  session: ort.InferenceSession;
  backend: Backend;
}

export async function createSession(
  modelBuffer: ArrayBuffer,
  preferWebGPU: boolean
): Promise<OrtSession> {
  if (preferWebGPU) {
    try {
      const session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["webgpu"],
      });
      return { session, backend: "webgpu" };
    } catch {
      // Fall through to WASM
    }
  }

  const session = await ort.InferenceSession.create(modelBuffer, {
    executionProviders: ["wasm"],
  });
  return { session, backend: "wasm" };
}
