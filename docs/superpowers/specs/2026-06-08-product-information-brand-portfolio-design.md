# Product Information Brand Portfolio Design

## Goal

Integrate the provided `portfolio.html` Brand Portfolio card stream and `modal.html` Add New Brand modal into the existing Dashboard's Product Information module without breaking the current product introduction editor.

## Approved Structure

Use page-level secondary tabs inside the existing `Product Information` page.

- The left sidebar remains unchanged with one primary `Product Information` item.
- The `Product Information` page gets an internal tab switcher:
  - `Brand Portfolio`
  - `Information Editor`
- `Brand Portfolio` is the default sub-view when opening Product Information.
- `Information Editor` contains the existing brand/product/image/text form and preview, preserving the current DOM IDs and logic:
  - `introBrand`
  - `introProduct`
  - `introImage`
  - `introText`
  - `introSave`
  - `introPreview`

## Brand Portfolio Data Model

Add a persistent `brandProfiles` array to the existing localStorage state object.

Each brand profile uses this shape:

```js
{
  brand_name: "BabyBrezza",
  brand_id: "BRD-001",
  hq_location: "Hong Kong",
  official_site: "www.babybrezza.com",
  key_products: ["Baby Care", "Smart Appliance"],
  contact_name: "Sarah Jenkins",
  contact_position: "Sales Lead",
  phones: ["+852 1234 5678", "Ext. 402"],
  emails: ["sarah@babybrezza.com"]
}
```

Default seed profiles may be used so the portfolio is not empty before the user adds brands. Saved state always wins over defaults after the user edits or adds profiles.

## Brand Card Rendering

The Brand Portfolio view renders:

- First card: `Add New Brand` dashed card.
- Remaining cards: one card per `brandProfiles` item.

Brand card details:

- Initials are generated from `brand_name`.
- `brand_id` displays under brand name.
- `hq_location` and `official_site` display as profile metadata.
- `key_products` render as responsive pill tags.
- `phones` and `emails` render as small badge links.

Contact fallback rule:

- If `contact_name` is empty or whitespace, render a `General HQ Contacts` state.
- In this fallback state, hide the contact avatar, contact person name, and contact position.
- Still show phone and email badge streams if present.

## Add New Brand Modal

Add a global modal inside the page, hidden by default.

Modal behavior:

- Clicking the dashed `Add New Brand` card opens the modal.
- Clicking the top-right close button closes the modal.
- Clicking `Cancel` closes the modal.
- The overlay includes a soft dark translucent background and backdrop blur.
- The modal does not affect Dashboard filters, chart state, or product introduction state.

Dynamic form behavior:

- `Key Products` input adds a tag on Enter.
- Each tag can be removed.
- Phone `+` adds another phone input row.
- Email `+` adds another email input row.
- `Save Brand Profile` validates that brand name and HQ location are present.
- On save, the form data is normalized into the brand profile JSON shape and pushed into `brandProfiles`.
- After save, modal closes, form resets, portfolio re-renders, and localStorage is updated.

## Visual Direction

Use the existing Dashboard's soft purple SaaS style.

- White cards.
- Soft ambient shadow.
- Rounded corners.
- Pastel purple active states.
- Slate text hierarchy.
- Responsive grid: one column on small screens, two or three columns on wider screens.

## Non-Goals

- Do not replace the existing Product Introduction editor logic.
- Do not change CSV upload, dashboard charts, filters, brand color picker, or sales data model.
- Do not add React or Vue. The current app is vanilla HTML/CSS/JavaScript, so the new feature will use vanilla state arrays and render functions.

## Verification

- Confirm Product Information primary nav still opens the same main `intro` section.
- Confirm internal tab switching does not affect main page tabs.
- Confirm existing product introduction save/image preview still works.
- Confirm new brand profiles persist after refresh.
- Confirm empty `contact_name` renders `General HQ Contacts`.
- Confirm `Save Brand Profile` adds a new card and closes the modal.
