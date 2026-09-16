export function createExhibitionTools({
  E,
  escapeHtml,
  escapeAttr,
  safeUrl,
  normalizeTime,
  monthKey,
  worldMapSvg,
  getExhibitions,
  getSelectedCountry,
  getShowPast
}) {
  function normalizeExhibition(row){
    const clean = value => String(value ?? "").trim();
    return {
      showName:clean(row.showName ?? row.show_name ?? row.exhibitionName ?? row.exhibition_name ?? row["Show Name"]),
      date:normalizeTime(row.date ?? row.Date),
      country:clean(row.country ?? row.Country),
      location:clean(row.location ?? row.Location),
      salesResponsible:clean(row.salesResponsible ?? row.sales_responsible ?? row.owner ?? row["Sales Responsible"]),
      category:clean(row.category ?? row.Category),
      businessModel:clean(row.businessModel ?? row.business_model ?? row.oem_odm ?? row["OEM/ODM"] ?? row["oem/odm"]),
      attendance:clean(row.attendance ?? row.attendence ?? row.Attendance ?? row.Attendence),
      website:clean(row.website ?? row.Website),
      remark:clean(row.remark ?? row.remarks ?? row.notes ?? row.Remark)
    };
  }

  function exhibitionCsvMap(rows){
    const get = (row, keys) => { for(const key of keys) if(row[key] != null && String(row[key]).trim() !== "") return row[key]; return ""; };
    return rows.map(row => normalizeExhibition({
      showName:get(row,["show_name","show","exhibition_name","event_name","name"]),
      date:get(row,["date","show_date","event_date"]), country:get(row,["country","nation","market"]),
      location:get(row,["location","city","venue","address"]), salesResponsible:get(row,["sales_responsible","responsible","owner","sales","sales_person"]),
      category:get(row,["category","product_category","type"]), businessModel:get(row,["oem/odm","oem_odm","business_model","model"]),
      attendance:get(row,["attendence","attendance","attended","join"]), website:get(row,["website","url","link"]),
      remark:get(row,["remark","remarks","notes","note"])
    })).filter(row => row.showName || row.date || row.country);
  }

  function exhibitionKey(row){
    return `${String(row.showName || "").toLowerCase()}||${String(row.date || "")}||${String(row.country || "").toLowerCase()}`;
  }

  function upsertExhibitions(existing, incoming){
    const rows = new Map(existing.map(row => [exhibitionKey(row), normalizeExhibition(row)]));
    incoming.forEach(item => {
      const row = normalizeExhibition(item);
      if(row.showName || row.date || row.country) rows.set(exhibitionKey(row), row);
    });
    return [...rows.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.showName).localeCompare(String(b.showName)));
  }

  function exhibitionDateLabel(value){ return normalizeTime(value) || "-"; }
  function exhibitionMonth(value){ return monthKey(value) || "Unknown"; }

  function exhibitionCountryCoords(country){
    const key = String(country || "").toLowerCase().replace(/\./g, "").trim();
    const coordinates = {
      "us":[22,42], "usa":[22,42], "united states":[22,42], "united states of america":[22,42],
      "canada":[20,27], "mexico":[19,54], "brazil":[33,72], "uk":[46,36], "united kingdom":[46,36],
      "france":[48,42], "germany":[51,38], "italy":[52,47], "spain":[46,47], "netherlands":[50,36],
      "china":[72,46], "hong kong":[75,53], "japan":[84,45], "singapore":[73,67], "thailand":[72,59],
      "vietnam":[75,60], "indonesia":[76,72], "india":[65,56], "australia":[82,80], "uae":[59,53]
    };
    if(coordinates[key]) return coordinates[key];
    const seed = Math.abs([...key].reduce((sum, char) => sum + char.charCodeAt(0), 0));
    return [18 + (seed % 68), 28 + ((seed >> 3) % 48)];
  }

  function exhibitionCountryCode(country){
    const key = String(country || "").toLowerCase().replace(/\./g, "").trim();
    const codes = {
      "us":"us", "usa":"us", "united states":"us", "united states of america":"us", "china":"cn", "mainland china":"cn", "prc":"cn",
      "hk":"hk", "hong kong":"hk", "japan":"jp", "singapore":"sg", "south korea":"kr", "korea":"kr", "thailand":"th",
      "germany":"de", "saudi arabia":"sa", "taiwan":"tw", "poland":"pl", "turkey":"tr", "austria":"at", "australia":"au",
      "france":"fr", "italy":"it", "spain":"es", "united kingdom":"gb", "uk":"gb", "canada":"ca", "mexico":"mx",
      "brazil":"br", "uae":"ae", "united arab emirates":"ae", "vietnam":"vn", "india":"in", "indonesia":"id", "malaysia":"my", "netherlands":"nl"
    };
    return codes[key] || key.slice(0, 2);
  }

  function renderWorldMapSvg(countries){
    const selectedCode = exhibitionCountryCode(getSelectedCountry());
    const codeToCountry = new Map();
    countries.forEach(([country]) => {
      const code = exhibitionCountryCode(country);
      if(code) codeToCountry.set(code, country);
    });
    const decorate = (tag, id) => {
      const country = codeToCountry.get(id);
      const classes = ["world-country"];
      if(country) classes.push("has-data");
      if(country && id === selectedCode) classes.push("selected");
      const data = country ? ` data-ex-country="${escapeAttr(country)}" data-tip="${escapeAttr(`${country}: exhibition country`)}"` : "";
      return `<${tag} id="${id}" class="${classes.join(" ")}"${data}`;
    };
    return worldMapSvg
      .replace("<svg ", `<svg class="simple-world-map" role="img" aria-label="World map with exhibition countries" `)
      .replace(/<path id="([^"]+)"/g, (match, id) => decorate("path", id))
      .replace(/<g id="([^"]+)"/g, (match, id) => decorate("g", id));
  }

  function countBy(rows, getter){
    const counts = new Map();
    rows.forEach(row => { const key = getter(row) || "Unknown"; counts.set(key, (counts.get(key) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
  }

  function renderExhibitionBars(items, limit = 8){
    const shown = items.slice(0, limit);
    const max = Math.max(1, ...shown.map(item => item[1]));
    return `<div class="exhibition-bars">${shown.map(([name, count]) => `<div class="ex-bar-row"><span title="${escapeAttr(name)}">${escapeHtml(name)}</span><span class="ex-bar-track"><span class="ex-bar-fill" style="display:block;width:${Math.max(6, count / max * 100)}%"></span></span><b>${count}</b></div>`).join("")}</div>`;
  }

  function renderExhibitionEditor(){
    if(!E.exhibitionEditBody) return;
    E.exhibitionEditBody.innerHTML = getExhibitions().map((row, index) => `
      <tr>
        <td contenteditable data-ex-i="${index}" data-ex-k="showName">${escapeHtml(row.showName)}</td><td contenteditable data-ex-i="${index}" data-ex-k="date">${escapeHtml(row.date)}</td>
        <td contenteditable data-ex-i="${index}" data-ex-k="country">${escapeHtml(row.country)}</td><td contenteditable data-ex-i="${index}" data-ex-k="location">${escapeHtml(row.location)}</td>
        <td contenteditable data-ex-i="${index}" data-ex-k="salesResponsible">${escapeHtml(row.salesResponsible)}</td><td contenteditable data-ex-i="${index}" data-ex-k="category">${escapeHtml(row.category)}</td>
        <td contenteditable data-ex-i="${index}" data-ex-k="businessModel">${escapeHtml(row.businessModel)}</td><td contenteditable data-ex-i="${index}" data-ex-k="attendance">${escapeHtml(row.attendance)}</td>
        <td contenteditable data-ex-i="${index}" data-ex-k="website">${escapeHtml(row.website)}</td><td contenteditable data-ex-i="${index}" data-ex-k="remark">${escapeHtml(row.remark)}</td>
        <td><button type="button" data-exhibition-delete="${index}" style="width:auto;padding:6px 10px;color:#ef4444;background:#fff1f2;border-color:#fecaca">Delete</button></td>
      </tr>`).join("");
  }

  function renderExhibitionView(){
    if(!E.exhibitionDashboard) return;
    const allRows = getExhibitions().map(normalizeExhibition).filter(row => row.showName || row.date || row.country);
    if(!allRows.length){ E.exhibitionDashboard.innerHTML = `<div class="exhibition-panel"><h3>No exhibition data yet</h3><p>Upload exhibition CSV in Data Editor to populate this map, charts, and editable event list.</p></div>`; return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isPastExhibition = row => { const date = new Date(normalizeTime(row.date)); if(Number.isNaN(date.getTime())) return false; date.setHours(0, 0, 0, 0); return date < today; };
    const pastRows = allRows.filter(isPastExhibition);
    const rows = getShowPast() ? allRows : allRows.filter(row => !isPastExhibition(row));
    const selectedCountryLower = getSelectedCountry().trim().toLowerCase();
    const displayRows = selectedCountryLower ? rows.filter(row => String(row.country || "").trim().toLowerCase() === selectedCountryLower) : rows;
    const countries = countBy(rows, row => row.country), categories = countBy(rows, row => row.category);
    const monthsList = countBy(rows, row => exhibitionMonth(row.date)).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const models = countBy(rows, row => row.businessModel);
    const attended = rows.filter(row => /^(yes|y|true|attend|attended)$/i.test(String(row.attendance || "").trim())).length;
    const next = rows.map(row => ({ row, date:new Date(row.date) })).filter(item => !Number.isNaN(item.date.getTime()) && item.date >= today).sort((a, b) => a.date - b.date)[0]?.row;
    const listRows = displayRows.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map(row => `<tr><td>${escapeHtml(row.showName || "-")}${isPastExhibition(row) ? `<span class="past-badge">Past</span>` : ""}</td><td>${escapeHtml(exhibitionDateLabel(row.date))}</td><td>${escapeHtml(row.country || "-")}</td><td>${escapeHtml(row.location || "-")}</td><td>${escapeHtml(row.category || "-")}</td><td>${escapeHtml(row.businessModel || "-")}</td><td>${row.website ? `<a href="${escapeAttr(safeUrl(row.website))}" target="_blank" rel="noreferrer">Website</a>` : "-"}</td></tr>`).join("");
    E.exhibitionDashboard.innerHTML = `
      <div class="exhibition-toolbar"><button type="button" class="exhibition-toggle-past" data-toggle-past-exhibitions>${getShowPast() ? "Hide Past Exhibitions" : `Show Past Exhibitions (${pastRows.length})`}</button></div>
      <div class="exhibition-kpis"><div class="exhibition-kpi"><small>${getShowPast() ? "Total Shows" : "Upcoming Shows"}</small><b>${rows.length}</b></div><div class="exhibition-kpi"><small>Countries</small><b>${countries.length}</b></div><div class="exhibition-kpi"><small>Attendence Yes</small><b>${attended}</b></div><div class="exhibition-kpi"><small>Next Show</small><b style="font-size:15px">${escapeHtml(next ? next.showName : "-")}</b></div></div>
      <div class="exhibition-grid"><section class="exhibition-panel"><h3>Exhibition World Map</h3><p>${getSelectedCountry() ? `Filtering list by ${escapeHtml(getSelectedCountry())}.` : "Click a country pin or chip to filter the exhibition list."}</p><div class="map-wrap">${renderWorldMapSvg(countries)}</div><div class="map-attribution">Map source: <a href="https://github.com/flekschas/simple-world-map" target="_blank" rel="noreferrer">simple-world-map</a> by Fritz Lekschas / Al MacDonald.</div><div class="map-country-list"><button type="button" class="country-chip clear ${getSelectedCountry() ? "" : "active"}" data-ex-country="">All Countries <b>${rows.length}</b></button>${countries.map(([country, count]) => `<button type="button" class="country-chip ${selectedCountryLower && String(country).trim().toLowerCase() === selectedCountryLower ? "active" : ""}" data-ex-country="${escapeAttr(country)}">${escapeHtml(country)} <b>${count}</b></button>`).join("")}</div></section><section class="exhibition-panel"><h3>Category Mix</h3><p>Shows grouped by product/category focus.</p>${renderExhibitionBars(categories)}</section></div>
      <div class="exhibition-grid"><section class="exhibition-panel"><h3>Monthly Exhibition Timeline</h3><p>Number of exhibitions by month.</p>${renderExhibitionBars(monthsList, 12)}</section><section class="exhibition-panel"><h3>OEM / ODM Mix</h3><p>Business model distribution from uploaded rows.</p>${renderExhibitionBars(models)}</section></div>
      <section class="exhibition-panel"><h3>Exhibition List</h3><p>${getSelectedCountry() ? `${displayRows.length} exhibition(s) in ${escapeHtml(getSelectedCountry())}.` : "Manage details in Data Editor. This list updates automatically."}</p><div class="exhibition-table-wrap"><table><thead><tr><th>Show Name</th><th>Date</th><th>Country</th><th>Location</th><th>Category</th><th>OEM/ODM</th><th>Website</th></tr></thead><tbody>${listRows || `<tr><td colspan="7">No exhibitions for this country.</td></tr>`}</tbody></table></div></section>`;
  }

  return { normalizeExhibition, exhibitionCsvMap, upsertExhibitions, renderExhibitionEditor, renderExhibitionView };
}
