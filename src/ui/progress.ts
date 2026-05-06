let fetchWrap: HTMLElement | null = null;
let fetchFill: HTMLElement | null = null;

let progressSection: HTMLElement | null = null;
let baseCanvas: HTMLCanvasElement | null = null;
let gridContainer: HTMLElement | null = null;

let shuffledIndices: number[] = [];

export function initProgress(
  fWrap: HTMLElement,
  fFill: HTMLElement,
  pSection: HTMLElement,
  bCanvas: HTMLCanvasElement,
  gContainer: HTMLElement
): void {
  fetchWrap = fWrap;
  fetchFill = fFill;
  progressSection = pSection;
  baseCanvas = bCanvas;
  gridContainer = gContainer;
}

/** ── Model Fetch Progress ─────────────────────────────────────────── */

export function setFetchProgress(value: number): void {
  if (!fetchWrap || !fetchFill) return;
  fetchWrap.classList.add("visible");
  fetchFill.style.width = `${Math.round(value * 100)}%`;
}

export function hideFetchProgress(): void {
  fetchWrap?.classList.remove("visible");
}

/** ── Tiled Inference Progress ─────────────────────────────────────── */

export function initProgressGrid(
  bitmap: ImageBitmap,
  cols: number,
  rows: number
): void {
  if (!progressSection || !baseCanvas || !gridContainer) return;

  // 1. Setup canvas
  baseCanvas.width = bitmap.width;
  baseCanvas.height = bitmap.height;
  const ctx = baseCanvas.getContext("2d");
  ctx?.drawImage(bitmap, 0, 0);

  // 2. Setup grid
  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const total = cols * rows;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "progress-blur-cell";
    gridContainer.appendChild(cell);
  }

  // 3. Generate randomized reveal order
  shuffledIndices = Array.from({ length: total }, (_, i) => i);
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }

  // 4. Show section
  progressSection.classList.add("visible");
}

export function setTileDone(): void {
  if (!gridContainer || shuffledIndices.length === 0) return;
  const index = shuffledIndices.pop()!;
  const cells = gridContainer.querySelectorAll(".progress-blur-cell");
  if (cells[index]) {
    cells[index].classList.add("done");
  }
}

export function hideProgressGrid(): void {
  progressSection?.classList.remove("visible");
}
