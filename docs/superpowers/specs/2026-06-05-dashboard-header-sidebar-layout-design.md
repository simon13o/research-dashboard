# Dashboard Header Sidebar Layout Design

## Goal

Refine the dashboard's global skeleton so the top filters never overlap the page title and the left navigation has a branded KIN YAT header.

## Approved Design

- Convert the top header to a flexible row layout with the title/subtitle on the left and compact pill filters on the right.
- Change the subtitle to `Real-time marketplace brand performance & metrics index.`
- Remove the company logo from the top header.
- Limit the filter strip to roughly half of the main content width using compact padding, tighter control widths, and a max width.
- Add a branded block at the top of the left sidebar with the company logo and `KIN YAT Board`.
- Remove the visible `Navigation` label.
- Add breathing space between the new sidebar brand block and the menu items.

## Non-Goals

- Do not change filter IDs, filter logic, saved state, CSV upload logic, charts, or product information behavior.
- Do not redesign KPI cards or chart cards in this pass.

## Verification

- Confirm `catDd`, `brDd`, `prDd`, `from`, `to`, and `reset` still exist once each.
- Confirm JavaScript syntax still parses.
- Visually check that the title and filters are separated by layout flow rather than overlap-prone positioning.
