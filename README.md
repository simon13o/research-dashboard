# Research Dashboard

A static GitHub Pages dashboard for Amazon marketplace sales analysis, product intelligence, exhibition tracking, brand portfolio management, and research report browsing.

## How It Runs

- The dashboard is served as a static website from `index.html` through GitHub Pages.
- No local Python or server process is required for normal viewing.
- The page uses browser-side JavaScript to render charts, filters, editors, and report cards.
- Supabase is used as the cloud data layer for shared data across devices.

## Main Modules

- **Dashboard**: Shows sales performance, executive insights, trend charts, rankings, and selected product analysis.
- **Data Editor**: Admin-oriented area for uploading CSV data, editing rows, batch updates, and syncing sales data to Supabase.
- **Information**: Stores product information, brand portfolio, exhibition intelligence, and research library content.

## Data Flow

1. User opens the GitHub Pages URL in a browser.
2. The dashboard loads saved data from Supabase where configured.
3. CSV uploads are parsed in the browser.
4. Sales data is normalized and aggregated by month.
5. Edited or uploaded data is synced back to Supabase so other users can see the same data after refresh.

## CSV Sales Data

Expected core fields:

- `category`
- `brand`
- `product name` or `product`
- `time` / `date`
- `sale units`
- `price`

Optional fields may include product group or related product-family naming. If no product group is provided, the dashboard can infer product groups from SKU names where possible.

## Supabase Notes

The front-end uses Supabase publishable credentials. For production use, keep Row Level Security policies strict:

- CEO / viewer access should usually be read-only.
- Admin upload/edit actions should be limited to trusted users.
- Storage buckets must allow the intended upload/read behavior for reports and images.

## Deployment

This project is deployed by pushing changes to the GitHub repository connected to GitHub Pages.

Typical update flow:

```bash
git add index.html README.md
git commit -m "Update dashboard and documentation"
git push origin main
```

After GitHub Pages finishes rebuilding, refresh the public URL to view the latest version.

## Maintenance Tips

- Keep `index.html` as the main production file.
- Keep images and static assets in the repository when they are referenced by the dashboard.
- Avoid committing local-only scripts, temporary outputs, or test research files unless they are intentionally part of the project.
- Before major layout changes, create a stable Git commit so the dashboard can be rolled back safely.
