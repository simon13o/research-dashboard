# Daily Raw Sales Upsert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Allow multiple sales CSV uploads with overlapping dates without corrupting monthly totals.

**Architecture:** Add `rawSalesRows` as the daily source of truth. CSV upload upserts daily rows by category/brand/product/date, then regenerates monthly `data` from `rawSalesRows`. Existing monthly-only data is preserved via legacy pseudo-raw migration and replaced only when incoming CSV covers the same product-month.

**Tech Stack:** Vanilla JavaScript in `index.html`.

---

### Task 1: Add Raw Sales State

**Files:**
- Modify: `index.html`

- [x] Add `rawSalesRows = []` global state.
- [x] Save/load `rawSalesRows` in localStorage.
- [x] Clear both `rawSalesRows` and `data` when clearing sales data.

### Task 2: Add Daily Upsert Helpers

**Files:**
- Modify: `index.html`

- [x] Add `normalizeRawSale()` for daily rows.
- [x] Add `dailyRowKey()` and `monthlyScopeKey()`.
- [x] Add `legacyMonthlyToRawRows()` to preserve old monthly data as pseudo-raw.
- [x] Add `upsertRawSalesRows(existing, incoming)` that removes exact daily overlaps and legacy monthly rows in incoming product-month scope.
- [x] Add `rebuildMonthlySalesFromRaw()`.

### Task 3: Update CSV Upload Flow

**Files:**
- Modify: `index.html`

- [x] Replace monthly upsert path with raw daily upsert.
- [x] Rebuild `data` from raw rows after every upload.
- [x] Keep Data Editor monthly table and charts unchanged.

### Task 4: Verify Overlap Scenario

**Files:**
- Verify: `index.html`

- [x] Run Node scenario with overlapping CSV subsets to confirm totals do not double count or overwrite full month with partial month.
- [x] Run JavaScript syntax check.
