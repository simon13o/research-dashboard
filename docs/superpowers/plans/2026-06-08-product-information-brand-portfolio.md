# Product Information Brand Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Brand Portfolio sub-view and Add New Brand modal inside the existing Product Information module while preserving the current Information Editor behavior.

**Architecture:** The app is a single vanilla HTML/CSS/JavaScript file. We will add internal Product Information sub-tabs, a persistent `brandProfiles` state array, render functions for brand cards and modal tags/inputs, and event handlers that only affect the Product Information area.

**Tech Stack:** Plain HTML, CSS, SVG icons, vanilla JavaScript, localStorage.

---

### Task 1: Add Product Information Sub-View Markup

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Locate the current Product Information section**

Find:

```html
<section id="intro" class="tab">
```

Expected: It contains one card with `Product Information`, `introBrand`, `introProduct`, `introImage`, `introText`, `introSave`, and `introPreview`.

- [ ] **Step 2: Wrap the existing editor in an Information Editor panel**

Replace the current `section#intro` contents with:

```html
<article class="card product-info-shell">
  <div class="portfolio-head">
    <div>
      <b>Product Information</b>
      <small>Manage brand profiles and product introductions.</small>
    </div>
    <nav class="sub-tabs" aria-label="Product information views">
      <button class="sub-tab-btn active" type="button" data-info-view="brandPortfolio">Brand Portfolio</button>
      <button class="sub-tab-btn" type="button" data-info-view="informationEditor">Information Editor</button>
    </nav>
    <span class="brand-total">Total Linked Brands: <b id="brandProfileCount">0</b></span>
  </div>

  <div id="brandPortfolioView" class="info-sub-view active">
    <div id="brandPortfolioGrid" class="brand-grid"></div>
  </div>

  <div id="informationEditorView" class="info-sub-view">
    <div class="intro-grid">
      <div>
        <div class="field"><label>Brand</label><select id="introBrand"></select></div>
        <div class="field" style="margin-top:8px"><label>Product</label><select id="introProduct"></select></div>
        <div class="field" style="margin-top:8px"><label>Upload Image</label><input id="introImage" type="file" accept="image/*"></div>
        <div class="field" style="margin-top:8px"><label>Introduction Text</label><textarea id="introText" placeholder="Write product introduction..."></textarea></div>
        <button id="introSave" class="reset" type="button" style="margin-top:8px;width:auto;padding:8px 12px">Save Introduction</button>
      </div>
      <div class="intro-preview">
        <b style="display:block;margin-bottom:6px">Preview</b>
        <div id="introPreview"></div>
      </div>
    </div>
  </div>
</article>
```

- [ ] **Step 3: Add modal skeleton after existing global modals**

Insert after `#zoomModal`:

```html
<div id="brandModal" class="brand-modal" aria-hidden="true">
  <div class="brand-modal-card">
    <div class="brand-modal-head">
      <div>
        <h3>Create New Brand Profile</h3>
        <p>Add a partner company to your KIN YAT network.</p>
      </div>
      <button id="brandModalClose" class="brand-modal-close" type="button" aria-label="Close brand modal">...</button>
    </div>
    <form id="brandForm" class="brand-form">
      <!-- fields for brand name, HQ, website, key product tags, contact name, position, phones, emails -->
    </form>
    <div class="brand-modal-actions">
      <button id="brandCancel" type="button" class="brand-cancel">Cancel</button>
      <button id="brandSave" type="button" class="brand-save">Save Brand Profile</button>
    </div>
  </div>
</div>
```

Use inline SVG paths already available in `portfolio.html` / `modal.html` for plus and close icons.

### Task 2: Add Brand Portfolio CSS

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Add sub-tab and portfolio card styles**

Add CSS near the existing visual refresh block:

```css
.product-info-shell { overflow:hidden; }
.portfolio-head { display:flex; align-items:center; justify-content:space-between; gap:16px; border-bottom:1px solid #f1f5f9; padding-bottom:16px; margin-bottom:20px; flex-wrap:wrap; }
.portfolio-head small { display:block; color:var(--muted); margin-top:3px; }
.sub-tabs { display:inline-flex; gap:4px; padding:4px; border-radius:12px; background:#f1f5f9; }
.sub-tab-btn { width:auto; border:0; border-radius:9px; padding:7px 14px; background:transparent; color:#64748b; font-size:13px; font-weight:750; cursor:pointer; box-shadow:none; }
.sub-tab-btn.active { background:#fff; color:#7c3aed; box-shadow:0 8px 20px rgba(31,41,55,.06); }
.brand-total { color:#94a3b8; font-size:12px; }
.brand-total b { color:#7c3aed; }
.info-sub-view { display:none; }
.info-sub-view.active { display:block; }
.brand-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px; }
.brand-add-card, .brand-card { min-height:290px; border-radius:18px; }
```

- [ ] **Step 2: Add modal and form styles**

Add CSS for:

