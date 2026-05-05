import { setImage, transition, setError } from "../state";

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function initDropzone(el: HTMLElement, fileInput: HTMLInputElement): void {
  el.addEventListener("click", () => {
    if (!el.classList.contains("has-image")) fileInput.click();
  });

  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("drag-over");
  });

  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));

  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file, el);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) handleFile(file, el);
    fileInput.value = "";
  });
}

async function handleFile(file: File, dropEl: HTMLElement): Promise<void> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    setError(`UNSUPPORTED FORMAT: ${file.type || "unknown"}. USE JPG, PNG, OR WEBP.`);
    return;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    setError("FAILED TO DECODE IMAGE. FILE MAY BE CORRUPT.");
    return;
  }

  if (bitmap.width > MAX_WIDTH || bitmap.height > MAX_HEIGHT) {
    bitmap.close();
    setError(
      `IMAGE TOO LARGE: ${bitmap.width}×${bitmap.height}px. MAX SUPPORTED INPUT IS ${MAX_WIDTH}×${MAX_HEIGHT}px.`
    );
    return;
  }

  setImage({ bitmap, width: bitmap.width, height: bitmap.height, name: file.name });
  renderThumbnail(bitmap, file.name, dropEl);
  transition("IMAGE_LOADED");
}

function renderThumbnail(bitmap: ImageBitmap, name: string, dropEl: HTMLElement): void {
  const canvas = document.createElement("canvas");
  const maxThumb = 120;
  const ratio = Math.min(maxThumb / bitmap.width, maxThumb / bitmap.height, 1);
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL();

  const meta = document.createElement("div");
  meta.className = "image-meta";
  meta.innerHTML = `
    <div class="img-name">${name}</div>
    <div>${bitmap.width} × ${bitmap.height} px</div>
    <div style="margin-top:0.5rem;font-size:0.7rem;opacity:0.6">CLICK TO CHANGE</div>
  `;
  meta.addEventListener("click", () => {
    (dropEl.querySelector("input[type=file]") as HTMLInputElement | null)?.click();
  });
  meta.style.cursor = "pointer";

  dropEl.innerHTML = "";
  dropEl.appendChild(img);
  dropEl.appendChild(meta);
  dropEl.classList.add("has-image");
}
