# Exhibition Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add an Exhibition dataset workflow: upload/edit CSV in Data Editor, persist data, and visualize it under Product Information > Exhibition.

**Architecture:** Keep the current single-file vanilla HTML/CSS/JS architecture. Add an `exhibitions` state array, CSV mapping/upsert helpers, Data Editor UI for upload/edit/clear, and Product Information third sub-tab with map/cards/charts/table.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, browser `FileReader`, current localStorage state key.

---

### Task 1: Extend State And Layout

**Files:**
- Modify: `index.html`

- [x] Add `exhibitions = []` state.
- [x] Include `exhibitions` in `saveState()` and `loadState()`.
- [x] Add third Product Information sub-tab button: `Exhibition`.
- [x] Add `exhibitionView` container under Product Information.
- [x] Add Exhibition refs to the `E` object.

### Task 2: Add Data Editor Exhibition Controls

**Files:**
- Modify: `index.html`

- [x] Add a new `Exhibition Data Editor` card after the existing sales editable table.
- [x] Add CSV upload input, upsert button, add row button, and clear button.
- [x] Add editable table columns: Show Name, Date, Country, Location, Sales Responsible, Category, OEM/ODM, Attendence, Website, Remark.

### Task 3: Add Exhibition Parsing And Editing Logic

**Files:**
- Modify: `index.html`

- [x] Add `normalizeExhibition()` with tolerant CSV alias mapping.
- [x] Add `exhibitionCsvMap()` for CSV rows.
- [x] Add `exhibitionKey()` and `upsertExhibitions()` keyed by Show Name + Date + Country.
- [x] Add `renderExhibitionEditor()` with editable rows.
- [x] Wire upload, add, clear, and cell blur handlers.

### Task 4: Add Exhibition Visualization

**Files:**
- Modify: `index.html`

- [x] Add `renderExhibitionView()`.
- [x] Render KPI cards: Total Shows, Countries, Attended, Next Show.
- [x] Render lightweight world map/pin panel using fixed country coordinates and hover tooltips.
- [x] Render category and monthly summary charts as SVG.
- [x] Render exhibition list with website links.

### Task 5: Verify

**Files:**
- Verify: `index.html`

- [x] Run JavaScript syntax check with Node.
- [x] Confirm no duplicate IDs.
- [x] Confirm CSV upload/edit state persists through `saveState()`.
