export function createProductMonthlyRenderer({
  E,
  productGroupKey,
  productGroupName,
  monthKey,
  monthEndGraceComparisonMonths,
  productSeriesColor,
  formatNumber,
  escapeHtml,
  escapeAttr,
  truncateLabel,
  findProductIntro,
  niceAxisMax,
  renderYAxis,
  svgAnimatedLinePath,
  svgClippedVerticalPath,
  observeSelectedProductCards,
  clearSelectedProductCardsObserver,
  getSelectedSkuByGroup,
  getExpandedProductCharts,
  getShowPriceInDual
}){
  const fN = formatNumber;
  const yAxis = renderYAxis;
  let showPriceInDual = getShowPriceInDual();
function renderSelectedProductPreview(rows){
  if(!E.selectedPreview) return;
  const monthShort = ym => {
    const [y,m] = String(ym).split("-").map(Number);
    if(!y || !m) return ym;
    return new Date(y, m - 1, 1).toLocaleString("en-US", { month:"short" });
  };
  const comparison = monthEndGraceComparisonMonths(rows);
  const latestComparisonMonth = comparison.currentMonth;
  const previousComparisonMonth = comparison.previousMonth;
  const trendFor = item => {
    const current = item.months.get(latestComparisonMonth) || 0;
    const previous = item.months.get(previousComparisonMonth) || 0;
    const label = `${monthShort(latestComparisonMonth)} vs ${monthShort(previousComparisonMonth)}`;
    if(previous === 0 && current > 0) return { text:"New", cls:"up", tip:`${label}: ${fN(current)} vs ${fN(previous)} units` };
    if(previous === 0 && current === 0) return { text:"No trend", cls:"", tip:`${label}: no units in either comparison month` };
    const pct = ((current - previous) / previous) * 100;
    const cls = pct > 0 ? "up" : (pct < 0 ? "down" : "");
    const sign = pct > 0 ? "+" : "";
    return { text:`${sign}${pct.toFixed(1)}%`, cls, tip:`${label}: ${fN(current)} vs ${fN(previous)} units` };
  };
  const byProduct = new Map();
  rows.forEach(r => {
    const key = productGroupKey(r);
    const mk = monthKey(r.time);
    if(!key || !mk) return;
    if(!byProduct.has(key)) byProduct.set(key, { brand:r.brand, product:productGroupName(r), category:r.category, total:0, months:new Map(), priceTotal:0, priceCount:0, skuSet:new Set() });
    const item = byProduct.get(key);
    const units = Math.max(0, Number(r.saleUnits) || 0);
    const price = Number(r.price);
    item.total += units;
    item.months.set(mk, (item.months.get(mk) || 0) + units);
    item.skuSet.add(r.product);
    if(Number.isFinite(price) && price > 0){
      item.priceTotal += price;
      item.priceCount += 1;
    }
  });
  const entries = [...byProduct.values()].sort((a,b)=>b.total-a.total);
  if(!entries.length){
    E.selectedPreview.innerHTML = `<p class="empty" style="margin:0">No selected product data to preview.</p>`;
    return;
  }
  const snippet = text => {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    return clean.length > 96 ? `${clean.slice(0, 96)}...` : clean;
  };
  E.selectedPreview.innerHTML = `
    <div class="selected-preview-list">
      ${entries.slice(0,3).map(item => {
        const name = `${item.product} (${item.brand})`;
        const trend = trendFor(item);
        const intro = findProductIntro(item.brand, item.product);
        const avgPrice = item.priceCount ? item.priceTotal / item.priceCount : 0;
        const desc = snippet(intro.text);
        const thumb = intro.imageDataUrl
          ? `<img src="${escapeAttr(intro.imageDataUrl)}" alt="${escapeAttr(item.product)}">`
          : escapeHtml((item.product || item.brand || "?").slice(0,1).toUpperCase());
        return `<div class="selected-preview-row" data-tip="${escapeAttr(`${name}: ${fN(item.total)} units | Avg price ${avgPrice ? `$${avgPrice.toFixed(2)}` : "-"} | ${trend.tip}`)}">
          <div class="selected-preview-thumb">${thumb}</div>
          <div class="selected-preview-content">
            <div class="selected-preview-name"><b>${escapeHtml(item.product)}</b><small>${escapeHtml([item.brand, item.category, item.skuSet.size > 1 ? `${item.skuSet.size} SKUs` : ""].filter(Boolean).join(" · "))}</small></div>
            <p class="selected-preview-desc ${desc ? "" : "muted"}">${escapeHtml(desc || "No product introduction saved yet.")}</p>
          </div>
          <div class="selected-preview-metrics">
            <div class="selected-preview-metric"><small>Units</small><strong>${fN(item.total)}</strong></div>
            <div class="selected-preview-metric"><small>Avg</small><strong>${avgPrice ? `$${avgPrice.toFixed(2)}` : "-"}</strong></div>
            <div class="selected-preview-metric"><small>Growth</small><strong class="selected-preview-trend ${trend.cls}">${escapeHtml(trend.text)}</strong></div>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

function renderSelectedProductCharts(rows, options = {}){
  const selectedSkuByGroup = getSelectedSkuByGroup();
  const expandedProductCharts = getExpandedProductCharts();
  showPriceInDual = getShowPriceInDual();
  const animateCards = options.animateCards !== false;
  E.selectedProductsCharts.innerHTML = "";
  const comparison = monthEndGraceComparisonMonths(rows);
  const latestComparisonMonth = comparison.currentMonth;
  const previousComparisonMonth = comparison.previousMonth;
  const trendForPoints = points => {
    const latest = points.find(p => p.m === latestComparisonMonth)?.u || 0;
    const prev = points.find(p => p.m === previousComparisonMonth)?.u || 0;
    if(prev === 0 && latest > 0) return { text:"New", cls:"up" };
    if(prev === 0 && latest === 0) return { text:"No trend", cls:"" };
    const pct = ((latest - prev) / prev) * 100;
    return { text:`${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`, cls:pct > 0 ? "up" : (pct < 0 ? "down" : "") };
  };
  const sparkline = (points, color) => {
    const values = points.map(p => p.u);
    if(values.length <= 1) return `<svg class="selected-preview-spark" viewBox="0 0 92 30"><line x1="4" y1="15" x2="88" y2="15" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".45"/></svg>`;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);
    const pts = values.map((v,i)=>({ x:4 + (84 * i / (values.length - 1)), y:25 - ((v - min) / range) * 20 }));
    const d = pts.map((p,i)=>`${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return `<svg class="selected-preview-spark" viewBox="0 0 92 30">${svgAnimatedLinePath(d, `fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`, 40)}</svg>`;
  };
  const mapToPoints = mm => [...mm.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([m,v])=>({m,u:v.units,p:v.priceCount? v.priceSum/v.priceCount:0}));
  const addToMonthMap = (mm, r) => {
    const mk = monthKey(r.time);
    if(!mk) return;
    if(!mm.has(mk)) mm.set(mk, { units:0, priceSum:0, priceCount:0 });
    const cur = mm.get(mk);
    cur.units += Math.max(0, Number(r.saleUnits) || 0);
    const p = Number(r.price);
    // Missing/invalid price should not drag monthly average to 0.
    if(Number.isFinite(p) && p > 0){
      cur.priceSum += p;
      cur.priceCount += 1;
    }
  };
  const map = new Map();
  rows.forEach(r => {
    const key = productGroupKey(r);
    const brand = r.brand || "";
    const group = productGroupName(r);
    const sku = r.product || "";
    if(!map.has(key)){
      map.set(key, { key, brand, product:group, category:r.category || "", all:new Map(), skus:new Map() });
    }
    const item = map.get(key);
    if(!item.category && r.category) item.category = r.category;
    addToMonthMap(item.all, r);
    if(sku){
      if(!item.skus.has(sku)) item.skus.set(sku, new Map());
      addToMonthMap(item.skus.get(sku), r);
    }
  });
  const entries = [...map.values()];
  E.selectedEmpty.hidden = entries.length !== 0;
  entries.forEach(item => {
    const { key:k, brand, product } = item;
    const skuOptions = [...item.skus.keys()].filter(Boolean).sort();
    const selectedSku = skuOptions.includes(selectedSkuByGroup[k]) ? selectedSkuByGroup[k] : "";
    if(selectedSkuByGroup[k] && !selectedSku) delete selectedSkuByGroup[k];
    const points = mapToPoints(selectedSku ? item.skus.get(selectedSku) : item.all);
    const color = productSeriesColor(brand, selectedSku || product);
    const totalUnits = points.reduce((s,p)=>s+p.u,0);
    const pricePoints = points.filter(p => p.p > 0);
    const avgPrice = pricePoints.length ? pricePoints.reduce((s,p)=>s+p.p,0) / pricePoints.length : 0;
    const trend = trendForPoints(points);
    const expanded = expandedProductCharts.has(k);
    const card = document.createElement("div");
    card.className = `prod-card${animateCards ? " prod-card-animate" : ""}`;
    const svgId = `mini_${Math.random().toString(36).slice(2)}`;
    const introKey = selectedSku ? `${brand}||${selectedSku}` : k;
    const skuSelect = skuOptions.length > 1
      ? `<select class="prod-sku-select" data-product-sku="${escapeAttr(k)}" aria-label="Select SKU for ${escapeAttr(product)}">
          <option value="" ${selectedSku ? "" : "selected"}>All SKUs</option>
          ${skuOptions.map(sku => `<option value="${escapeAttr(sku)}" ${sku === selectedSku ? "selected" : ""}>${escapeHtml(truncateLabel(sku, 26))}</option>`).join("")}
        </select>`
      : "";
    card.innerHTML = `
      <div class="prod-card-head">
        <div class="prod-card-title">
          <h4 data-intro-key="${escapeAttr(introKey)}" data-tip="${escapeAttr(`${selectedSku || product} (${brand})`)}">${escapeHtml(product)}</h4>
          <small>${escapeHtml([brand, selectedSku ? selectedSku : (skuOptions.length > 1 ? `${skuOptions.length} SKUs` : "")].filter(Boolean).join(" · "))}</small>
        </div>
        <div class="prod-card-actions">
          ${skuSelect}
          <button class="prod-details-btn" type="button" data-product-toggle="${escapeAttr(k)}">${expanded ? "Hide ▴" : "Details ▾"}</button>
        </div>
      </div>
      <div class="prod-summary-grid">
        <div class="prod-summary-metric"><small>Total Units</small><b>${fN(totalUnits)}</b></div>
        <div class="prod-summary-metric"><small>Avg Price</small><b>$${avgPrice.toFixed(2)}</b></div>
        <div class="prod-summary-metric"><small>${escapeHtml(latestComparisonMonth)} vs ${escapeHtml(previousComparisonMonth)}</small><b class="${trend.cls}">${escapeHtml(trend.text)}</b></div>
      </div>
      <div class="prod-spark-row"><span>Monthly units trend</span>${sparkline(points, color)}</div>
      ${expanded ? `<div class="prod-chart-wrap"><svg id="${svgId}" class="mini-svg" viewBox="0 0 620 220"></svg></div>` : ""}
    `;
    E.selectedProductsCharts.appendChild(card);
    if(expanded){
      const svg = document.getElementById(svgId);
      drawMiniChart(svg, points, color, "dual");
    }
  });
  if(animateCards){
    observeSelectedProductCards();
  } else {
    clearSelectedProductCardsObserver();
  }
}

function drawMiniChart(svg, points, color, mode){
  if(!points.length) return;
  const svgWidth=620;
  const m={t:26,r:58,b:34,l:48}, W=svgWidth-m.l-m.r, H=220-m.t-m.b;
  const lineInk = "#334155";
  const gradId = `g_${Math.random().toString(36).slice(2,8)}`;
  const grad = `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.92"/><stop offset="100%" stop-color="${color}" stop-opacity="0.45"/></linearGradient></defs>`;
  svg.insertAdjacentHTML("beforeend", grad);
  const xStart = m.l + 8;
  const xEnd = m.l + W - 8;
  const slot = points.length ? (xEnd - xStart) / points.length : (xEnd - xStart);
  const xAt = i => (points.length===1 ? (xStart + xEnd)/2 : xStart + slot * (i + 0.5));
  const drawXLabels = (arr) => arr.forEach((p,i)=>svg.insertAdjacentHTML("beforeend", `<text x="${xAt(i)}" y="214" text-anchor="middle" font-size="10" fill="#64748b">${escapeHtml(p.m)}</text>`));

  if(mode === "dual"){
    // Keep the price scale in its own right-side gutter so labels cannot cover the final bar.
    const dualM={...m,r:96};
    const dualW=svgWidth-dualM.l-dualM.r;
    const dualXStart=dualM.l+8;
    const dualXEnd=dualM.l+dualW-8;
    const dualSlot=points.length ? (dualXEnd-dualXStart)/points.length : (dualXEnd-dualXStart);
    const dualXAt=i=>(points.length===1 ? (dualXStart+dualXEnd)/2 : dualXStart+dualSlot*(i+.5));
    const drawDualXLabels=arr=>arr.forEach((p,i)=>svg.insertAdjacentHTML("beforeend", `<text x="${dualXAt(i)}" y="214" text-anchor="middle" font-size="10" fill="#64748b">${escapeHtml(p.m)}</text>`));
    const priceLabelX=svgWidth-8;
    const uMax = Math.max(...points.map(p=>p.u),1);
    const pMax = Math.max(...points.map(p=>p.p),1);
    const uAxisMax = niceAxisMax(uMax);
    const uScale = v => dualM.t + H - (v / uAxisMax) * H;
    const pScale = v => dualM.t + H - (v / pMax) * H;
    yAxis(svg,dualM,dualW,H,uAxisMax);

    const bw = Math.max(8, Math.min(28, dualSlot * 0.42));
    points.forEach((p,i)=>{
      const cx = dualXAt(i);
      const x = cx - bw/2;
      const y = Math.max(dualM.t, uScale(p.u));
      const h = Math.max(0, dualM.t + H - y);
      const tip = `${p.m}: Units ${fN(p.u)} | Avg Price $${p.p.toFixed(2)}`;
      const dBar = `M ${x} ${dualM.t+H} L ${x} ${y+5} Q ${x} ${y} ${x+5} ${y} L ${x+bw-5} ${y} Q ${x+bw} ${y} ${x+bw} ${y+5} L ${x+bw} ${dualM.t+H} Z`;
      svg.insertAdjacentHTML("beforeend", svgClippedVerticalPath(dBar, x, y, bw, h, dualM.t+H, `url(#${gradId})`, `data-tip="${escapeAttr(tip)}"`, i * 55));
    });

    if(showPriceInDual){
      const linePts = points.map((p,i)=>({x:dualXAt(i),y:Math.min(dualM.t+H,Math.max(dualM.t,pScale(p.p))),m:p.m,p:p.p}));
      const d2 = linePts.map((p,i)=>`${i?"L":"M"}${p.x},${p.y}`).join(" ");
      svg.insertAdjacentHTML("beforeend", svgAnimatedLinePath(d2, `fill="none" stroke="${lineInk}" stroke-width="2"`, 120));
      linePts.forEach(p=>svg.insertAdjacentHTML("beforeend", `<circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#fff" stroke="${lineInk}" stroke-width="1.5" data-tip="${escapeAttr(`${p.m}: Avg Price $${p.p.toFixed(2)}`)}"/>`));
      for(let i=0;i<=4;i++){
        const y = dualM.t + H - (H*i/4);
        const pv = (pMax*i/4).toFixed(2);
        svg.insertAdjacentHTML("beforeend", `<text x="${priceLabelX}" y="${y+4}" text-anchor="end" font-size="10" fill="#8a96a3">$${pv}</text>`);
      }
      svg.insertAdjacentHTML("beforeend", `<g><circle cx="${dualM.l+dualW-112}" cy="${dualM.t-11}" r="4" fill="url(#${gradId})"/><text x="${dualM.l+dualW-103}" y="${dualM.t-8}" font-size="10" fill="#64748b">Units</text><circle cx="${dualM.l+dualW-54}" cy="${dualM.t-11}" r="3.2" fill="#fff" stroke="${lineInk}" stroke-width="1.4"/><text x="${dualM.l+dualW-45}" y="${dualM.t-8}" font-size="10" fill="#64748b">Price</text></g>`);
    } else {
      svg.insertAdjacentHTML("beforeend", `<g><circle cx="${dualM.l+dualW-56}" cy="${dualM.t-11}" r="4" fill="url(#${gradId})"/><text x="${dualM.l+dualW-47}" y="${dualM.t-8}" font-size="10" fill="#64748b">Units</text></g>`);
    }
    drawDualXLabels(points);
    return;
  }

  const maxY = Math.max(...points.map(x=>x.u),1);
  const yM = niceAxisMax(maxY);
  yAxis(svg,m,W,H,yM);

  if(mode === "bar"){
    const bw = Math.max(9, Math.min(30, slot * 0.45));
    points.forEach((p,i) => {
      const cx = xAt(i);
      const x = cx - bw/2;
      const h = (p.u/yM)*H;
      const y = m.t + H - h;
      const tip = `${p.m}: ${fN(p.u)} units`;
      const dBar = `M ${x} ${m.t+H} L ${x} ${y+5} Q ${x} ${y} ${x+5} ${y} L ${x+bw-5} ${y} Q ${x+bw} ${y} ${x+bw} ${y+5} L ${x+bw} ${m.t+H} Z`;
      svg.insertAdjacentHTML("beforeend", svgClippedVerticalPath(dBar, x, y, bw, h, m.t+H, `url(#${gradId})`, `data-tip="${escapeAttr(tip)}"`, i * 55));
    });
    svg.insertAdjacentHTML("beforeend", `<g><circle cx="${m.l+W-56}" cy="${m.t-11}" r="4" fill="url(#${gradId})"/><text x="${m.l+W-47}" y="${m.t-8}" font-size="10" fill="#64748b">Units</text></g>`);
    drawXLabels(points);
  } else {
    const pts = points.map((p,i)=>({x:xAt(i),y:m.t+H-(p.u/yM)*H,...p}));
    const d = pts.map((p,i)=>`${i?"L":"M"}${p.x},${p.y}`).join(" ");
    svg.insertAdjacentHTML("beforeend", svgAnimatedLinePath(d, `fill="none" stroke="${lineInk}" stroke-width="2"`, 80));
    pts.forEach(p=>svg.insertAdjacentHTML("beforeend", `<circle cx="${p.x}" cy="${p.y}" r="3.1" fill="#fff" stroke="${lineInk}" stroke-width="1.5" data-tip="${escapeAttr(`${p.m}: ${fN(p.u)} units`)}"/>`));
    svg.insertAdjacentHTML("beforeend", `<g><circle cx="${m.l+W-56}" cy="${m.t-11}" r="3.1" fill="#fff" stroke="${lineInk}" stroke-width="1.4"/><text x="${m.l+W-47}" y="${m.t-8}" font-size="10" fill="#64748b">Units</text></g>`);
    drawXLabels(points);
  }
}
  return { renderSelectedProductPreview, renderSelectedProductCharts };
}
