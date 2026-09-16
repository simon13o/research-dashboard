export function renderYAxis(svg, margin, width, height, maxValue) {
  const decimals = maxValue <= 20 ? 1 : 0;
  for(let index = 0; index <= 4; index++) {
    const y = margin.t + height - (height * index / 4);
    const raw = maxValue * index / 4;
    const value = decimals ? Number(raw.toFixed(1)) : Math.round(raw);
    svg.insertAdjacentHTML("beforeend", `<line x1="${margin.l}" y1="${y}" x2="${margin.l + width}" y2="${y}" stroke="#f0f0f0"/><text x="${margin.l - 8}" y="${y + 4}" font-size="10.5" text-anchor="end" fill="#7b8794">${value}</text>`);
  }
}
export function niceAxisMax(maxValue) {
  const value = Number(maxValue) || 0;
  if(value <= 0) return 1;
  const padded = value * 1.15, base = Math.pow(10, Math.floor(Math.log10(padded))), normalized = padded / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * base;
}
export function smoothPath(points) {
  if(points.length < 2) return points.length ? `M${points[0].x},${points[0].y}` : "";
  return points.slice(1).reduce((path, point, index) => `${path} Q${(points[index].x + point.x) / 2},${points[index].y} ${point.x},${point.y}`, `M${points[0].x},${points[0].y}`);
}
export function greenByRank(rank, total) {
  const ramp = ["#0f5132", "#146c43", "#198754", "#2aa66f", "#44c18b", "#7ddcb8", "#b8efdc"];
  return ramp[total <= 1 ? 0 : Math.min(ramp.length - 1, Math.round(rank / (total - 1) * (ramp.length - 1)))];
}
export function truncateLabel(text, maxChars) {
  const value = String(text || "");
  return value.length > maxChars ? `${value.slice(0, Math.max(0, maxChars - 3))}...` : value;
}
export function shouldShowMonthLabel(index, total) {
  return total <= 6 || index === 0 || index === total - 1 || (total <= 12 ? index % 2 === 0 : total <= 24 ? index % 3 === 0 : index % 6 === 0);
}
