# Dashboard Header Sidebar Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the dashboard header and sidebar so filters do not overlap the title and the sidebar includes KIN YAT branding.

**Architecture:** This is a single-file HTML/CSS update in `index.html`. Existing DOM IDs for filters remain unchanged so current JavaScript behavior continues to work.

**Tech Stack:** Plain HTML, CSS, and vanilla JavaScript.

---

### Task 1: Header Layout And Sidebar Brand

**Files:**
- Modify: `D:\OneDrive\Documents\New project\index.html`

- [ ] **Step 1: Update sidebar markup**

Replace the visible `Navigation` label with a brand block containing the company logo and `KIN YAT Board`.

- [ ] **Step 2: Update header markup**

Remove the company logo from the top header and update the subtitle to `Real-time marketplace brand performance & metrics index.`

- [ ] **Step 3: Update CSS**

Change `.topbar` to flex row layout, reduce `.top-filter-strip` width and padding, compact dropdown/date controls, and add sidebar brand block styling.

- [ ] **Step 4: Verify IDs**

Run:

```powershell
rg -n "catDd|brDd|prDd|id=`"from`"|id=`"to`"|id=`"reset`"" index.html
```

Expected: each filter element appears in the header markup and JavaScript references still resolve.

- [ ] **Step 5: Verify JavaScript syntax**

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

Expected: `JS syntax OK`
