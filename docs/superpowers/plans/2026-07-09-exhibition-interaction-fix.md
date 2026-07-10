# Exhibition Interaction Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Exhibition map visibility, add country filtering, hide irrelevant Brand Portfolio filters, and make Data Editor easier to use.

**Architecture:** Modify only `index.html`. Reuse current vanilla JS rendering patterns and localStorage state. Add small UI-only state for active Exhibition country.

**Tech Stack:** HTML, CSS, vanilla JavaScript, SVG.

---

### Task 1: Data Editor Tabs

**Files:**
- Modify: `index.html`

- [ ] Wrap existing Sales CSV/upload/table content in `salesDataEditorView`.
- [ ] Wrap Exhibition editor content in `exhibitionDataEditorView`.
- [ ] Add `Sales Data` and `Exhibition Data` sub-tab buttons.
- [ ] Add JS tab switching for `data-editor-sub-tab` buttons.

### Task 2: Contextual Product Information Tools

**Files:**
- Modify: `index.html`

- [ ] Add `data-info-tool="brandPortfolio"` to Brand Portfolio filters.
- [ ] Update `switchInfoView()` to show this tool only when Brand Portfolio is active.

### Task 3: Exhibition Country Filter

**Files:**
- Modify: `index.html`

- [ ] Add `selectedExhibitionCountry` state.
- [ ] Render country chips as buttons with `data-ex-country`.
- [ ] Render map pins with `data-ex-country`.
- [ ] Add click handler in `exhibitionDashboard` to select/clear country.
- [ ] Filter Exhibition List using selected country.

### Task 4: Map Visual Upgrade

**Files:**
- Modify: `index.html`

- [ ] Replace abstract map blocks with clearer world continent SVG shapes.
- [ ] Highlight selected country pin and matching country chip.
- [ ] Add helper text indicating list filter state.

### Task 5: Verify

**Files:**
- Verify: `index.html`

- [ ] Extract script and run `node --check`.
- [ ] Check duplicate IDs.
- [ ] Check key strings/nodes exist.
