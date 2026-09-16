import { COLOR_OPTIONS } from "../config.js";

export function createSalesEditor({
  E,
  escapeHtml,
  escapeAttr,
  unique,
  monthKey,
  inferProductGroup,
  normalizeRow,
  toNumber,
  getData,
  setData,
  getBrandColors,
  ensureBrandColor,
  saveState,
  renderAll,
  scheduleCloudSync
}) {
  let searchText = "";
  let filters = { category:"", brand:"", product:"", month:"" };
  let sort = { key:"", dir:"asc" };
  const selectedRows = new Set();
  let visibleRows = [];

  function renderColorOptions() {
    E.colorList.innerHTML = "";
    const data = getData();
    const colors = getBrandColors();
    const brands = unique(data.map(row => row.brand)).filter(Boolean).sort();
    E.colorEmpty.hidden = brands.length !== 0;
    brands.forEach(brand => {
      ensureBrandColor(brand);
      const item = document.createElement("div");
      item.className = "color-item";
      item.innerHTML = `
        <span>${escapeHtml(brand)}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <select class="color-select" style="width:140px">
            ${COLOR_OPTIONS.map(option => `<option value="${option.value}" ${option.value.toLowerCase() === colors[brand].toLowerCase() ? "selected" : ""}>${option.label}</option>`).join("")}
          </select>
          <div class="color-swatch" style="width:22px;height:22px;border-radius:5px;border:1px solid var(--bd);background:${colors[brand]}"></div>
        </div>`;
      const select = item.querySelector(".color-select");
      const swatch = item.querySelector(".color-swatch");
      select.addEventListener("change", event => {
        colors[brand] = event.target.value;
        swatch.style.background = colors[brand];
        saveState();
        renderAll();
      });
      E.colorList.appendChild(item);
    });
  }

  function fillSelect(element, values, current, allLabel) {
    const safeCurrent = values.includes(current) ? current : "";
    element.innerHTML = `<option value="">${allLabel}</option>${values.map(value => `<option value="${escapeAttr(value)}" ${value === safeCurrent ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
    return safeCurrent;
  }

  function renderTable() {
    const data = getData();
    E.editBody.innerHTML = "";
    const categories = unique(data.map(row => row.category).filter(Boolean)).sort();
    filters.category = fillSelect(E.editorCategoryFilter, categories, filters.category, "All Categories");
    const categoryRows = filters.category ? data.filter(row => row.category === filters.category) : data;
    const brands = unique(categoryRows.map(row => row.brand).filter(Boolean)).sort();
    filters.brand = fillSelect(E.editorBrandFilter, brands, filters.brand, "All Brands");
    const brandRows = categoryRows.filter(row => !filters.brand || row.brand === filters.brand);
    const products = unique(brandRows.map(row => row.product).filter(Boolean)).sort();
    filters.product = fillSelect(E.editorProductFilter, products, filters.product, "All Products");
    const productRows = brandRows.filter(row => !filters.product || row.product === filters.product);
    const months = unique(productRows.map(row => monthKey(row.time)).filter(Boolean)).sort();
    filters.month = fillSelect(E.editorMonthFilter, months, filters.month, "All Months");

    const query = searchText.trim().toLowerCase();
    let rows = data.map((row, index) => ({ row, index })).filter(({ row }) => {
      if(filters.category && row.category !== filters.category) return false;
      if(filters.brand && row.brand !== filters.brand) return false;
      if(filters.product && row.product !== filters.product) return false;
      if(filters.month && monthKey(row.time) !== filters.month) return false;
      return !query || [row.category, row.brand, row.product, row.productGroup, row.time].join(" ").toLowerCase().includes(query);
    });
    if(sort.key) {
      const direction = sort.dir === "desc" ? -1 : 1;
      rows = rows.slice().sort((left, right) => {
        const numeric = sort.key === "saleUnits" || sort.key === "price";
        const a = numeric ? Number(left.row[sort.key]) || 0 : String(left.row[sort.key] || "").toLowerCase();
        const b = numeric ? Number(right.row[sort.key]) || 0 : String(right.row[sort.key] || "").toLowerCase();
        return a < b ? -direction : a > b ? direction : left.index - right.index;
      });
    }
    E.editorRowCount.textContent = `Showing ${rows.length} / ${data.length}`;
    [...selectedRows].filter(index => index < 0 || index >= data.length).forEach(index => selectedRows.delete(index));
    visibleRows = rows.map(({ index }) => index);
    const selectedVisible = visibleRows.filter(index => selectedRows.has(index)).length;
    E.editorSelectAll.checked = visibleRows.length > 0 && selectedVisible === visibleRows.length;
    E.editorSelectAll.indeterminate = selectedVisible > 0 && selectedVisible < visibleRows.length;
    E.editorSelectAll.disabled = visibleRows.length === 0;
    E.editorBulkToolbar.classList.toggle("has-selection", selectedRows.size > 0);
    E.editorBulkCount.textContent = `${selectedRows.size} row${selectedRows.size === 1 ? "" : "s"} selected`;
    if(!selectedRows.size) closeBulkMenu();
    E.editorSortBtns.forEach(button => {
      const active = button.dataset.sortKey === sort.key;
      button.classList.toggle("active", active);
      const indicator = button.querySelector(".sort-indicator");
      if(indicator) indicator.textContent = active ? (sort.dir === "asc" ? "↑" : "↓") : "↕";
    });
    rows.forEach(({ row, index }) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="editor-select-cell"><input class="editor-row-select" type="checkbox" data-row-index="${index}" ${selectedRows.has(index) ? "checked" : ""} aria-label="Select row"></td><td contenteditable data-i="${index}" data-k="category">${escapeHtml(row.category)}</td><td class="brand-cell" contenteditable data-i="${index}" data-k="brand"><span class="brand-text">${escapeHtml(row.brand)}</span><button class="brand-color-trigger" type="button" contenteditable="false" data-brand="${escapeAttr(row.brand)}" title="Brand color" aria-label="Edit brand color"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18h1.1a2.1 2.1 0 0 0 1.49-3.58.9.9 0 0 1 .64-1.53H17a4 4 0 0 0 4-4C21 7 17 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7.5" cy="10" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="14" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="11" r="1.2" fill="currentColor"/></svg></button></td><td contenteditable data-i="${index}" data-k="product">${escapeHtml(row.product)}</td><td contenteditable data-i="${index}" data-k="productGroup">${escapeHtml(row.productGroup || inferProductGroup(row.product))}</td><td contenteditable data-i="${index}" data-k="time">${escapeHtml(row.time)}</td><td contenteditable data-i="${index}" data-k="saleUnits">${row.saleUnits}</td><td contenteditable data-i="${index}" data-k="price">${row.price.toFixed(2)}</td>`;
      E.editBody.appendChild(tr);
    });
  }

  function closeBulkMenu() {
    E.editorBulkMenu.classList.remove("open");
    E.editorBulkMore.setAttribute("aria-expanded", "false");
  }

  function closeColorPopover() {
    E.brandColorPopover.hidden = true;
    E.brandColorPopover.innerHTML = "";
  }

  function openColorPopover(brand, anchor) {
    if(!brand) return;
    const colors = getBrandColors();
    ensureBrandColor(brand);
    E.brandColorPopover.innerHTML = `<b>${escapeHtml(brand)}</b><input type="color" value="${escapeAttr(colors[brand])}" data-brand="${escapeAttr(brand)}"><div class="brand-color-swatches">${COLOR_OPTIONS.map(option => `<button type="button" class="brand-color-swatch" style="background:${option.value}" data-brand="${escapeAttr(brand)}" data-color="${option.value}" title="${escapeAttr(option.label)}"></button>`).join("")}</div>`;
    const rect = anchor.getBoundingClientRect();
    E.brandColorPopover.style.left = `${Math.min(window.innerWidth - 200, rect.right + 8)}px`;
    E.brandColorPopover.style.top = `${Math.min(window.innerHeight - 160, rect.top - 6)}px`;
    E.brandColorPopover.hidden = false;
  }

  function updateBrandColor(brand, color) {
    if(!brand || !color) return;
    getBrandColors()[brand] = color;
    saveState();
    renderAll();
  }

  function commitData(nextData, delay = 800) {
    setData(nextData);
    saveState();
    renderAll();
    scheduleCloudSync(delay);
  }

  function bindEvents() {
    E.editorSearch.addEventListener("input", () => { searchText = E.editorSearch.value || ""; renderTable(); });
    E.editorCategoryFilter.addEventListener("change", () => { filters = { category:E.editorCategoryFilter.value || "", brand:"", product:"", month:"" }; renderTable(); });
    E.editorBrandFilter.addEventListener("change", () => { filters.brand = E.editorBrandFilter.value || ""; filters.product = ""; filters.month = ""; renderTable(); });
    E.editorProductFilter.addEventListener("change", () => { filters.product = E.editorProductFilter.value || ""; filters.month = ""; renderTable(); });
    E.editorMonthFilter.addEventListener("change", () => { filters.month = E.editorMonthFilter.value || ""; renderTable(); });
    E.editorSortBtns.forEach(button => button.addEventListener("click", () => {
      const key = button.dataset.sortKey || "";
      sort = sort.key === key ? { key, dir:sort.dir === "asc" ? "desc" : "asc" } : { key, dir:"asc" };
      renderTable();
    }));
    E.editorSelectAll.addEventListener("change", () => {
      visibleRows.forEach(index => E.editorSelectAll.checked ? selectedRows.add(index) : selectedRows.delete(index));
      renderTable();
    });
    E.editorBulkApply.addEventListener("click", () => {
      if(!selectedRows.size) return alert("Please select at least one row first.");
      const field = E.editorBulkField.value || "";
      const entered = E.editorBulkValue.value.trim();
      if(!field) return alert("Please choose a field to update.");
      if(!entered) return alert("Please enter a new value.");
      let value = entered;
      if(field === "saleUnits") { value = Math.max(0, Math.round(Number(entered))); if(!Number.isFinite(value)) return alert("Sales Units must be a number."); }
      if(field === "price") { value = Math.max(0, Number(entered)); if(!Number.isFinite(value)) return alert("Price must be a number."); }
      const next = getData().map((row, index) => selectedRows.has(index) ? normalizeRow({ ...row, [field]:value }) : row);
      E.editorBulkValue.value = "";
      commitData(next, 300);
    });
    E.editorBulkMore.addEventListener("click", event => { event.stopPropagation(); const open = !E.editorBulkMenu.classList.contains("open"); E.editorBulkMenu.classList.toggle("open", open); E.editorBulkMore.setAttribute("aria-expanded", String(open)); });
    E.editorBulkClear.addEventListener("click", () => { selectedRows.clear(); closeBulkMenu(); renderTable(); });
    E.editorBulkDelete.addEventListener("click", () => {
      if(!selectedRows.size) return alert("Please select at least one row first.");
      if(!confirm(`Delete ${selectedRows.size} selected row(s)? This cannot be undone.`)) return;
      const next = getData().filter((_, index) => !selectedRows.has(index));
      selectedRows.clear(); closeBulkMenu(); commitData(next, 300);
    });
    E.editBody.addEventListener("blur", event => {
      const cell = event.target;
      if(!(cell instanceof HTMLElement) || !cell.matches("td[contenteditable]")) return;
      const index = Number(cell.dataset.i), key = cell.dataset.k;
      const value = (cell.querySelector(".brand-text")?.textContent || cell.textContent || "").trim();
      const data = getData();
      if(!Number.isFinite(index) || index < 0 || index >= data.length) return;
      const nextValue = key === "saleUnits" ? Math.max(0, Math.round(toNumber(value) || 0)) : key === "price" ? Math.max(0, toNumber(value) || 0) : value;
      const next = data.map((row, rowIndex) => rowIndex === index ? normalizeRow({ ...row, [key]:nextValue }) : row);
      commitData(next);
    }, true);
    E.editBody.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const checkbox = target?.closest(".editor-row-select");
      if(checkbox) { const index = Number(checkbox.dataset.rowIndex); if(Number.isFinite(index)) checkbox.checked ? selectedRows.add(index) : selectedRows.delete(index); renderTable(); return; }
      const button = target?.closest(".brand-color-trigger");
      if(button) { event.preventDefault(); event.stopPropagation(); openColorPopover(button.dataset.brand || "", button); }
    });
    E.brandColorPopover.addEventListener("click", event => event.stopPropagation());
    E.brandColorPopover.addEventListener("input", event => { const input = event.target; if(input instanceof HTMLInputElement && input.type === "color") updateBrandColor(input.dataset.brand || "", input.value); });
    E.brandColorPopover.addEventListener("click", event => { const swatch = event.target instanceof Element ? event.target.closest(".brand-color-swatch") : null; if(swatch) { updateBrandColor(swatch.dataset.brand || "", swatch.dataset.color || ""); closeColorPopover(); } });
    document.addEventListener("click", event => { if(!E.editorBulkMenu.contains(event.target) && event.target !== E.editorBulkMore) closeBulkMenu(); closeColorPopover(); });
  }

  return { renderTable, renderColorOptions, bindEvents, clearSelection:() => selectedRows.clear() };
}
