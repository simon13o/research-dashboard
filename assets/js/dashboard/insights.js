export function createExecutiveInsightsRenderer({
  E,
  unique,
  productGroupKey,
  productGroupName,
  monthKey,
  formatNumber,
  formatCurrency,
  escapeHtml
}){
  const u = unique;
  const fN = formatNumber;
  const fC = formatCurrency;
function kpi(rows){
  const units = rows.reduce((s,x)=>s+x.saleUnits,0);
  const rev = rows.reduce((s,x)=>s+x.saleUnits*x.price,0);
  const avg = rows.length ? rows.reduce((s,x)=>s+x.price,0)/rows.length : 0;
  E.kU.textContent = fN(units);
  E.kR.textContent = fC(rev);
  E.kP.textContent = `$${avg.toFixed(2)}`;
  E.kB.textContent = String(u(rows.map(x=>x.brand)).length);
  const by = new Map();
  rows.forEach(r => {
    if(!by.has(r.brand)) by.set(r.brand, { u:0, rev:0, pSum:0, c:0 });
    const cur = by.get(r.brand);
    cur.u += r.saleUnits;
    cur.rev += r.saleUnits * r.price;
    cur.pSum += r.price;
    cur.c += 1;
  });
  E.kpiBrandBody.innerHTML = "";
  [...by.entries()].sort((a,b)=>b[1].u-a[1].u).forEach(([brand,v]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(brand)}</td><td>${fN(v.u)}</td><td>${fC(v.rev)}</td><td>$${(v.c ? v.pSum/v.c : 0).toFixed(2)}</td>`;
    E.kpiBrandBody.appendChild(tr);
  });
}

function renderExecutiveInsights(rows){
  const insightIcon = labelEl => {
    if(labelEl === E.insightTopProductLabel){
      return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    if(labelEl === E.insightBestBrandLabel){
      return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 14.639V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 10.656V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18.463V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14.656V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  const setInsight = (labelEl, nameEl, metaEl, label, name, meta) => {
    labelEl.innerHTML = `${insightIcon(labelEl)}<span>${escapeHtml(label || "-")}</span>`;
    nameEl.textContent = name || "-";
    metaEl.textContent = meta || "-";
  };
  if(!rows.length){
    setInsight(E.insightTopProductLabel, E.insightTopProduct, E.insightTopProductMeta, "Top Product", "-", "-");
    setInsight(E.insightBestBrandLabel, E.insightBestBrand, E.insightBestBrandMeta, "Best Performing Brand", "-", "-");
    setInsight(E.insightGrowthProductLabel, E.insightGrowthProduct, E.insightGrowthProductMeta, "Highest Growth Product", "-", "-");
    return;
  }

  const products = new Map();
  const brands = new Map();
  rows.forEach(r => {
    const pKey = productGroupKey(r);
    const mk = monthKey(r.time);
    const units = Math.max(0, Number(r.saleUnits) || 0);
    const revenue = units * (Number(r.price) || 0);
    if(!products.has(pKey)) products.set(pKey, { brand:r.brand, product:productGroupName(r), units:0, revenue:0, months:new Map(), skuSet:new Set() });
    const p = products.get(pKey);
    p.units += units;
    p.revenue += revenue;
    p.skuSet.add(r.product);
    if(mk) p.months.set(mk, (p.months.get(mk) || 0) + units);
    if(!brands.has(r.brand)) brands.set(r.brand, { brand:r.brand, units:0, revenue:0 });
    const b = brands.get(r.brand);
    b.units += units;
    b.revenue += revenue;
  });

  const topProduct = [...products.values()].sort((a,b)=>b.revenue-a.revenue)[0];
  const bestBrand = [...brands.values()].sort((a,b)=>b.revenue-a.revenue)[0];
  const growthProduct = [...products.values()].map(p => {
    const months = [...p.months.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    const first = months.length ? months[0][1] : 0;
    const last = months.length ? months[months.length - 1][1] : 0;
    return { ...p, growth:last - first, first, last };
  }).sort((a,b)=>b.growth-a.growth || b.units-a.units)[0];
  const brandCount = brands.size;
  const productCount = products.size;
  const totalUnits = rows.reduce((s,x)=>s + Math.max(0, Number(x.saleUnits) || 0),0);
  const totalRevenue = rows.reduce((s,x)=>s + (Math.max(0, Number(x.saleUnits) || 0) * (Number(x.price) || 0)),0);
  const avgPrice = rows.length ? rows.reduce((s,x)=>s + (Number(x.price) || 0),0) / rows.length : 0;

  if(brandCount >= 2){
    setInsight(
      E.insightTopProductLabel,
      E.insightTopProduct,
      E.insightTopProductMeta,
      "Top Product",
      topProduct ? topProduct.product : "-",
      topProduct ? `${topProduct.brand} | ${fC(topProduct.revenue)}` : "-"
    );
    setInsight(
      E.insightBestBrandLabel,
      E.insightBestBrand,
      E.insightBestBrandMeta,
      "Best Performing Brand",
      bestBrand ? bestBrand.brand : "-",
      bestBrand ? `${fN(bestBrand.units)} units | ${fC(bestBrand.revenue)}` : "-"
    );
    setInsight(
      E.insightGrowthProductLabel,
      E.insightGrowthProduct,
      E.insightGrowthProductMeta,
      "Highest Growth Product",
      growthProduct ? growthProduct.product : "-",
      growthProduct ? `${growthProduct.brand} | ${growthProduct.growth >= 0 ? "+" : ""}${fN(growthProduct.growth)} units` : "-"
    );
    return;
  }

  if(brandCount === 1 && productCount > 1){
    setInsight(
      E.insightTopProductLabel,
      E.insightTopProduct,
      E.insightTopProductMeta,
      "Total Product Line Units",
      fN(totalUnits),
      `${fC(totalRevenue)} revenue`
    );
    setInsight(
      E.insightBestBrandLabel,
      E.insightBestBrand,
      E.insightBestBrandMeta,
      "Best Product Group",
      topProduct ? topProduct.product : "-",
      topProduct ? `${topProduct.brand} | ${fC(topProduct.revenue)}` : "-"
    );
    setInsight(
      E.insightGrowthProductLabel,
      E.insightGrowthProduct,
      E.insightGrowthProductMeta,
      "Highest Growth Product",
      growthProduct ? growthProduct.product : "-",
      growthProduct ? `${growthProduct.growth >= 0 ? "+" : ""}${fN(growthProduct.growth)} units` : "-"
    );
    return;
  }

  setInsight(
    E.insightTopProductLabel,
    E.insightTopProduct,
    E.insightTopProductMeta,
    "Total Units",
    fN(totalUnits),
    `${productCount || 1} selected product${(productCount || 1) === 1 ? "" : "s"}`
  );
  setInsight(
    E.insightBestBrandLabel,
    E.insightBestBrand,
    E.insightBestBrandMeta,
    "Total Revenue",
    fC(totalRevenue),
    bestBrand ? bestBrand.brand : "-"
  );
  setInsight(
    E.insightGrowthProductLabel,
    E.insightGrowthProduct,
    E.insightGrowthProductMeta,
    "Avg Price",
    `$${avgPrice.toFixed(2)}`,
    topProduct ? topProduct.product : "-"
  );
}
  return { kpi, renderExecutiveInsights };
}