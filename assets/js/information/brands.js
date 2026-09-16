export function createBrandPortfolioRenderer({
  E,
  unique,
  escapeHtml,
  escapeAttr,
  initials,
  brandProfileId,
  safeUrl,
  observeRevealCards,
  getBrandProfiles,
  getSearch,
  getHq,
  setHq
}) {
  function brandCardHtml(profile, index){
    const name = String(profile.brand_name || "Unnamed Brand").trim();
    const id = String(profile.brand_id || brandProfileId(index)).trim();
    const products = Array.isArray(profile.key_products) ? profile.key_products.filter(Boolean) : [];
    const phones = Array.isArray(profile.phones) ? profile.phones.filter(Boolean) : [];
    const emails = Array.isArray(profile.emails) ? profile.emails.filter(Boolean) : [];
    const hasContact = String(profile.contact_name || "").trim().length > 0;
    const site = String(profile.official_site || "").trim();
    const phoneBadges = phones.map(p => `<a class="contact-badge" href="tel:${escapeAttr(p)}">${escapeHtml(p)}</a>`).join("");
    const emailBadges = emails.map(e => `<a class="contact-badge" href="mailto:${escapeAttr(e)}">${escapeHtml(e)}</a>`).join("");
    return `
      <div class="brand-card reveal-card" data-brand-index="${index}">
        <div class="brand-actions" aria-label="Brand actions">
          <button class="brand-action-btn edit" type="button" data-brand-edit="${index}" title="Edit Profile" aria-label="Edit ${escapeAttr(name)}">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m13.5 7.5 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="brand-action-btn delete" type="button" data-brand-delete="${index}" title="Delete" aria-label="Delete ${escapeAttr(name)}">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div>
          <div class="brand-card-top">
            <div class="brand-avatar">${escapeHtml(initials(name))}</div>
            <div>
              <h3>${escapeHtml(name)}</h3>
              <div class="brand-id">ID: ${escapeHtml(id)}</div>
            </div>
          </div>
          <div class="brand-meta">
            <div class="brand-meta-row"><span>HQ Location</span><span>${escapeHtml(profile.hq_location || "-")}</span></div>
            <div class="brand-meta-row"><span>Official Site</span>${site ? `<a href="${escapeAttr(safeUrl(site))}" target="_blank" rel="noreferrer">${escapeHtml(site)}</a>` : `<span>-</span>`}</div>
            <div>
              <span class="brand-section-label">Key Products</span>
              <div class="brand-tags" style="margin-top:8px">${products.length ? products.map(p => `<span class="brand-tag">${escapeHtml(p)}</span>`).join("") : `<span class="empty">No product tags.</span>`}</div>
            </div>
          </div>
        </div>
        <div class="brand-contact">
          ${hasContact ? `
            <div class="contact-person">
              <div class="contact-avatar">${escapeHtml(initials(profile.contact_name))}</div>
              <div><b>${escapeHtml(profile.contact_name)}</b><span>${escapeHtml(profile.contact_position || "Contact")}</span></div>
            </div>
          ` : `
            <div class="general-contact">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.42-4.03 8-9 8-1.5 0-2.91-.32-4.17-.9L3 20l1.35-3.6A7.16 7.16 0 0 1 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              General HQ Contacts
            </div>
          `}
          <div class="contact-badges">${phoneBadges || emailBadges ? `${phoneBadges}${emailBadges}` : `<span class="empty">No contact channel.</span>`}</div>
        </div>
      </div>
    `;
  }

  function brandMatchesLocalFilters(profile){
    const q = getSearch().trim().toLowerCase();
    const hq = getHq().trim().toLowerCase();
    const products = Array.isArray(profile.key_products) ? profile.key_products : [];
    const text = [profile.brand_name || "", ...products].join(" ").toLowerCase();
    const profileHq = String(profile.hq_location || "").trim().toLowerCase();
    return (!q || text.includes(q)) && (!hq || profileHq === hq);
  }

  function renderBrandHqFilter(){
    if(!E.brandHqFilter) return;
    const current = getHq();
    const locations = unique(getBrandProfiles().map(x => String(x.hq_location || "").trim()).filter(Boolean)).sort();
    E.brandHqFilter.innerHTML = `<option value="">All Locations</option>${locations.map(loc => `<option value="${escapeAttr(loc)}">${escapeHtml(loc)}</option>`).join("")}`;
    E.brandHqFilter.value = locations.some(x => x.toLowerCase() === current.toLowerCase()) ? locations.find(x => x.toLowerCase() === current.toLowerCase()) : "";
    setHq(E.brandHqFilter.value);
  }

  function renderBrandPortfolio(){
    if(!E.brandPortfolioGrid) return;
    renderBrandHqFilter();
    const profiles = getBrandProfiles();
    const matched = profiles.map((profile, index) => ({ profile, index })).filter(x => brandMatchesLocalFilters(x.profile));
    if(getSearch() || getHq()) E.brandProfileCountText.innerHTML = `Matched: <b>${matched.length}</b> / ${profiles.length}`;
    else E.brandProfileCountText.innerHTML = `Total Linked Brands: <b>${profiles.length}</b>`;
    const addCard = `
      <button class="brand-add-card reveal-card" id="addBrandCard" type="button">
        <span class="brand-add-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></span>
        <b>Add New Brand</b>
        <small>Create a new company profile and contact network</small>
      </button>
    `;
    const emptyState = matched.length ? "" : `<div class="brand-card reveal-card"><div><h3>No matching brands</h3><p class="empty">Try another brand name, tag, or HQ location.</p></div></div>`;
    E.brandPortfolioGrid.innerHTML = addCard + (matched.length ? matched.map(x => brandCardHtml(x.profile, x.index)).join("") : emptyState);
    observeRevealCards(E.brandPortfolioGrid);
  }

  return { renderBrandPortfolio };
}
