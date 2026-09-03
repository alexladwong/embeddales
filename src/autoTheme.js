// Realistic auto-theming: reads the host page's actual styles (brand color,
// surface, text, radius, font) and turns them into the widget's default UI.
// Pure helpers are exported separately so they can be unit-tested in Node.

const IGNORED_COLORS = new Set([
  "",
  "transparent",
  "rgba(0, 0, 0, 0)",
  "rgba(0,0,0,0)",
  "none",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
]);

const BRAND_VARIABLES = [
  "--primary",
  "--color-primary",
  "--primary-color",
  "--theme-primary",
  "--brand",
  "--brand-color",
  "--color-brand",
  "--accent",
  "--accent-color",
  "--color-accent",
];

const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(value)));

const parseChannel = (value) => {
  const trimmed = String(value).trim();
  if (trimmed.endsWith("%")) return (parseFloat(trimmed) / 100) * 255;
  return parseFloat(trimmed);
};

const parseAlpha = (value) => {
  if (value === undefined || value === null) return 1;
  const trimmed = String(value).trim();
  if (!trimmed) return 1;
  const alpha = trimmed.endsWith("%") ? parseFloat(trimmed) / 100 : parseFloat(trimmed);
  return Number.isFinite(alpha) ? Math.min(1, Math.max(0, alpha)) : 1;
};
// --- color parsing -----------------------------------------------------------

const hexToRgb = (hex) => {
  let value = hex.replace("#", "").trim();
  if ([3, 4].includes(value.length)) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (![6, 8].includes(value.length)) return null;
  const parsed = parseInt(value.slice(0, 6), 16);
  if (Number.isNaN(parsed)) return null;
  const alpha = value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1;
  return [
    clamp255(alpha * ((parsed >> 16) & 255) + (1 - alpha) * 255),
    clamp255(alpha * ((parsed >> 8) & 255) + (1 - alpha) * 255),
    clamp255(alpha * (parsed & 255) + (1 - alpha) * 255),
  ];
};

const hueToRgb = (p, q, t) => {
  let hue = t;
  if (hue < 0) hue += 1;
  if (hue > 1) hue -= 1;
  if (hue < 1 / 6) return p + (q - p) * 6 * hue;
  if (hue < 1 / 2) return q;
  if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6;
  return p;
};

