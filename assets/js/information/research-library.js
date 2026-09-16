export function createResearchLibraryTools({
  E,
  escapeHtml,
  escapeAttr,
  initials,
  safeUrl,
  observeRevealCards,
  getReports,
  getSearchText
}) {
  function normalizeResearchReport(report = {}){
    const rawTags = Array.isArray(report.tags) ? report.tags : String(report.tags || "").split(",");
    return {
      id:String(report.id || report.report_id || ""), title:String(report.title || ""), brand:String(report.brand || ""),
      category:String(report.category || ""), product:String(report.product || ""), summary:String(report.summary || ""),
      tags:rawTags.map(tag => String(tag || "").trim()).filter(Boolean), pptShareUrl:String(report.ppt_share_url || report.pptShareUrl || ""),
      pdfUrl:String(report.pdf_url || report.pdfUrl || ""), coverImageUrl:String(report.cover_image_url || report.coverImageUrl || ""),
      reportDate:String(report.report_date || report.reportDate || ""), opportunityLevel:String(report.opportunity_level || report.opportunityLevel || ""),
      sortOrder:Number(report.sort_order ?? report.sortOrder ?? 0) || 0, isActive:report.is_active !== false
    };
  }

  function researchReportPayload(report){
    const normalized = normalizeResearchReport(report);
    const payload = {
      title:normalized.title, brand:normalized.brand, category:normalized.category, product:normalized.product, summary:normalized.summary,
      tags:normalized.tags, ppt_share_url:normalized.pptShareUrl, pdf_url:normalized.pdfUrl, cover_image_url:normalized.coverImageUrl,
      report_date:normalized.reportDate || null, opportunity_level:normalized.opportunityLevel, sort_order:normalized.sortOrder,
      is_active:normalized.isActive, updated_at:new Date().toISOString()
    };
    if(normalized.id) payload.id = normalized.id;
    return payload;
  }

  function researchTagList(value){ return String(value || "").split(",").map(tag => tag.trim()).filter(Boolean); }

  function researchMatchesFilters(report){
    const query = getSearchText().trim().toLowerCase();
    if(!query) return true;
    return [report.title, report.brand, report.category, report.product, report.summary, report.opportunityLevel, ...(Array.isArray(report.tags) ? report.tags : [])].join(" ").toLowerCase().includes(query);
  }

  function renderResearchLibrary(){
    if(!E.researchGrid) return;
    const activeReports = getReports().map(normalizeResearchReport).filter(report => report.isActive !== false && report.title);
    const matched = activeReports.filter(researchMatchesFilters);
    if(E.researchCount) E.researchCount.textContent = getSearchText().trim() ? `Matched: ${matched.length} / ${activeReports.length}` : `${activeReports.length} reports`;
    if(E.researchEmpty) E.researchEmpty.hidden = Boolean(matched.length);
    E.researchGrid.innerHTML = matched.map(report => {
      const topTags = report.tags.slice(0, 2);
      const tags = topTags.length
        ? `<span class="research-tag-row">${topTags.map(tag => `<span class="research-tag-top" title="${escapeAttr(tag)}">${escapeHtml(tag)}</span>`).join("")}${report.tags.length > 2 ? `<span class="research-tag-more">+${report.tags.length - 2}</span>` : ""}</span>`
        : `<span class="research-tag-row"><span class="research-tag-top">${escapeHtml(report.category || "Research")}</span></span>`;
      const cover = report.coverImageUrl ? `<img src="${escapeAttr(report.coverImageUrl)}" alt="${escapeAttr(report.title)} cover">` : `<span>${escapeHtml(initials(report.title || "Report"))}</span>`;
      const ppt = report.pptShareUrl ? safeUrl(report.pptShareUrl) : "";
      const levelKey = String(report.opportunityLevel || "").toLowerCase();
      const levelIcon = levelKey === "high" ? "★★★" : levelKey === "low" ? "★" : "★★";
      const levelTitle = report.opportunityLevel ? `${report.opportunityLevel} opportunity` : "Opportunity level not set";
      return `
        <article class="research-card reveal-card" data-research-card="${escapeAttr(report.id)}">
          <div class="research-cover">${cover}</div>
          <div class="research-body">
            <div class="research-meta"><span class="research-level-icon ${escapeAttr(levelKey || "medium")}" title="${escapeAttr(levelTitle)}">${levelIcon}</span>${tags}</div>
            <div class="research-meta"><span>${escapeHtml(report.reportDate || "No date")}</span></div>
            <h3 title="${escapeAttr(report.title)}">${escapeHtml(report.title)}</h3>
            <p>${escapeHtml(report.summary || `${report.brand || "Market"} research report with PDF preview and PPT source link.`)}</p>
            <div class="research-actions">
              ${report.pdfUrl ? `<button class="primary" type="button" data-research-view="${escapeAttr(report.id)}">View PDF</button>` : ""}
              ${ppt ? `<a href="${escapeAttr(ppt)}" target="_blank" rel="noopener">Open PPT</a>` : ""}
              <button type="button" data-research-edit="${escapeAttr(report.id)}">Edit</button>
              <button class="danger" type="button" data-research-delete="${escapeAttr(report.id)}">Delete</button>
            </div>
          </div>
        </article>`;
    }).join("");
    observeRevealCards(E.researchGrid);
  }

  function getResearchReport(id){ return getReports().map(normalizeResearchReport).find(report => report.id === String(id)); }

  function openResearchPdf(report){
    if(!report?.pdfUrl){ alert("No PDF preview has been uploaded for this report."); return; }
    E.researchPdfTitle.textContent = report.title || "Research Report";
    E.researchPdfFrame.src = report.pdfUrl;
    E.researchPdfModal.classList.add("open");
    E.researchPdfModal.setAttribute("aria-hidden", "false");
  }

  function closeResearchPdf(){
    E.researchPdfModal.classList.remove("open");
    E.researchPdfModal.setAttribute("aria-hidden", "true");
    E.researchPdfFrame.src = "";
  }

  return { normalizeResearchReport, researchReportPayload, researchTagList, renderResearchLibrary, getResearchReport, openResearchPdf, closeResearchPdf };
}
