export function createFilterControls({
  E,
  getData,
  getMonths,
  selection,
  unique,
  monthToNumber,
  escapeHtml,
  renderAll,
  getActiveDropdownType
}){
  const data = () => getData();

  function renderDropdown(targetEl, type, options){
    const selected = selection[type];
    const title = selected.size ? `${selected.size} selected` : "Select...";
    targetEl.innerHTML = `
      <button type="button" class="dd-btn">${title}</button>
      <div class="dd-menu">
        <div class="dd-tools">
          <button type="button" class="tiny" data-act="all">All</button>
          <button type="button" class="tiny" data-act="clear">Clear</button>
        </div>
        ${options.map(v => `<label class="opt"><input type="checkbox" value="${escapeHtml(v)}" ${selected.has(v)?"checked":""}>${escapeHtml(v)}</label>`).join("")}
      </div>
    `;
    targetEl.classList.toggle("open", getActiveDropdownType() === type);
  }

  function renderChips(type, wrap){
    wrap.innerHTML = "";
    [...selection[type]].sort().forEach(v => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = `<span>${escapeHtml(v)}</span><button type="button">x</button>`;
      chip.querySelector("button").addEventListener("click", () => {
        selection[type].delete(v);
        if(type === "category") syncScopedOptions();
        renderAll();
      });
      wrap.appendChild(chip);
    });
  }

  function refreshFilterUI(){
    const allCat = unique(data().map(x => x.category)).filter(Boolean).sort();
    [...selection.category].forEach(v => { if(!allCat.includes(v)) selection.category.delete(v); });

    const scoped = data().filter(r => selection.category.has(r.category));
    const allBrand = unique(scoped.map(x => x.brand)).filter(Boolean).sort();
    const scopedByBrand = scoped.filter(r => selection.brand.has(r.brand));
    const allProduct = unique(scopedByBrand.map(x => x.product)).filter(Boolean).sort();
    [...selection.brand].forEach(v => { if(!allBrand.includes(v)) selection.brand.delete(v); });
    [...selection.product].forEach(v => { if(!allProduct.includes(v)) selection.product.delete(v); });

    renderDropdown(E.catDd, "category", allCat);
    renderDropdown(E.brDd, "brand", allBrand);
    renderDropdown(E.prDd, "product", allProduct);
    renderChips("category", E.catChips);
    renderChips("brand", E.brChips);
    renderChips("product", E.prChips);
    if(E.filterSummary){
      const count = selection.category.size + selection.brand.size + selection.product.size;
      E.filterSummary.textContent = count ? `Filters ${count}` : "Filters";
    }

    const months = getMonths();
    if(months.length){
      if(!months.includes(E.from.value)) E.from.value = months[0];
      if(!months.includes(E.to.value)) E.to.value = months[months.length - 1];
    } else {
      E.from.value = "";
      E.to.value = "";
    }
  }

  function syncScopedOptions(){
    const scoped = data().filter(r => selection.category.has(r.category));
    const brandOptions = new Set(unique(scoped.map(x => x.brand)).filter(Boolean));
    const scopedByBrand = scoped.filter(x => selection.brand.has(x.brand));
    const productOptions = new Set(unique(scopedByBrand.map(x => x.product)).filter(Boolean));
    selection.brand = new Set([...selection.brand].filter(v => brandOptions.has(v)));
    selection.product = new Set([...selection.product].filter(v => productOptions.has(v)));
  }

  function filteredRows(){
    const from = monthToNumber(E.from.value || "1900-01");
    const to = monthToNumber(E.to.value || "2999-12");
    return data().filter(row => {
      const time = monthToNumber(row.time);
      return selection.category.has(row.category) && selection.brand.has(row.brand) && selection.product.has(row.product) && time >= from && time <= to;
    });
  }

  return { renderDropdown, renderChips, refreshFilterUI, syncScopedOptions, filteredRows };
}
