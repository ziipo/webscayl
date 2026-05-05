import { defineConfig } from "vite";

export default defineConfig({
  base: "/webscayl/",
  build: {
    target: "es2022",
    outDir: "dist",
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
  server: {
    headers: {
      // Required for SharedArrayBuffer (used by ORT WASM backend)
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
