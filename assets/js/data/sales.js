export function createSalesDataTools({
  normalizeRow,
  inferProductGroup,
  normalizeTime,
  monthKey,
  toNumber,
  productGroupName
}){
  const norm = normalizeRow;
  const toNum = toNumber;
function csvMap(rows){
  const g = (r, keys) => { for(const k of keys) if(r[k] != null && r[k] !== "") return r[k]; return ""; };
  return rows.map(r => norm({
    category:g(r,["category","cat"]),
    brand:g(r,["brand","brand_name"]),
    product:g(r,["product","product_name","productname","item_name"]),
    productGroup:g(r,["product_group","product group","productgroup","parent_product","parent product","base_product","base product","product_family","product family","product_line","product line"]),
    time:g(r,["time","date","month"]),
    saleUnits:g(r,["sale_units","sales_units","units","qty","unit"]),
    price:g(r,["price","unit_price"])
  })).filter(r => r.brand || r.product || r.time);
}
function keyPart(v){
  return String(v || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
function rowKey(r){
  return `${keyPart(r.category)}||${keyPart(r.brand)}||${keyPart(r.product)}||${monthKey(r.time)}`;
}
function upsertRows(existing, incoming){
  const normalizedIncoming = incoming.map(norm);
  const incomingKeys = new Set(normalizedIncoming.map(rowKey));
  const survivors = existing.map(norm).filter(r => !incomingKeys.has(rowKey(r)));
  return [...survivors, ...normalizedIncoming];
}
function normalizeRawSale(r){
  return {
    category:String(r.category || "Other").trim() || "Other",
    brand:String(r.brand || "").trim(),
    product:String(r.product || "").trim(),
    productGroup:String(r.productGroup ?? r.product_group ?? r.productGroupName ?? r.parentProduct ?? r.productFamily ?? "").trim() || inferProductGroup(r.product),
    time:normalizeTime(r.time),
    saleUnits:Math.max(0, toNum(r.saleUnits) || 0),
    price:Math.max(0, toNum(r.price) || 0),
    source:String(r.source || "daily").trim() || "daily"
  };
}
function dailyRowKey(r){
  return `${keyPart(r.category)}||${keyPart(r.brand)}||${keyPart(r.product)}||${normalizeTime(r.time)}`;
}
function monthlyScopeKey(r){
  return `${keyPart(r.category)}||${keyPart(r.brand)}||${keyPart(r.product)}||${monthKey(r.time)}`;
}
function isMonthOnlyTime(v){
  return /^\d{4}-\d{2}$/.test(normalizeTime(v));
}
function legacyMonthlyToRawRows(rows){
  return rows.map(r => normalizeRawSale({ ...r, time:monthKey(r.time), source:"legacy-monthly" }));
}
function upsertRawSalesRows(existing, incoming){
  const incomingByKey = new Map();
  incoming.map(r => normalizeRawSale({ ...r, source:"daily" }))
    .filter(r => r.brand || r.product || r.time)
    .forEach(r => incomingByKey.set(dailyRowKey(r), r));
  const normalizedIncoming = [...incomingByKey.values()];
  const normalizedExisting = existing.map(normalizeRawSale);
  const existingAnyMonthlyScopes = new Set(normalizedExisting.map(monthlyScopeKey));
  const safeIncoming = normalizedIncoming.filter(r => {
    if(existingAnyMonthlyScopes.has(monthlyScopeKey(r))) return false;
    return true;
  });
  return [...normalizedExisting, ...safeIncoming];
}
function rebuildMonthlySalesFromRaw(rows){
  return aggregateMonthly(rows.map(normalizeRawSale));
}
function aggregateMonthly(rows){
  const map = new Map();
  rows.forEach(r => {
    const mk = monthKey(r.time);
    if(!mk) return;
    const key = `${String(r.category||"")}||${String(r.brand||"")}||${String(r.product||"")}||${mk}`;
    if(!map.has(key)){
      map.set(key, { category:r.category||"Other", brand:r.brand||"", product:r.product||"", productGroup:productGroupName(r), time:mk, saleUnits:0, priceSum:0, priceCount:0 });
    }
    const cur = map.get(key);
    cur.saleUnits += Math.max(0, Number(r.saleUnits) || 0);
    const p = Number(r.price);
    if(Number.isFinite(p) && p > 0){
      cur.priceSum += p;
      cur.priceCount += 1;
    }
  });
  return [...map.values()].map(x => norm({
    category:x.category,
    brand:x.brand,
    product:x.product,
    productGroup:x.productGroup,
    time:x.time,
    saleUnits:x.saleUnits,
    price:x.priceCount ? (x.priceSum / x.priceCount) : 0
  }));
}
  return {
    csvMap,
    keyPart,
    rowKey,
    upsertRows,
    normalizeRawSale,
    dailyRowKey,
    monthlyScopeKey,
    isMonthOnlyTime,
    legacyMonthlyToRawRows,
    upsertRawSalesRows,
    rebuildMonthlySalesFromRaw,
    aggregateMonthly
  };
}