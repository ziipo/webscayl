let wrap: HTMLElement | null = null;
let fill: HTMLElement | null = null;

export function initProgress(wrapEl: HTMLElement, fillEl: HTMLElement): void {
  wrap = wrapEl;
  fill = fillEl;
}

export function setProgress(value: number): void {
  if (!wrap || !fill) return;
  wrap.classList.add("visible");
  fill.style.width = `${Math.round(value * 100)}%`;
}

export function hideProgress(): void {
  wrap?.classList.remove("visible");
}
