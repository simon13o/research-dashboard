# Selected Product Monthly Sales Chart Width Design

## Goal

Make the expanded monthly units and price chart fill the available width of its product card. The change must not alter sales data, SKU selection, summary metrics, sparkline rendering, chart modes, or expand/collapse behavior.

## Cause

The expanded SVG has an intrinsic `620 x 220` view box and only a fixed CSS height. Without `width: 100%`, browsers render it at its intrinsic proportional width, leaving unused horizontal space inside wider product cards.

## Approved Design

Use a responsive chart sizing contract:

- The expanded chart wrapper stays full-width inside the product card.
- The chart SVG uses `display: block` and `width: 100%` so it aligns with the card's inner left and right edges.
- Keep the current `220px` chart height to preserve existing information density.
- Retain a modest minimum width only on narrow screens; the existing wrapper may scroll horizontally instead of shrinking axis labels or chart data into an unreadable area.

## Scope Boundaries

Only CSS sizing/layout rules for `.prod-chart-wrap` and `.mini-svg` may change. No JavaScript drawing logic, filters, data calculation, product grouping, SKU switching, or other dashboard layout is changed.

## Verification

1. Open an expanded product card on a desktop-width dashboard.
2. Confirm the chart border reaches the same usable width as the metric row above it.
3. Confirm the right-side blank area disappears.
4. Confirm summary metrics, sparkline, SKU selector, Hide/Details button, chart axes, and tooltip behavior remain functional.
5. Check a narrow viewport and ensure labels remain usable rather than being clipped or compressed.
