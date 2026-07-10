# Product Information Header And Map Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Keep Product Information sub-tabs fixed on the left and replace the abstract Exhibition map with a clearer built-in world map SVG.

**Architecture:** Modify only `index.html`. Use CSS flex alignment for the header and inline SVG paths for the map, preserving existing country-pin filtering logic.

**Tech Stack:** HTML, CSS, vanilla JavaScript, SVG.

---

### Task 1: Fix Product Information Header Alignment

**Files:**
- Modify: `index.html`

- [x] Change `.portfolio-head` from space-between distribution to left-aligned flex flow.
- [x] Keep `.portfolio-tools` pushed right with `margin-left:auto` only when visible.
- [x] Ensure hidden tools no longer move the sub-tabs.

### Task 2: Replace Exhibition Map SVG

**Files:**
- Modify: `index.html`

- [x] Add subtle graticule/map styling.
- [x] Replace abstract continent blocks with clearer world-map-like SVG paths.
- [x] Preserve `data-ex-country` pins and selected-country highlighting.

### Task 3: Verify

**Files:**
- Verify: `index.html`

- [x] Extract script and run `node --check`.
- [x] Check duplicate IDs.
- [x] Check key map/header strings exist.
