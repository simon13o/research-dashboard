# Sales CSV Upsert Replacement Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Prevent stale monthly sales records, such as old June zero values, from surviving CSV upsert.

**Architecture:** Modify only `index.html`. Normalize row keys aggressively and replace existing rows that match the incoming CSV's normalized category/brand/product/month keys before inserting monthly aggregated rows.

**Tech Stack:** Vanilla JavaScript.

---

### Task 1: Normalize Sales Upsert Keys

**Files:**
- Modify: `index.html`

- [x] Add `keyPart()` helper that trims, lowercases, removes invisible chars, and collapses whitespace.
- [x] Update `rowKey()` to use `keyPart()` and `monthKey()` for the time component.

### Task 2: Replace Incoming Key Scope

**Files:**
- Modify: `index.html`

- [x] Update `upsertRows(existing, incoming)` to remove any existing row whose normalized key is present in incoming rows.
- [x] Return normalized existing survivors plus normalized incoming rows.

### Task 3: Verify With Provided CSV Case

**Files:**
- Verify: `index.html`

- [x] Run a Node reproduction where old `Bottle washer pro-white / 2026-06 = 0` is replaced by CSV monthly value.
- [x] Run JS syntax check.
