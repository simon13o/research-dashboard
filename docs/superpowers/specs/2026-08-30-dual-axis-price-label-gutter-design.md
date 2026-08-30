# Dual-Axis Price Label Gutter Design

## Goal

Prevent the final monthly units bar from overlapping the right-side price-axis labels in expanded Selected Product Monthly Sales charts.

## Cause

The dual-axis renderer places the final bar and the price-axis text in effectively the same right-side area. Price labels are right-aligned, so their text extends left toward the final bar.

## Approved Design

Reserve a fixed right-side price-label gutter within the existing `620 x 220` SVG coordinate system.

- The chart plot width ends before the price-label gutter.
- Units bars, the price line, circles, and horizontal grid lines use only the reduced plot width.
- Price-axis labels are anchored near the overall SVG right edge, independently of the plot boundary.
- The legend is repositioned within the reduced plot area so it cannot overlap the label gutter.
- Retain the current axes, labels, data values, animation, tooltip behavior, and card layout.

## Scope

Only `drawMiniChart()` geometry for dual-axis charts changes. No sales data, SKU selection, comparison logic, chart styling outside the expanded chart, or dashboard layout changes.

## Verification

1. Expand a product with multiple monthly points.
2. Confirm the final bar has a visible gap before the price labels.
3. Confirm price labels align consistently at the SVG's right edge.
4. Confirm the legend, price line, bars, X-axis labels, tooltip, and chart animation remain visible and usable.