const hslToRgb = (h, s, l) => {
  const hue = (((h % 360) + 360) % 360) / 360;
  const saturation = Math.min(1, Math.max(0, s));
  const lightness = Math.min(1, Math.max(0, l));
  if (saturation === 0) {
    const gray = clamp255(lightness * 255);
    return [gray, gray, gray];
  }
  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [
    clamp255(hueToRgb(p, q, hue + 1 / 3) * 255),
    clamp255(hueToRgb(p, q, hue) * 255),
    clamp255(hueToRgb(p, q, hue - 1 / 3) * 255),
  ];
};
const cssToRgb = (value) => {
  const color = String(value ?? "").trim();
  if (!color || IGNORED_COLORS.has(color.toLowerCase())) return null;

  if (color.startsWith("#")) return hexToRgb(color);

  const match = color.match(
    /^(?:rgba?|hsla?)\(\s*([\d.]+(?:deg)?%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (!match) return null;

  const alpha = parseAlpha(match[4]);

  if (/^hsla?/i.test(color)) {
    const hue = parseFloat(match[1].replace(/deg/i, ""));
    const saturation = parseFloat(match[2]) / 100;
    const lightness = parseFloat(match[3]) / 100;
    if ([hue, saturation, lightness].some((channel) => !Number.isFinite(channel))) return null;
    const hsl = hslToRgb(hue, saturation, lightness);
    return hsl.map((channel) => clamp255(alpha * channel + (1 - alpha) * 255));
  }

  const rgb = [parseChannel(match[1]), parseChannel(match[2]), parseChannel(match[3])];
  if (rgb.some((channel) => !Number.isFinite(channel))) return null;
  return rgb.map((channel) => clamp255(alpha * channel + (1 - alpha) * 255));
};

const toLinearChannel = (channel) => {
  const scaled = channel / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

const luminanceOfRgb = (rgb) => {
  if (!rgb) return 1;
  return 0.2126 * toLinearChannel(rgb[0]) + 0.7152 * toLinearChannel(rgb[1]) + 0.0722 * toLinearChannel(rgb[2]);
};

const contrastOf = (firstRgb, secondRgb) => {
  const a = luminanceOfRgb(firstRgb);
  const b = luminanceOfRgb(secondRgb);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
};

const chromaOf = (rgb) => {
  if (!rgb) return 0;
  return (Math.max(...rgb) - Math.min(...rgb)) / 255;
};

const rgbToHex = (rgb) => {
  if (!rgb) return null;
  return "#" + rgb.map((channel) => clamp255(channel).toString(16).padStart(2, "0")).join("");
};
// --- readable helpers ----------------------------------------------------------

const isUsable = (value) => {
  const trimmed = String(value ?? "").trim().toLowerCase();
  return Boolean(trimmed && !IGNORED_COLORS.has(trimmed));
};

const averageRgb = (colors) => {
  if (!colors.length) return null;
  const sum = colors.reduce(
    (acc, rgb) => [acc[0] + rgb[0], acc[1] + rgb[1], acc[2] + rgb[2]],
    [0, 0, 0]
  );
  return sum.map((channel) => clamp255(channel / colors.length));
};

// Picks the black/white text color that reads best on top of the accent color.
const computeAccentContrast = (color) => {
  const rgb = typeof color === "string" ? cssToRgb(color) : color;
  if (!rgb) return "#ffffff";
  const white = [255, 255, 255];
  const nearBlack = [17, 24, 39];
  return contrastOf(white, rgb) >= contrastOf(nearBlack, rgb) ? "#ffffff" : "#111827";
};

// --- page sampling -----------------------------------------------------------

const getStyle = (element) => {
  if (!element || typeof window === "undefined") return null;
  return window.getComputedStyle(element);
};

// A representative background color of the host page: solid background-color
// wins; otherwise the average of the gradient stops is used.
const sampleSurface = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  for (const element of [document.body, document.documentElement]) {
    const styles = getStyle(element);
    if (!styles) continue;

    const solid = cssToRgb(styles.getPropertyValue("background-color"));
    if (solid) return solid;

    const image = styles.getPropertyValue("background-image").trim();
    if (image && image !== "none") {
      const stops = image.match(/(?:rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3,8})/gi) || [];
      const colors = stops
        .map(cssToRgb)
        .filter(Boolean)
        .slice(0, 8);
      const average = averageRgb(colors);
      if (average) return average;
    }
  }

  return null;
};

const sampleTextColor = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  for (const element of [document.body, document.documentElement]) {
    const styles = getStyle(element);
    if (!styles) continue;
    const color = cssToRgb(styles.getPropertyValue("color"));
    if (color) return color;
  }
  return null;
};

const sampleFontFamily = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  for (const element of [document.body, document.documentElement]) {
    const styles = getStyle(element);
    if (!styles) continue;
    const family = styles.getPropertyValue("font-family").trim();
    if (isUsable(family)) return family;
  }
  return null;
};
const sampleRadius = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  const candidates = Array.from(
    document.querySelectorAll(
      "button, input, textarea, a, [role='button'], .card, [class*='card' i], [class*='btn' i]"
    )
  );
  for (const element of candidates) {
    const styles = getStyle(element);
    if (!styles) continue;
    const raw = parseFloat(styles.getPropertyValue("border-radius"));
    if (Number.isFinite(raw) && raw >= 6 && raw <= 28) return Math.round(raw) + "px";
  }
  return null;
};

const sampleMutedColor = (textColor) => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  const styles = getStyle(document.documentElement);
  const variable = styles && styles.getPropertyValue("--muted-color").trim();
  if (isUsable(variable) && cssToRgb(variable)) return variable.trim();
  return textColor ? "color-mix(in srgb, " + textColor + " 62%, transparent)" : null;
};