```css
.brand-modal { position:fixed; inset:0; z-index:10000; display:none; align-items:center; justify-content:center; background:rgba(15,23,42,.42); backdrop-filter:blur(8px); padding:18px; }
.brand-modal.open { display:flex; }
.brand-modal-card { width:min(560px,96vw); max-height:88vh; display:grid; grid-template-rows:auto 1fr auto; border-radius:24px; background:#fff; box-shadow:0 28px 80px rgba(15,23,42,.24); overflow:hidden; }
.brand-modal-head, .brand-modal-actions { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px; border-bottom:1px solid #f1f5f9; }
.brand-modal-actions { border-top:1px solid #f1f5f9; border-bottom:0; background:#f8fafc; justify-content:flex-end; }
.brand-form { overflow:auto; padding:18px 20px; display:grid; gap:14px; }
.brand-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.brand-form-field.full { grid-column:1 / -1; }
.brand-tag-box { display:flex; flex-wrap:wrap; gap:6px; border:1px solid #e2e8f0; border-radius:12px; padding:8px; }
.brand-tag-box input { flex:1; min-width:80px; border:0; padding:3px; box-shadow:none; background:transparent; }
.brand-dynamic-list { display:grid; gap:8px; }
.brand-line-input { display:flex; gap:8px; }
```

### Task 3: Add Persistent Brand Profile State

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Add state variables near existing globals**

After `let productIntro = {};`, add:

```js
let brandProfiles = [];
let brandModalTags = [];
let brandPhoneRows = [""];
let brandEmailRows = [""];
```

- [ ] **Step 2: Add default brand profile seed helper**

Add:

```js
function defaultBrandProfiles(){
  return [
    {
      brand_name:"BabyBrezza",
      brand_id:"BRD-001",
      hq_location:"Hong Kong",
      official_site:"www.babybrezza.com",
      key_products:["Baby Care","Smart Appliance"],
      contact_name:"Sarah Jenkins",
      contact_position:"Sales Lead",
      phones:["+852 1234 5678","Ext. 402"],
      emails:["sarah@babybrezza.com"]
    },
    {
      brand_name:"Grownsy",
      brand_id:"BRD-002",
      hq_location:"Shenzhen",
      official_site:"www.grownsy.com",
      key_products:["Home Appliance","Toys"],
      contact_name:"",
      contact_position:"",
      phones:["+86 755 8888 9999"],
      emails:["info@grownsy.com","support@grownsy.com"]
    }
  ];
}
```

- [ ] **Step 3: Persist `brandProfiles`**

Update `saveState()` from:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, brandColors, productIntro, ui:uiSnapshot() }));
```

to:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, brandColors, productIntro, brandProfiles, ui:uiSnapshot() }));
```

Update `loadState()` to set:

```js
brandProfiles = Array.isArray(parsed.brandProfiles) ? parsed.brandProfiles : defaultBrandProfiles();
```

In the catch block, set:

```js
brandProfiles = defaultBrandProfiles();
```

### Task 4: Add Brand Portfolio Render Functions

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Add DOM references**

Add to the `E` object:

```js
infoSubTabs:[...document.querySelectorAll(".sub-tab-btn")],
brandPortfolioView:document.getElementById("brandPortfolioView"),
informationEditorView:document.getElementById("informationEditorView"),
brandPortfolioGrid:document.getElementById("brandPortfolioGrid"),
brandProfileCount:document.getElementById("brandProfileCount"),
brandModal:document.getElementById("brandModal"),
brandModalClose:document.getElementById("brandModalClose"),
brandCancel:document.getElementById("brandCancel"),
brandSave:document.getElementById("brandSave"),
brandForm:document.getElementById("brandForm"),
brandKeyInput:document.getElementById("brandKeyInput"),
brandTagList:document.getElementById("brandTagList"),
brandPhoneList:document.getElementById("brandPhoneList"),
brandEmailList:document.getElementById("brandEmailList")
```

- [ ] **Step 2: Add brand helpers**

Add:

```js
function initials(name){
  const parts = String(name || "Brand").trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0,2) || "BR").toUpperCase();
}
function brandProfileId(index){
  return `BRD-${String(index + 1).padStart(3,"0")}`;
}
function safeUrl(url){
  const s = String(url || "").trim();
  if(!s) return "#";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}
```

- [ ] **Step 3: Add `renderBrandPortfolio()`**

Implement:

```js
function renderBrandPortfolio(){
  if(!E.brandPortfolioGrid) return;
  E.brandProfileCount.textContent = String(brandProfiles.length);
  const addCard = `<button class="brand-add-card" id="addBrandCard" type="button">...</button>`;
  const cards = brandProfiles.map((profile, index) => brandCardHtml(profile, index)).join("");
  E.brandPortfolioGrid.innerHTML = addCard + cards;
}
```

Implement `brandCardHtml(profile, index)` using `contact_name` fallback:

```js
const hasContact = String(profile.contact_name || "").trim().length > 0;
```

When `hasContact` is false, render `General HQ Contacts` and skip avatar/name/position.

