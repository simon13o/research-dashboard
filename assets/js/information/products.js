export function createProductInformationRenderer({
  E,
  unique,
  escapeHtml,
  escapeAttr,
  getData,
  getProductIntro,
  getEditMode,
  getSearchText,
  getCategoryFilter,
  getBrandFilter,
  setCategoryFilter,
  setBrandFilter
}) {
  function productInfoRows(){
    const rows = new Map();
    getData().forEach(item => {
      const brand = item.brand || "";
      const product = item.product || "";
      if(!brand || !product) return;
      const key = `${brand}||${product}`;
      if(!rows.has(key)) rows.set(key, { key, brand, product, category:item.category || "", units:0, revenue:0 });
      const row = rows.get(key);
      row.units += Number(item.units) || 0;
      row.revenue += (Number(item.units) || 0) * (Number(item.price) || 0);
      if(!row.category && item.category) row.category = item.category;
    });
    return [...rows.values()].sort((a, b) => a.brand.localeCompare(b.brand) || a.product.localeCompare(b.product));
  }

  function currentIntroKey(){
    const brand = E.introBrand.value || "";
    const product = E.introProduct.value || "";
    return brand && product ? `${brand}||${product}` : "";
  }

  function renderProductInfoLibrary(){
    if(!E.productInfoLibrary) return;
    const rows = productInfoRows();
    const categories = unique(rows.map(x => x.category).filter(Boolean)).sort();
    const brands = unique(rows.map(x => x.brand).filter(Boolean)).sort();
    if(E.productInfoCategoryFilter){
      const current = categories.includes(getCategoryFilter()) ? getCategoryFilter() : "";
      setCategoryFilter(current);
      E.productInfoCategoryFilter.innerHTML = `<option value="">All Categories</option>${categories.map(c => `<option value="${escapeAttr(c)}" ${c === current ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}`;
    }
    if(E.productInfoBrandFilter){
      const availableBrands = getCategoryFilter() ? unique(rows.filter(x => x.category === getCategoryFilter()).map(x => x.brand).filter(Boolean)).sort() : brands;
      const current = availableBrands.includes(getBrandFilter()) ? getBrandFilter() : "";
      setBrandFilter(current);
      E.productInfoBrandFilter.innerHTML = `<option value="">All Brands</option>${availableBrands.map(b => `<option value="${escapeAttr(b)}" ${b === current ? "selected" : ""}>${escapeHtml(b)}</option>`).join("")}`;
    }
    const query = getSearchText().trim().toLowerCase();
    const intros = getProductIntro();
    const filteredRows = rows.filter(row => {
      if(getCategoryFilter() && row.category !== getCategoryFilter()) return false;
      if(getBrandFilter() && row.brand !== getBrandFilter()) return false;
      if(!query) return true;
      const intro = intros[row.key] || {};
      return [row.product, row.brand, row.category, intro.text || ""].join(" ").toLowerCase().includes(query);
    });
    const selectedKey = currentIntroKey();
    if(E.productInfoCount) E.productInfoCount.textContent = (query || getCategoryFilter() || getBrandFilter()) ? `Matched: ${filteredRows.length} / ${rows.length}` : `${rows.length} product${rows.length === 1 ? "" : "s"}`;
    if(!rows.length){
      E.productInfoLibrary.innerHTML = `<div class="empty">Upload sales CSV first. Products will appear here automatically.</div>`;
      return;
    }
    if(!filteredRows.length){
      E.productInfoLibrary.innerHTML = `<div class="empty">No products match the current search or filter.</div>`;
      return;
    }
    E.productInfoLibrary.innerHTML = filteredRows.map(row => {
      const intro = intros[row.key] || {};
      const hasInfo = Boolean(intro.imageDataUrl || intro.text);
      const thumb = intro.imageDataUrl ? `<img src="${intro.imageDataUrl}" alt="${escapeAttr(row.product)}">` : escapeHtml((row.product || row.brand || "?").slice(0, 1).toUpperCase());
      return `
        <button class="product-info-card ${row.key === selectedKey ? "active" : ""}" type="button" data-product-info-key="${escapeAttr(row.key)}" data-brand="${escapeAttr(row.brand)}" data-product="${escapeAttr(row.product)}">
          <span class="product-info-thumb">${thumb}</span>
          <span class="product-info-main"><strong title="${escapeAttr(row.product)}">${escapeHtml(row.product)}</strong><span>${escapeHtml(row.brand)}${row.category ? ` · ${escapeHtml(row.category)}` : ""}</span></span>
          <span class="product-info-status ${hasInfo ? "" : "empty-state"}">${hasInfo ? "Saved" : "Empty"}</span>
        </button>
      `;
    }).join("");
  }

  function refreshIntroSelectors(){
    const brands = unique(getData().map(x => x.brand)).filter(Boolean).sort();
    const currentBrand = E.introBrand.value;
    E.introBrand.innerHTML = brands.map(b => `<option value="${escapeAttr(b)}" ${b === currentBrand ? "selected" : ""}>${escapeHtml(b)}</option>`).join("");
    if(!E.introBrand.value && brands.length) E.introBrand.value = brands[0];
    const products = unique(getData().filter(x => x.brand === E.introBrand.value).map(x => x.product)).filter(Boolean).sort();
    const currentProduct = E.introProduct.value;
    E.introProduct.innerHTML = products.map(p => `<option value="${escapeAttr(p)}" ${p === currentProduct ? "selected" : ""}>${escapeHtml(p)}</option>`).join("");
    if(!E.introProduct.value && products.length) E.introProduct.value = products[0];
    renderIntroPreview();
    renderProductInfoLibrary();
  }

  function renderIntroPreview(){
    const key = currentIntroKey();
    const intros = getProductIntro();
    const intro = key ? intros[key] : null;
    const brand = E.introBrand.value || "";
    const product = E.introProduct.value || "";
    if(E.introEditForm) E.introEditForm.hidden = !getEditMode();
    if(E.introEditToggle){
      const hasInfo = Boolean(intro && (intro.imageDataUrl || intro.text));
      E.introEditToggle.textContent = hasInfo ? "Edit Product Info" : "Add Product Info";
      E.introEditToggle.hidden = !key;
    }
    if(!key){
      if(E.introDetail) E.introDetail.innerHTML = `<div class="product-detail-empty"><div><b>No product selected</b><span>Upload sales CSV and choose a product from the library.</span></div></div>`;
      E.introPreview.innerHTML = `<div class="empty">Select a product from the library to edit its information.</div>`;
      E.introText.value = "";
      return;
    }
    E.introText.value = intro ? (intro.text || "") : "";
    const hasImage = Boolean(intro && intro.imageDataUrl);
    const hasText = Boolean(intro && intro.text);
    const imageBlock = hasImage ? `<img src="${intro.imageDataUrl}" alt="${escapeAttr(product)}">` : escapeHtml((product || brand || "?").slice(0, 1).toUpperCase());
    const notes = hasText ? escapeHtml(intro.text) : `<span style="color:#94a3b8">No product notes saved yet. Use Add Product Info to attach images and research notes.</span>`;
    if(E.introDetail){
      const match = getData().find(x => x.brand === brand && x.product === product);
      E.introDetail.innerHTML = `
        <div class="product-detail-hero">
          <div class="product-detail-image">${imageBlock}</div>
          <div class="product-detail-copy">
            <div class="product-detail-kicker">Product Research Profile</div>
            <h3>${escapeHtml(product)}</h3>
            <div class="product-detail-meta"><span>${escapeHtml(brand)}</span>${match && match.category ? `<span>${escapeHtml(match.category)}</span>` : ""}</div>
            <div class="product-detail-notes">${notes}</div>
          </div>
        </div>
      `;
    }
    const imagePreview = hasImage ? `<img src="${intro.imageDataUrl}" alt="product image">` : "<div class='empty'>No image uploaded yet.</div>";
    const textPreview = hasText ? `<div style="margin-top:8px">${escapeHtml(intro.text)}</div>` : "<div class='empty' style='margin-top:8px'>No product notes saved yet.</div>";
    E.introPreview.innerHTML = `<div style="font-weight:800;color:#0f172a;margin-bottom:8px">${escapeHtml(product)} <span style="color:#94a3b8;font-weight:700">(${escapeHtml(brand)})</span></div>${imagePreview}${textPreview}`;
  }

  return { currentIntroKey, renderProductInfoLibrary, refreshIntroSelectors, renderIntroPreview };
}
