export function createUiInteractions({ E, escapeHtml, getProductIntro, findProductIntro }) {
  let revealCardObserver = null;

  function observeRevealCards(root, selector = ".reveal-card"){
    if(!root) return;
    const cards = [...root.querySelectorAll(selector)];
    cards.forEach((card, index) => {
      card.classList.remove("is-visible");
      card.style.setProperty("--reveal-delay", `${Math.min(index, 12) * 55}ms`);
    });
    if(!cards.length) return;
    if(typeof window === "undefined" || !("IntersectionObserver" in window)){
      cards.forEach(card => card.classList.add("is-visible"));
      return;
    }
    if(!revealCardObserver){
      revealCardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            revealCardObserver.unobserve(entry.target);
          }
        });
      }, { threshold:.12, rootMargin:"0px 0px -8% 0px" });
    }
    cards.forEach(card => revealCardObserver.observe(card));
  }

  function bindTooltip(){
    let lastTipKey = "";
    const hideTooltip = () => {
      E.tip.style.display = "none";
      E.tip.innerHTML = "";
      lastTipKey = "";
    };
    const positionTooltip = event => {
      const pad = 12;
      E.tip.style.left = "0px";
      E.tip.style.top = "0px";
      const rect = E.tip.getBoundingClientRect();
      let left = event.clientX + pad;
      let top = event.clientY + pad;
      if(left + rect.width > window.innerWidth - pad) left = event.clientX - rect.width - pad;
      if(top + rect.height > window.innerHeight - pad) top = event.clientY - rect.height - pad;
      E.tip.style.left = `${Math.max(pad, left)}px`;
      E.tip.style.top = `${Math.max(pad, top)}px`;
    };
    document.addEventListener("mousemove", event => {
      const target = event.target;
      if(!(target instanceof Element)) return;
      const introTitle = target.closest("h4[data-intro-key]");
      if(introTitle){
        const key = introTitle.getAttribute("data-intro-key") || "";
        const [brand, product] = key.split("||");
        const intros = getProductIntro();
        const intro = intros[key] || findProductIntro(brand, product);
        if(intro && intro.imageDataUrl){
          if(lastTipKey !== `intro:${key}`){
            E.tip.innerHTML = `<img src="${intro.imageDataUrl}" alt="product preview"><div style="max-width:200px">${escapeHtml((intro.text || "").slice(0, 80))}</div>`;
            lastTipKey = `intro:${key}`;
          }
          E.tip.style.display = "block";
          positionTooltip(event);
          return;
        }
      }
      const html = target.getAttribute("data-tip-html");
      const text = target.getAttribute("data-tip");
      if(html){
        if(lastTipKey !== `html:${html}`){ E.tip.innerHTML = html; lastTipKey = `html:${html}`; }
        E.tip.style.display = "block";
        positionTooltip(event);
      } else if(text){
        if(lastTipKey !== `text:${text}`){ E.tip.textContent = text; lastTipKey = `text:${text}`; }
        E.tip.style.display = "block";
        positionTooltip(event);
      } else if(E.tip.style.display !== "none"){
        hideTooltip();
      }
    });
    document.addEventListener("mouseleave", hideTooltip);
  }

  return { observeRevealCards, bindTooltip };
}
