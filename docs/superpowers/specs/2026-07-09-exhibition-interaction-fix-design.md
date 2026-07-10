# Exhibition Interaction Fix Design

## Scope
Update the existing single-file dashboard so Exhibition feels usable without disrupting sales dashboard logic.

## Decisions
- Data Editor becomes a two-tab area: `Sales Data` and `Exhibition Data`.
- Product Information header tools are contextual. Brand Portfolio search/HQ filters are shown only for `Brand Portfolio`.
- Exhibition map becomes a clearer world-style SVG panel with clickable country pins and country chips.
- Selecting a country filters only the Exhibition list and visually highlights the selected country. `All Countries` clears selection.

## Data Flow
- Keep existing `exhibitions` localStorage state.
- Add UI-only state `selectedExhibitionCountry`.
- `renderExhibitionView()` derives `displayRows` from selected country and uses it for the table/list while retaining global KPI context.

## Verification
- JavaScript syntax check passes.
- No duplicate IDs.
- Key elements for editor tabs, contextual portfolio tools, and country filtering exist.
