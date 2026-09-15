export function createSalesTrendRenderer({
  E,
  unique,
  monthKey,
  niceAxisMax,
  renderYAxis,
  smoothPath,
  colorForBrand,
  svgVerticalBar,
  svgLeftRevealPath,
  escapeHtml,
  escapeAttr,
  formatNumber,
  truncateLabel,
  shouldShowMonthLabel,
  getHiddenTrendBrands,
  setHiddenTrendBrands
}){
  function renderTrend(rows, target = E.trend, options = {}){
    target.innerHTML = "";
    const isMain = target === E.trend;
    if(!rows.length){ if(isMain) E.trendEmpty.hidden = false; return; }
    if(isMain) E.trendEmpty.hidden = true;
    const renderedWidth = Math.round(target.getBoundingClientRect().width || target.clientWidth || 860);
    const viewWidth = options.large ? 1180 : Math.max(860, renderedWidth);
    const viewHeight = options.large ? 640 : (isMain ? 300 : 320);
    target.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
    const margin = {
      t: options.large ? 54 : (isMain ? 42 : 46),
      r: options.large ? 44 : (isMain ? 44 : 30),
      b: options.large ? 112 : (isMain ? 58 : 76),
      l: 56
    }, width = viewWidth - margin.l - margin.r, height = viewHeight - margin.t - margin.b;
    const months = unique(rows.map(x => monthKey(x.time))).filter(Boolean).sort();
    const brands = unique(rows.map(x => x.brand)).sort();
    let hiddenBrands = getHiddenTrendBrands();
    hiddenBrands = new Set([...hiddenBrands].filter(brand => brands.includes(brand)));
    setHiddenTrendBrands(hiddenBrands);
    const visibleBrands = brands.filter(brand => !hiddenBrands.has(brand));
    const activeBrands = visibleBrands.length ? visibleBrands : brands;
    if(!visibleBrands.length && brands.length && hiddenBrands.size){
      hiddenBrands.clear();
      setHiddenTrendBrands(hiddenBrands);
    }
    const series = activeBrands.map(brand => {
      const values = new Map(months.map(month => [month, 0]));
      rows.filter(row => row.brand === brand).forEach(row => {
        const month = monthKey(row.time);
        if(!month || !values.has(month)) return;
        values.set(month, (values.get(month) || 0) + Math.max(0, Number(row.saleUnits) || 0));
      });
      return { b:brand, pts:months.map(month => ({ m:month, u:values.get(month) })) };
    });
    const isBar = E.trendMode.value === "bar";
    const baseXPad = options.large ? 18 : (isMain ? 28 : 5);
    const barSafePad = isBar ? Math.min(Math.max(64, activeBrands.length * 14), Math.max(64, width * 0.08)) : baseXPad;
    const xPad = Math.max(baseXPad, barSafePad);
    const plotWidth = Math.max(1, width - xPad * 2);
    const xAt = index => margin.l + xPad + (months.length === 1 ? plotWidth / 2 : plotWidth * index / (months.length - 1));
    const yMax = niceAxisMax(Math.max(...series.flatMap(item => item.pts.map(point => point.u)), 1));
    renderYAxis(target, margin, width, height, yMax);
    const trendHitPoints = [];
    series.forEach((item, seriesIndex) => {
      const points = item.pts.map((point, index) => ({ x:xAt(index), y:margin.t + height - (point.u / yMax) * height, ...point }));
      const color = colorForBrand(item.b);
      if(isBar){
        const monthSlotWidth = plotWidth / Math.max(months.length, 1);
        const barWidth = Math.max(3, Math.min(20, (monthSlotWidth * 0.72) / Math.max(series.length, 1)));
        const groupTotalWidth = series.length * barWidth;
        points.forEach((point, index) => {
          const baseX = xAt(index);
          const x = Math.max(margin.l + 4, Math.min(margin.l + width - barWidth - 4, baseX - (groupTotalWidth / 2) + (seriesIndex * barWidth)));
          const y = margin.t + height - (point.u / yMax) * height;
          const barHeight = (point.u / yMax) * height;
          target.insertAdjacentHTML("beforeend", svgVerticalBar(x, y, barWidth - 1, barHeight, 2, color, `data-tip="${escapeAttr(`${item.b} | ${point.m}: ${formatNumber(point.u)} units`)}"`, (index * 36) + (seriesIndex * 18)));
        });
      } else {
        const total = item.pts.reduce((sum, point) => sum + point.u, 0);
        const maxTotal = Math.max(...series.map(entry => entry.pts.reduce((sum, point) => sum + point.u, 0)), 1);
        const lowSeries = total <= maxTotal * 0.18;
        const gradientId = `trend_area_${Math.random().toString(36).slice(2, 7)}`;
        target.insertAdjacentHTML("beforeend", `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.16"/><stop offset="100%" stop-color="${color}" stop-opacity="0.02"/></linearGradient></defs>`);
        const line = smoothPath(points);
        const area = `${line} L ${points[points.length - 1].x},${margin.t + height} L ${points[0].x},${margin.t + height} Z`;
        target.insertAdjacentHTML("beforeend", svgLeftRevealPath(area, margin.l, margin.t, width, height, `url(#${gradientId})`, `pointer-events="none"`, seriesIndex * 90));
        target.insertAdjacentHTML("beforeend", svgLeftRevealPath(line, margin.l, margin.t, width, height, "none", `stroke="${color}" stroke-width="2.4" ${lowSeries ? `stroke-dasharray="5 4"` : ""} stroke-linecap="round" stroke-linejoin="round" pointer-events="none"`, seriesIndex * 90));
        points.forEach(point => {
          const tip = `${item.b} | ${point.m}: ${formatNumber(point.u)} units`;
          target.insertAdjacentHTML("beforeend", `<circle cx="${point.x}" cy="${point.y}" r="3.6" fill="#fff" stroke="${color}" stroke-width="1.6" data-tip="${escapeAttr(tip)}"/>`);
          trendHitPoints.push({ x:point.x, y:point.y, tip });
        });
      }
    });
    if(!isBar){
      trendHitPoints.forEach(point => {
        target.insertAdjacentHTML("beforeend", `<circle cx="${point.x}" cy="${point.y}" r="9" fill="transparent" pointer-events="all" data-tip="${escapeAttr(point.tip)}"/>`);
      });
    }
    months.forEach((month, index) => {
      if(!shouldShowMonthLabel(index, months.length)) return;
      const x = xAt(index);
      const y = viewHeight - (options.large ? 76 : (isMain ? 26 : 54));
      const anchor = index === 0 ? "start" : (index === months.length - 1 ? "end" : "middle");
      target.insertAdjacentHTML("beforeend", `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${options.large ? 14 : 12}" fill="#64748b">${escapeHtml(month)}</text>`);
    });
    const legendItems = brands.slice(0, 12);
    const legendY = options.large ? 22 : 18;
    const legendGap = options.large ? 150 : 118;
    const legendStart = Math.max(margin.l, (viewWidth - legendItems.length * legendGap) / 2);
    legendItems.forEach((brand, index) => {
      const color = colorForBrand(brand);
      const short = truncateLabel(brand, options.large ? 16 : 12);
      const hidden = getHiddenTrendBrands().has(brand);
      const x = legendStart + index * legendGap;
      const hitWidth = Math.min(legendGap - 8, 18 + short.length * (options.large ? 8 : 7));
      target.insertAdjacentHTML("beforeend", `
        <g data-trend-brand="${escapeAttr(brand)}" style="cursor:pointer">
          <rect x="${x}" y="${legendY - 9}" width="10" height="10" rx="2" fill="${color}" opacity="${hidden ? 0.28 : 1}" data-tip="${escapeAttr(hidden ? `Show ${brand}` : `Hide ${brand}`)}"/>
          <text x="${x + 15}" y="${legendY}" font-size="${options.large ? 13 : 11}" fill="${hidden ? "#94a3b8" : "#334155"}" text-decoration="${hidden ? "line-through" : "none"}" data-tip="${escapeAttr(hidden ? `Show ${brand}` : `Hide ${brand}`)}">${escapeHtml(short)}</text>
          <rect x="${x - 6}" y="${legendY - 18}" width="${hitWidth}" height="26" rx="8" fill="transparent" pointer-events="all" data-trend-brand="${escapeAttr(brand)}" data-tip="${escapeAttr(hidden ? `Show ${brand}` : `Hide ${brand}`)}"/>
        </g>`);
    });
  }

  return { renderTrend };
}
