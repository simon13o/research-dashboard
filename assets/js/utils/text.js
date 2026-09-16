export function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
export function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
export function initials(name) {
  const parts = String(name || "Brand").trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] || "BR").slice(0, 2)).toUpperCase();
}
export function safeUrl(url) {
  const value = String(url || "").trim();
  return !value ? "#" : /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
