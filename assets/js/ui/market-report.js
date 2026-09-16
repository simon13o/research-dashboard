export function createMarketReportTools({ E, escapeAttr, getReportHtml, setReportHtml }) {
  function defaultMarketReportHtml(){
    return `
      <h2>Top Opportunities</h2>
      <ul><li><b>Opportunity 1:</b> Add the strongest product/category signal here.</li><li><b>Opportunity 2:</b> Note any fast-growing product, SKU, or competitor gap.</li></ul>
      <h2>Market Alerts</h2>
      <ul><li><mark>Watch list:</mark> Track abnormal sales movement, price shifts, or new competitor activity.</li></ul>
      <h2>Innovative Functions</h2>
      <ul><li>Summarize product functions worth sharing with engineering or product teams.</li></ul>
      <h2>Action Items</h2>
      <ul><li><b>CEO:</b> Decision or investment question.</li><li><b>Sales:</b> Follow-up target or customer angle.</li><li><b>Engineering:</b> Feature research or feasibility note.</li></ul>
    `;
  }

  function openMarketReport(){
    let reportHtml = getReportHtml();
    if(!reportHtml || !reportHtml.trim()){
      reportHtml = defaultMarketReportHtml();
      setReportHtml(reportHtml);
    }
    E.marketReportEditor.innerHTML = reportHtml;
    E.marketReportDrawer.classList.add("open");
    E.marketReportDrawer.setAttribute("aria-hidden", "false");
    E.marketReportStatus.textContent = "Editable report. Remember to save changes.";
    setTimeout(() => E.marketReportEditor.focus(), 40);
  }

  function closeMarketReport(){
    E.marketReportDrawer.classList.remove("open");
    E.marketReportDrawer.setAttribute("aria-hidden", "true");
  }

  function insertReportTemplate(){
    E.marketReportEditor.focus();
    document.execCommand("insertHTML", false, defaultMarketReportHtml());
  }

  function toggleReportHighlight(){
    E.marketReportEditor.focus();
    document.execCommand("backColor", false, "#fef3c7");
  }

  function insertReportImage(file){
    if(!file) return;
    if(!file.type || !file.type.startsWith("image/")){
      alert("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      if(!src) return;
      E.marketReportEditor.focus();
      const imageHtml = `<figure class="report-image-figure"><img src="${escapeAttr(src)}" alt="Report image"><figcaption>Image note...</figcaption></figure>`;
      document.execCommand("insertHTML", false, imageHtml);
      E.marketReportStatus.textContent = "Unsaved changes";
    };
    reader.readAsDataURL(file);
  }

  function bindMarketReportControls({ onSave }){
    E.marketReportEntry.addEventListener("click", openMarketReport);
    E.marketReportClose.addEventListener("click", closeMarketReport);
    E.marketReportDrawer.addEventListener("click", event => { if(event.target === E.marketReportDrawer) closeMarketReport(); });
    E.marketReportSave.addEventListener("click", onSave);
    E.marketReportEditor.addEventListener("input", () => { E.marketReportStatus.textContent = "Unsaved changes"; });
    E.reportToolbarBtns.forEach(button => button.addEventListener("click", () => {
      if(button.dataset.reportCmd){
        E.marketReportEditor.focus();
        document.execCommand(button.dataset.reportCmd, false, null);
      } else if(button.dataset.reportBlock){
        E.marketReportEditor.focus();
        document.execCommand("formatBlock", false, button.dataset.reportBlock);
      } else if(button.hasAttribute("data-report-mark")){
        toggleReportHighlight();
      } else if(button.hasAttribute("data-report-image")){
        E.marketReportImageInput.value = "";
        E.marketReportImageInput.click();
      } else if(button.hasAttribute("data-report-template")){
        insertReportTemplate();
      }
      if(!button.hasAttribute("data-report-image")) E.marketReportStatus.textContent = "Unsaved changes";
    }));
    E.marketReportImageInput.addEventListener("change", () => {
      const file = E.marketReportImageInput.files && E.marketReportImageInput.files[0];
      insertReportImage(file);
    });
  }

  return { defaultMarketReportHtml, openMarketReport, closeMarketReport, bindMarketReportControls };
}
