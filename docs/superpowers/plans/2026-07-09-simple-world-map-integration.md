# Simple World Map Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the fake Exhibition map with a real inline SVG world map based on flekschas/simple-world-map and keep country filtering working.

**Architecture:** Modify only `index.html`. Embed the SVG markup as a JavaScript template string, normalize exhibition country names to ISO-like map IDs, style map countries by data/selection state, and reuse the existing selected-country list filter.

**Tech Stack:** HTML, CSS, vanilla JavaScript, inline SVG.

---

### Task 1: Add Real Map Source

**Files:**
- Modify: `index.html`

- [x] Fetch `simple-world-map` SVG source.
- [x] Add attribution text in the map panel.
- [x] Add map CSS for base countries, active countries, and selected country.

### Task 2: Add Country ID Mapping

**Files:**
- Modify: `index.html`

- [x] Add `exhibitionCountryCode(country)` mapping common country names to SVG IDs.
- [x] Add `renderWorldMapSvg(countries)` that marks countries with exhibition data.

### Task 3: Wire Interaction

**Files:**
- Modify: `index.html`

- [x] Replace fake map SVG in `renderExhibitionView()` with `renderWorldMapSvg(countries)`.
- [x] Add `data-ex-country` to SVG country paths where possible.
- [x] Keep chip click and map click filtering synced.

### Task 4: Verify

**Files:**
- Verify: `index.html`

- [x] Extract script and run `node --check`.
- [x] Check duplicate IDs.
- [x] Confirm map attribution and map helper functions exist.
