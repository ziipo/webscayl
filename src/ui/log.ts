let el: HTMLElement | null = null;
let section: HTMLElement | null = null;

export function initLog(sectionEl: HTMLElement, outputEl: HTMLElement): void {
  section = sectionEl;
  el = outputEl;
}

export function logLine(msg: string, status?: "OK" | "ERR" | "..."): void {
  if (!el || !section) return;
  section.classList.add("visible");
  const line = document.createElement("div");
  const tag = status ? ` [${status}]` : "";
  line.textContent = `> ${msg}${tag}`;
  if (status === "ERR") line.style.color = "#ff4444";
  if (status === "OK") line.style.opacity = "0.7";
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

export function clearLog(): void {
  if (el) el.innerHTML = "";
  section?.classList.remove("visible");
}
