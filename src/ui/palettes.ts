interface Palette {
  name: string;
  bg: string;
  bgAlt: string;
  fg: string;
  accent: string;
  accentFg: string; // text color on accent bg
}

const PALETTES: Palette[] = [
  {
    name: "CONSTRUCTION",
    bg: "#F5E6C8",
    bgAlt: "#EDD9A3",
    fg: "#0A0A0A",
    accent: "#FF6B00",
    accentFg: "#0A0A0A",
  },
  {
    name: "HAZARD",
    bg: "#FFFFFF",
    bgAlt: "#F0F0F0",
    fg: "#0A0A0A",
    accent: "#FFE600",
    accentFg: "#0A0A0A",
  },
  {
    name: "PUNK",
    bg: "#F5F0EB",
    bgAlt: "#E8E0D8",
    fg: "#0A0A0A",
    accent: "#FF2D78",
    accentFg: "#FFFFFF",
  },
  {
    name: "MATRIX",
    bg: "#0A0A0A",
    bgAlt: "#1A1A1A",
    fg: "#00FF41",
    accent: "#00FF41",
    accentFg: "#0A0A0A",
  },
  {
    name: "BLUEPRINT",
    bg: "#1B3A6B",
    bgAlt: "#0F2447",
    fg: "#E8F4FD",
    accent: "#00D4FF",
    accentFg: "#0A0A0A",
  },
];

let currentPaletteIndex = -1;

export function applyRandomPalette(): string {
  currentPaletteIndex = Math.floor(Math.random() * PALETTES.length);
  return applyPalette(currentPaletteIndex);
}

export function applyNextPalette(): string {
  if (currentPaletteIndex === -1) {
    return applyRandomPalette();
  }
  currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
  return applyPalette(currentPaletteIndex);
}

function applyPalette(index: number): string {
  const palette = PALETTES[index];
  const root = document.documentElement;
  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--bg-alt", palette.bgAlt);
  root.style.setProperty("--fg", palette.fg);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-fg", palette.accentFg);
  root.dataset.palette = palette.name;
  return palette.name;
}
