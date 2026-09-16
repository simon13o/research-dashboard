export function createColorTools({ getBrandColors }) {
  function hexToRgb(hex) {
    const match = String(hex || "").trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return match ? { r:parseInt(match[1], 16), g:parseInt(match[2], 16), b:parseInt(match[3], 16) } : { r:29, g:78, b:216 };
  }
  function rgbToHex(red, green, blue) {
    const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
    return `#${[clamp(red), clamp(green), clamp(blue)].map(value => value.toString(16).padStart(2, "0")).join("")}`;
  }
  function mixColor(hex, targetHex, ratio) {
    const source = hexToRgb(hex), target = hexToRgb(targetHex);
    const amount = Math.max(0, Math.min(1, ratio));
    return rgbToHex(source.r + (target.r - source.r) * amount, source.g + (target.g - source.g) * amount, source.b + (target.b - source.b) * amount);
  }
  function shadeColor(hex, delta) {
    return delta >= 0 ? mixColor(hex, "#ffffff", Math.min(delta, .65)) : mixColor(hex, "#000000", Math.min(Math.abs(delta), .45));
  }
  function colorForBrand(brand) {
    const colors = getBrandColors();
    if(!colors[brand]) {
      const palette = ["#1d4ed8", "#f97316", "#06b6d4", "#16a34a", "#349ce4", "#0f766e", "#eab308", "#64748b", "#ec4899"];
      const key = String(brand || "").toLowerCase().replace(/\s+/g, "");
      colors[brand] = key === "babybrezza" ? "#ef4444" : palette[Math.abs([...String(brand || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palette.length];
    }
    return colors[brand];
  }
  function colorForProduct(brand, product) {
    const base = colorForBrand(brand).toLowerCase();
    const toneMap = { "#1d4ed8":["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"], "#ef4444":["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#b91c1c"], "#f97316":["#ea580c", "#f97316", "#fb923c", "#fdba74", "#c2410c"], "#06b6d4":["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#0e7490"], "#16a34a":["#15803d", "#16a34a", "#22c55e", "#4ade80", "#166534"], "#349ce4":["#1c4c74", "#349ce4", "#67b7ee", "#bfdbfe", "#0f3d5f"], "#0f766e":["#0f766e", "#14b8a6", "#2dd4bf", "#5eead4", "#115e59"], "#eab308":["#ca8a04", "#eab308", "#facc15", "#fde047", "#a16207"], "#64748b":["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#334155"], "#ec4899":["#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#be185d"] };
    const tones = toneMap[base] || [shadeColor(base, -.22), base, shadeColor(base, .18), shadeColor(base, .34), shadeColor(base, -.36)];
    return tones[Math.abs([...String(product || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % tones.length];
  }
  return { colorForBrand, colorForProduct, productSeriesColor:colorForProduct };
}