const isVisibleAgainst = (rgb, surfaceRgb, surfaceLuminance) => {
  if (!rgb) return false;
  const lum = luminanceOfRgb(rgb);
  // Ghost buttons / tinted chips that visually vanish into the page are not brand colors.
  if (Math.abs(lum - surfaceLuminance) < 0.06 && chromaOf(rgb) < 0.1) return false;
  // Near-white neutrals are never a usable accent on light pages.
  if (lum > 0.9 && chromaOf(rgb) < 0.06) return false;
  return contrastOf(rgb, surfaceRgb) >= 1.5;
};

// Collects believable brand colors: CSS brand variables first, then real
// buttons / CTAs / links whose fill or text actually stands out on the page.
const sampleAccent = (surfaceRgb, surfaceLuminance) => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const candidates = [];

  for (const element of [document.documentElement, document.body]) {
    const styles = getStyle(element);
    if (!styles) continue;
    for (const name of BRAND_VARIABLES) {
      const value = styles.getPropertyValue(name).trim();
      if (!isUsable(value)) continue;
      const rgb = cssToRgb(value);
      if (rgb) candidates.push({ rgb, kind: "variable" });
    }
  }

  const elements = Array.from(
    document.querySelectorAll(
      "button, a, [role='button'], input[type='submit'], input[type='button'], [class*='btn' i], [class*='cta' i]"
    )
  ).slice(0, 250);

  for (const element of elements) {
    const styles = getStyle(element);
    if (!styles) continue;
    const tagName = element.tagName.toLowerCase();
    const background = cssToRgb(styles.getPropertyValue("background-color"));
    if (background) {
      candidates.push({
        rgb: background,
        kind:
          element.type === "submit" || element.type === "button" || tagName === "button"
            ? "button"
            : "background",
      });
      continue;
    }
    if (tagName === "a" || element.hasAttribute("role")) {
      const color = cssToRgb(styles.getPropertyValue("color"));
      if (color) candidates.push({ rgb: color, kind: "link" });
    }
  }

  const scored = candidates
    .filter((candidate) => isVisibleAgainst(candidate.rgb, surfaceRgb, surfaceLuminance))
    .map((candidate) => {
      const multipliers = { variable: 1.7, button: 1.9, background: 1.2, link: 1.0 };
      const kindBoost = multipliers[candidate.kind] || 1;
      const chromaBoost = chromaOf(candidate.rgb) >= 0.08 ? 1.4 : 1;
      return {
        ...candidate,
        score: contrastOf(candidate.rgb, surfaceRgb) * kindBoost * chromaBoost,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.length ? scored[0].rgb : null;
};
// --- public API ---------------------------------------------------------------

// Returns a realistic page theme (accentColor, accentContrast, surfaceColor,
// textColor, mutedColor, radius, fontFamily as CSS-ready strings) or null
// when the page gives no usable signal.
const getAutoPageTheme = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const surfaceRgb = sampleSurface();
  if (!surfaceRgb) return null;

  const surfaceLuminance = luminanceOfRgb(surfaceRgb);
  const surfaceColor = rgbToHex(surfaceRgb);

  const textRgb = sampleTextColor();
  const textColor = textRgb ? rgbToHex(textRgb) : surfaceLuminance < 0.45 ? "#f3f4f6" : "#111827";

  const accentRgb = sampleAccent(surfaceRgb, surfaceLuminance);
  const accentColor = accentRgb ? rgbToHex(accentRgb) : null;
  const accentContrast = accentRgb ? computeAccentContrast(accentRgb) : null;

  const fontFamily = sampleFontFamily();
  const radius = sampleRadius();
  const mutedColor = sampleMutedColor(textColor);

  return {
    accentColor,
    accentContrast,
    surfaceColor,
    textColor,
    mutedColor,
    radius,
    fontFamily,
  };
};

export { cssToRgb, computeAccentContrast, contrastOf, luminanceOfRgb, rgbToHex, getAutoPageTheme };
