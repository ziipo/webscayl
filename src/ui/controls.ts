import { setConfig, getStore } from "../state";
import type { ModelType, ScaleMultiplier } from "../types";

export function initControls(
  modelToggles: NodeListOf<HTMLElement>,
  scaleToggles: NodeListOf<HTMLElement>,
  tileSlider: HTMLInputElement,
  tileValue: HTMLElement
): void {
  modelToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      modelToggles.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setConfig({ model: btn.dataset.value as ModelType });
    });
  });

  scaleToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      scaleToggles.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setConfig({ scale: Number(btn.dataset.value) as ScaleMultiplier });
    });
  });

  tileSlider.addEventListener("input", () => {
    const val = Number(tileSlider.value);
    tileValue.textContent = String(val);
    setConfig({ tileSize: val });
  });

  // Reflect initial store state
  const { config } = getStore();
  modelToggles.forEach((b) => {
    if (b.dataset.value === config.model) b.classList.add("active");
  });
  scaleToggles.forEach((b) => {
    if (b.dataset.value === String(config.scale)) b.classList.add("active");
  });
  tileSlider.value = String(config.tileSize);
  tileValue.textContent = String(config.tileSize);
}
