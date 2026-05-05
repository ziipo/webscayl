export interface Capabilities {
  webgpu: boolean;
  mobile: boolean;
}

export async function detectCapabilities(): Promise<Capabilities> {
  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let webgpu = false;
  if ("gpu" in navigator) {
    try {
      const adapter = await (navigator as unknown as { gpu: { requestAdapter(): Promise<unknown> } }).gpu.requestAdapter();
      webgpu = adapter !== null;
    } catch {
      webgpu = false;
    }
  }

  return { webgpu, mobile };
}
