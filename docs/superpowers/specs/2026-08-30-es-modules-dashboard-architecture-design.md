# ES Modules Dashboard Architecture Design

## Objective

Migrate the existing static dashboard from a single `index.html` file to native HTML, CSS, and JavaScript ES Modules while preserving GitHub Pages hosting, Supabase data storage, existing functionality, and the dashboard's current visual design.

## Constraints

- Keep GitHub Pages as the deployment platform.
- Keep Supabase as the data and storage backend.
- Do not introduce React, a server runtime, or a mandatory build step.
- Use relative asset paths so the site works at the GitHub Pages project URL.
- Do not expose a Supabase `service_role` key in frontend code.
- Each migration stage must remain independently usable and revertible through Git.

## Target Structure

```text
index.html
assets/css/tokens.css
assets/css/layout.css
assets/css/components.css
assets/css/charts.css
assets/js/app.js
assets/js/config.js
assets/js/state.js
assets/js/dom.js
assets/js/data/{csv,sales,supabase,storage}.js
assets/js/dashboard/{filters,insights,sales-trend,ranking,product-monthly}.js
assets/js/information/{brands,products,exhibitions,research-library}.js
assets/js/ui/{modal,tooltip,animations}.js
```

## Module Boundaries

- `data/` owns CSV parsing, normalization, local cache, and all Supabase calls.
- `state.js` owns UI state such as active tab, filters, chart modes, expanded cards, and selected SKUs.
- `dashboard/` reads processed data and renders dashboard areas; it does not call Supabase directly.
- `information/` renders and edits the Brand, Product, Exhibition, and Research Library domains.
- `ui/` owns reusable interaction utilities only.
- `app.js` initializes the application, connects events, and schedules renders.
- `index.html` holds semantic page structure and links to external assets only.

## Migration Sequence

1. Commit the current stable dashboard and create `refactor/es-modules` from it.
2. Extract CSS unchanged into the four CSS files and verify visual parity.
3. Move the inline script unchanged into `assets/js/app.js` and load it with `type="module"`.
4. Audit inline event handlers and replace them with module-safe listeners or event delegation.
5. Extract configuration, state, DOM references, and data access before chart renderers.
6. Extract Dashboard modules one area at a time: filters, insights, sales trend, ranking, then product monthly details.
7. Extract Information modules one area at a time.
8. Remove duplicated helpers, document the module interfaces, and merge only after the complete smoke test passes.

## Git and Release Workflow

- Keep `main` deployable at all times.
- Do refactoring on `refactor/es-modules`.
- Commit each extraction independently with a focused message.
- Test locally over HTTP using `py -m http.server 8000`; do not use `file://` for module testing.
- Push or merge to `main` only after dashboard, Data Editor, Information, Supabase sync, and responsive layout checks pass.

## Security and Data Rules

- Keep the public Supabase URL and publishable key in `config.js`; this is normal for a browser client.
- Enforce access controls with Supabase RLS and Storage policies.
- Never commit privileged keys or raw confidential exports.
- Add data provenance fields such as `updated_at`, `updated_by`, and `source_file` where schema evolution permits.

## Verification Gates

After each stage, verify: initial dashboard load, all filters, date range, sales trend, ranking, selected-product detail chart, Data Editor changes and cloud sync, Brand Portfolio, Product Information, Exhibition, Research Library, and a narrow viewport. Run syntax checks on JavaScript modules and inspect browser console errors before moving to the next stage.
