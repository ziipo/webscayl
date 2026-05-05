import * as ort from "onnxruntime-web";
import type { OrtSession } from "./session";

export async function runTiledInference(
  imageData: ImageData,
  session: OrtSession,
  tileSize: number,
  scale: number,
  onTile: (done: number, total: number) => void,
  onGridInit?: (cols: number, rows: number) => void
): Promise<ImageData> {
  const { width, height, data: pixels } = imageData;
  const overlap = 16;
  const step = tileSize - overlap * 2;

  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const total = cols * rows;
  let done = 0;

  if (onGridInit) onGridInit(cols, rows);

  const outW = width * scale;
  const outH = height * scale;
  // Weight accumulator for blending
  const outR = new Float32Array(outW * outH);
  const outG = new Float32Array(outW * outH);
  const outB = new Float32Array(outW * outH);
  const outWeights = new Float32Array(outW * outH);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const srcX = Math.max(0, col * step - overlap);
      const srcY = Math.max(0, row * step - overlap);
      const srcX2 = Math.min(width, srcX + tileSize);
      const srcY2 = Math.min(height, srcY + tileSize);
      const tW = srcX2 - srcX;
      const tH = srcY2 - srcY;

      // Extract tile pixels and normalize to [0,1] Float32 NCHW
      const tileF = new Float32Array(3 * tW * tH);
      for (let y = 0; y < tH; y++) {
        for (let x = 0; x < tW; x++) {
          const si = ((srcY + y) * width + (srcX + x)) * 4;
          const ti = y * tW + x;
          tileF[ti] = pixels[si] / 255;
          tileF[tW * tH + ti] = pixels[si + 1] / 255;
          tileF[2 * tW * tH + ti] = pixels[si + 2] / 255;
        }
      }

      const inputTensor = new ort.Tensor("float32", tileF, [1, 3, tH, tW]);
      const feeds: Record<string, ort.Tensor> = {};
      const inputName = session.session.inputNames[0];
      feeds[inputName] = inputTensor;

      const results = await session.session.run(feeds);
      const outputName = session.session.outputNames[0];
      const outTensor = results[outputName];
      const outData = outTensor.data as Float32Array;

      const oTW = tW * scale;
      const oTH = tH * scale;
      const oSrcX = srcX * scale;
      const oSrcY = srcY * scale;

      // Compute blend weight map for this tile (feather at edges)
      const weightMap = computeWeightMap(oTW, oTH, overlap * scale);

      // Accumulate into output buffers
      for (let y = 0; y < oTH; y++) {
        for (let x = 0; x < oTW; x++) {
          const oi = (oSrcY + y) * outW + (oSrcX + x);
          const ti = y * oTW + x;
          const w = weightMap[ti];
          outR[oi] += outData[ti] * w;
          outG[oi] += outData[oTW * oTH + ti] * w;
          outB[oi] += outData[2 * oTW * oTH + ti] * w;
          outWeights[oi] += w;
        }
      }

      done++;
      onTile(done, total);
    }
  }

  // Normalize and write to output ImageData
  const result = new ImageData(outW, outH);
  for (let i = 0; i < outW * outH; i++) {
    const w = outWeights[i] || 1;
    result.data[i * 4] = Math.round(Math.min(255, Math.max(0, (outR[i] / w) * 255)));
    result.data[i * 4 + 1] = Math.round(Math.min(255, Math.max(0, (outG[i] / w) * 255)));
    result.data[i * 4 + 2] = Math.round(Math.min(255, Math.max(0, (outB[i] / w) * 255)));
    result.data[i * 4 + 3] = 255;
  }

  return result;
}

function computeWeightMap(w: number, h: number, feather: number): Float32Array {
  const map = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const wx = x < feather ? x / feather : x >= w - feather ? (w - 1 - x) / feather : 1;
      const wy = y < feather ? y / feather : y >= h - feather ? (h - 1 - y) / feather : 1;
      map[y * w + x] = Math.min(wx, wy);
    }
  }
  return map;
}

export function imageDataFromBitmap(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}
