export const unique = values => [...new Set(values)];

export const toNumber = value => Number(String(value ?? "").replace(/[$,]/g, "").trim());

export function hashColor(key, palette) {
  const seed = Math.abs([...String(key || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return palette[seed % palette.length];
}

export const productKey = row => `${row.brand}||${row.product}`;

export function inferProductGroup(product) {
  const original = String(product || "").trim();
  if(!original) return "";
  const colorWords = "(white|black|charcoal|gray|grey|pink|blue|green|red|silver|gold|beige|brown|cream|navy|orange|yellow|purple|teal|mint|clear|natural)";
  const group = original
    .replace(new RegExp(`\\s*\\(${colorWords}\\)\\s*$`, "i"), "")
    .replace(new RegExp(`[\\s_/-]+${colorWords}\\s*$`, "i"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/[-_/]\s*$/, "")
    .trim();
  return group || original;
}

export function productGroupName(row) {
  return String(row?.productGroup ?? row?.product_group ?? row?.productGroupName ?? "").trim() || inferProductGroup(row?.product);
}

export const productGroupKey = row => `${row.brand}||${productGroupName(row)}`;

export function normalizeTime(value) {
  const text = String(value || "").trim();
  const match = text.match(/(\d{4})[\/-](\d{1,2})(?:[\/-](\d{1,2}))?/);
  if(match) {
    const month = String(match[2]).padStart(2, "0");
    return match[3] ? `${match[1]}-${month}-${String(match[3]).padStart(2, "0")}` : `${match[1]}-${month}`;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthKey(value) {
  const match = String(normalizeTime(value)).match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : "";
}

export function monthNumber(value) {
  const month = monthKey(value);
  return month ? Number(month.replace("-", "")) : NaN;
}

export function shiftMonth(month, delta) {
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), (monthNumber || 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthEndGraceComparisonMonths(rows, graceDays = 2) {
  const rowMonths = unique((rows || []).map(row => monthKey(row.time)).filter(Boolean)).sort();
  const now = new Date();
  const currentCalendarMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysUntilMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const usesCurrentPartialMonth = rowMonths.includes(currentCalendarMonth) && daysUntilMonthEnd <= graceDays;
  const currentMonth = usesCurrentPartialMonth ? currentCalendarMonth : shiftMonth(currentCalendarMonth, -1);
  return { currentMonth, previousMonth:shiftMonth(currentMonth, -1), usesCurrentPartialMonth };
}
