export function initCompare(
  wrap: HTMLElement,
  canvasAfter: HTMLCanvasElement,
  divider: HTMLElement,
  handle: HTMLElement
): void {
  let dragging = false;

  function setPos(x: number): void {
    const rect = wrap.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
    divider.style.left = `${pct}%`;
    handle.style.left = `${pct}%`;
    canvasAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
  }

  wrap.addEventListener("mousedown", (e) => { dragging = true; setPos(e.clientX); });
  window.addEventListener("mousemove", (e) => { if (dragging) setPos(e.clientX); });
  window.addEventListener("mouseup", () => { dragging = false; });

  wrap.addEventListener("touchstart", (e) => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener("touchmove", (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener("touchend", () => { dragging = false; });

  // Initialize divider at 50%
  setPos(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width / 2);
}

export function populateCompare(
  canvasBefore: HTMLCanvasElement,
  canvasAfter: HTMLCanvasElement,
  divider: HTMLElement,
  handle: HTMLElement,
  sourceBitmap: ImageBitmap,
  outputCanvas: HTMLCanvasElement
): void {
  // Draw before
  canvasBefore.width = outputCanvas.width;
  canvasBefore.height = outputCanvas.height;
  const ctxB = canvasBefore.getContext("2d")!;
  ctxB.drawImage(sourceBitmap, 0, 0, outputCanvas.width, outputCanvas.height);

  // Copy after
  canvasAfter.width = outputCanvas.width;
  canvasAfter.height = outputCanvas.height;
  const ctxA = canvasAfter.getContext("2d")!;
  ctxA.drawImage(outputCanvas, 0, 0);

  // Re-init divider at 50%
  divider.style.left = "50%";
  handle.style.left = "50%";
  canvasAfter.style.clipPath = "inset(0 0 0 50%)";
}