### Task 5: Add Modal Rendering And Events

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Add modal open/close helpers**

```js
function openBrandModal(){
  resetBrandModalForm();
  E.brandModal.classList.add("open");
  E.brandModal.setAttribute("aria-hidden","false");
}
function closeBrandModal(){
  E.brandModal.classList.remove("open");
  E.brandModal.setAttribute("aria-hidden","true");
}
```

- [ ] **Step 2: Add dynamic form helpers**

Add:

```js
function resetBrandModalForm(){
  E.brandForm.reset();
  brandModalTags = [];
  brandPhoneRows = [""];
  brandEmailRows = [""];
  renderBrandModalDynamicInputs();
}
function renderBrandModalDynamicInputs(){
  E.brandTagList.innerHTML = brandModalTags.map((tag, i) => `<span class="brand-tag">${escapeHtml(tag)}<button type="button" data-remove-tag="${i}">x</button></span>`).join("") + `<input id="brandKeyInput" type="text" placeholder="Add tag...">`;
  E.brandKeyInput = document.getElementById("brandKeyInput");
  E.brandPhoneList.innerHTML = brandPhoneRows.map((value, i) => `<div class="brand-line-input"><input type="tel" value="${escapeAttr(value)}" data-phone-i="${i}" placeholder="+852 1234 5678"><button type="button" data-add-phone>+</button></div>`).join("");
  E.brandEmailList.innerHTML = brandEmailRows.map((value, i) => `<div class="brand-line-input"><input type="email" value="${escapeAttr(value)}" data-email-i="${i}" placeholder="contact@brand.com"><button type="button" data-add-email>+</button></div>`).join("");
}
```

- [ ] **Step 3: Add save helper**

```js
function saveBrandProfileFromModal(){
  const fd = new FormData(E.brandForm);
  const brandName = String(fd.get("brand_name") || "").trim();
  const hq = String(fd.get("hq_location") || "").trim();
  if(!brandName || !hq){ alert("Please fill Brand Name and HQ Location."); return; }
  const profile = {
    brand_name:brandName,
    brand_id:brandProfileId(brandProfiles.length),
    hq_location:hq,
    official_site:String(fd.get("official_site") || "").trim(),
    key_products:[...brandModalTags],
    contact_name:String(fd.get("contact_name") || "").trim(),
    contact_position:String(fd.get("contact_position") || "").trim(),
    phones:[...E.brandPhoneList.querySelectorAll("input")].map(x => x.value.trim()).filter(Boolean),
    emails:[...E.brandEmailList.querySelectorAll("input")].map(x => x.value.trim()).filter(Boolean)
  };
  brandProfiles.push(profile);
  saveState();
  renderBrandPortfolio();
  closeBrandModal();
}
```

- [ ] **Step 4: Wire events in `init()`**

Add listeners:

```js
E.infoSubTabs.forEach(btn => btn.addEventListener("click", () => switchInfoView(btn.dataset.infoView)));
E.brandPortfolioGrid.addEventListener("click", e => { if(e.target.closest("#addBrandCard")) openBrandModal(); });
E.brandModalClose.addEventListener("click", closeBrandModal);
E.brandCancel.addEventListener("click", closeBrandModal);
E.brandModal.addEventListener("click", e => { if(e.target === E.brandModal) closeBrandModal(); });
E.brandSave.addEventListener("click", saveBrandProfileFromModal);
E.brandForm.addEventListener("keydown", e => { if(e.target.id === "brandKeyInput" && e.key === "Enter"){ e.preventDefault(); addBrandTag(e.target.value); } });
E.brandForm.addEventListener("click", e => { /* remove tags, add phone, add email */ });
E.brandForm.addEventListener("input", e => { /* sync phone/email arrays from inputs */ });
```

Call:

```js
renderBrandPortfolio();
```

before final `renderAll()`.

### Task 6: Verification

**Files:**
- Test: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Verify JavaScript syntax**

Run:

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
new Function(scripts);
console.log('JS syntax OK');
'@ | node -
```

Expected:

```text
JS syntax OK
```

- [ ] **Step 2: Verify required IDs exist**

Run:

```powershell
rg -n "brandPortfolioGrid|brandModal|brandSave|introBrand|introProduct|introSave|introPreview" index.html
```

Expected: all IDs are found.

- [ ] **Step 3: Manual browser checks**

Open:

```text
file:///D:/OneDrive/Documents/New%20project/index.html
```

Check:

- Left nav `Product Information` opens the Product Information page.
- `Brand Portfolio` shows the Add New Brand card plus seeded brand cards.
- Grownsy-style empty contact renders `General HQ Contacts`.
- Clicking Add New Brand opens the modal with blur overlay.
- X and Cancel close the modal.
- Pressing Enter in Key Products creates tags.
- Phone and Email plus buttons add input rows.
- Save Brand Profile adds a new card and persists after refresh.
- `Information Editor` tab still shows the old product intro form and preview.
