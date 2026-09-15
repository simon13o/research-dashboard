export function createRankingRenderer({
  E,
  productGroupName,
  productGroupKey,
  productKey,
  colorForBrand,
  productSeriesColor,
  formatCurrency,
  formatNumber,
  escapeHtml,
  escapeAttr,
  introTipHtml,
  truncateLabel,
  svgHorizontalBar
}){
  const fC = formatCurrency;
  const fN = formatNumber;
function piePath(cx,cy,r,a,b){
  const sx=cx+r*Math.cos(a),sy=cy+r*Math.sin(a),ex=cx+r*Math.cos(b),ey=cy+r*Math.sin(b),la=b-a>Math.PI?1:0;
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${la} 1 ${ex} ${ey} Z`;
}
function annularSlicePath(cx,cy,rIn,rOut,a,b){
  const largeArc = (b - a) > Math.PI ? 1 : 0;
  const x1o = cx + rOut * Math.cos(a), y1o = cy + rOut * Math.sin(a);
  const x2o = cx + rOut * Math.cos(b), y2o = cy + rOut * Math.sin(b);
  const x2i = cx + rIn * Math.cos(b), y2i = cy + rIn * Math.sin(b);
  const x1i = cx + rIn * Math.cos(a), y1i = cy + rIn * Math.sin(a);
  return `M ${x1o} ${y1o} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1i} ${y1i} Z`;
}

function renderTopProducts(rows, target = E.prod, opt = {}){
  target.innerHTML = "";
  const isMain = target === E.prod;
  if(!rows.length){ if(isMain) E.prodEmpty.hidden = false; return; }
  if(isMain) E.prodEmpty.hidden = true;
  const vw = opt.large ? 1180 : 860;
  const isPie = E.prodMode.value === "pie";
  const vh = opt.large ? 640 : (isPie ? 310 : 260);
  target.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
  if(isMain) target.style.height = `${vh}px`;
  let entity = E.prodCompareBy ? E.prodCompareBy.value : "group";
  if(entity === "product") entity = "group";
  const metric = E.prodRankMetric ? E.prodRankMetric.value : "units";
  const entityLabel = entity === "brand" ? "Brand" : (entity === "sku" ? "SKU" : "Product Group");
  const metricLabel = metric === "revenue" ? "Revenue" : "Units";
  const formatMetric = v => metric === "revenue" ? fC(v) : fN(v);
  const formatCenterMetric = v => {
    if(metric !== "revenue") return fN(v);
    if(Math.abs(v) >= 1000000) return `$${(v/1000000).toFixed(v >= 10000000 ? 1 : 2)}M`;
    if(Math.abs(v) >= 1000) return `$${(v/1000).toFixed(1)}K`;
    return fC(v);
  };
  const map = new Map();
  rows.forEach(r => {
    const brand = r.brand || "Unknown";
    const product = r.product || "Unknown";
    const group = productGroupName(r) || product;
    const k = entity === "brand" ? brand : (entity === "sku" ? productKey(r) : productGroupKey(r));
    const units = Math.max(0, Number(r.saleUnits) || 0);
    const revenue = units * (Number(r.price) || 0);
    if(!map.has(k)){
      map.set(k, {
        brand,
        product:entity === "brand" ? "" : (entity === "sku" ? product : group),
        productGroup:entity === "brand" ? "" : group,
        label:entity === "brand" ? brand : `${entity === "sku" ? product : group} (${brand})`,
        units:0,
        revenue:0,
        key:k,
        skuSet:new Set()
      });
    }
    const item = map.get(k);
    item.units += units;
    item.revenue += revenue;
    if(entity === "group") item.skuSet.add(product);
  });
  const top = [...map.values()]
    .map(item => ({ ...item, value:metric === "revenue" ? item.revenue : item.units }))
    .sort((a,b)=>b.value-a.value || b.units-a.units)
    .slice(0,8);
  if(!top.length){ if(isMain) E.prodEmpty.hidden = false; return; }
  const byRank = top.map((x,idx)=>({...x,rank:idx,color:entity === "brand" ? colorForBrand(x.brand) : productSeriesColor(x.brand, x.product)}));
  const rankingTipHtml = (item, extra) => {
    if(entity === "brand"){
      return `<div style="font-weight:700;margin-bottom:4px">${escapeHtml(item.brand)}</div>${extra ? `<div>${escapeHtml(extra)}</div>` : ""}`;
    }
    if(entity === "group"){
      const skuNote = item.skuSet && item.skuSet.size > 1 ? `<div style="color:#64748b;margin-top:4px">${item.skuSet.size} SKU variants grouped</div>` : "";
      return `<div style="font-weight:700;margin-bottom:4px">${escapeHtml(item.product)} (${escapeHtml(item.brand)})</div>${extra ? `<div>${escapeHtml(extra)}</div>` : ""}${skuNote}`;
    }
    return introTipHtml(item.brand, item.product, extra);
  };

  if(isPie){
    const cx = Math.round(vw * (opt.large ? 0.38 : 0.34));
    const cy = Math.round(vh * 0.50);
    const rOuter = opt.large ? 230 : 148;
    const rInner = Math.round(rOuter * 0.38);
    const legendX = Math.round(vw * (opt.large ? 0.65 : 0.58));
    const total=top.reduce((s,x)=>s+x.value,0)||1;
    const maxValue = Math.max(...byRank.map(x => x.value), 1);
    const minValue = Math.min(...byRank.map(x => x.value), maxValue);
    const n = byRank.length;
    const step = (Math.PI * 2) / Math.max(n, 1);
    byRank.forEach((item, i)=>{
      const st = -Math.PI/2 + i * step;
      const en = st + step * 0.98; // tiny gap between petals
      const t = maxValue === minValue ? 1 : (item.value - minValue) / (maxValue - minValue);
      const petalR = rInner + (0.30 + 0.70 * t) * (rOuter - rInner);
      const p = item.value / total;
      const tipHtml = rankingTipHtml(item, `${metricLabel}: ${formatMetric(item.value)} | Units: ${fN(item.units)} | ${(p*100).toFixed(1)}%`);
      target.insertAdjacentHTML("beforeend", `<path d="${annularSlicePath(cx,cy,rInner,petalR,st,en)}" fill="${item.color}" stroke="#fff" stroke-width="1.6" data-tip-html="${escapeAttr(tipHtml)}"/>`);
    });
    target.insertAdjacentHTML("beforeend", `<circle cx="${cx}" cy="${cy}" r="${rInner}" fill="#fff" stroke="#e2e8f0"/><text x="${cx}" y="${cy-7}" text-anchor="middle" font-size="${opt.large ? 14 : 12}" fill="#94a3b8">${metricLabel}</text><text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="${opt.large ? 20 : 17}" font-weight="800" fill="#0f172a">${formatCenterMetric(total)}</text>`);
    let y = opt.large ? 90 : 72;
    byRank.forEach(item=>{
      const c=item.color, pc=((item.value/total)*100).toFixed(1);
      const label = item.label;
      const short = truncateLabel(label, opt.large ? 34 : 25);
      const tipHtml = rankingTipHtml(item, `${metricLabel}: ${formatMetric(item.value)} | Units: ${fN(item.units)} | ${pc}%`);
      target.insertAdjacentHTML("beforeend", `<rect x="${legendX}" y="${y-9}" width="11" height="11" rx="2" fill="${c}" data-tip-html="${escapeAttr(tipHtml)}"/><text x="${legendX+17}" y="${y}" font-size="13" fill="#334155" data-tip-html="${escapeAttr(tipHtml)}" title="${escapeAttr(label)}">${escapeHtml(short)} - ${pc}%</text>`);
      y += opt.large ? 24 : 22;
    });
  } else {
    const mg={t:10,r:22,b:10,l:opt.large ? 300 : 210}, W=vw-mg.l-mg.r, H=vh-mg.t-mg.b, bh=Math.max(18, Math.min(opt.large ? 44 : 34, (H/Math.max(top.length,1))-5)), mx=Math.max(...top.map(x=>x.value),1);
    byRank.forEach((item,i)=>{
      const y=mg.t+i*(bh+5), w=(item.value/mx)*W, c=item.color, lab=item.label;
      const labelText = truncateLabel(lab, opt.large ? 34 : 22);
      const tip = `${item.label} | ${metricLabel}: ${formatMetric(item.value)} | Units: ${fN(item.units)}`;
      const tipHtml = rankingTipHtml(item, `${metricLabel}: ${formatMetric(item.value)} | Units: ${fN(item.units)}`);
      target.insertAdjacentHTML("beforeend", `<text x="${mg.l-8}" y="${y+bh*.72}" font-size="${opt.large?18:15}" text-anchor="end" fill="#334155" data-tip-html="${escapeAttr(tipHtml)}">${escapeHtml(labelText)}</text>${svgHorizontalBar(mg.l, y, w, bh, 6, c, `data-tip="${escapeAttr(tip)}" data-tip-html="${escapeAttr(tipHtml)}"`, i * 55)}`);
    });
  }
}
  return { renderTopProducts };
}