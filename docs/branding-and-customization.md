# Branding and Customization Guide

Use this guide to adapt the dashboard for another company while keeping the
localStorage persistence model intact.

## Quick start (automated)

Run the interactive helper to update basic branding fields:

```bash
python3 scripts/brand-init.py
```

The script updates `src/index.html`, `src/styles.css`, and `src/app.js` based on
your answers.

## 1) Update the product name and core copy

1. Open `src/index.html`.
2. Change the `<title>` tag to the new dashboard name.
3. Update the header copy:
   - `.brand-eyebrow` text (currently "Managed Services").
   - The main `<h1>` title (currently "Managed Services Portfolio Tracker").
4. Update supporting copy:
   - The "Client health" description.
   - The "Service register" description.
   - The footer text at the bottom of the page.

## 2) Replace the logo and alt text

1. Add the new logo to `assets/`.
2. In `src/index.html`, update the `<img>` tag in the header:
   - Change the `src` path if the filename differs.
   - Update the `alt` text to match the company name.

## 3) Adjust the visual theme (colors and typography)

1. Open `src/styles.css` and update the CSS variables in `:root`:
   - `--accent` and `--accent-bright` for primary buttons and highlights.
   - `--ink`, `--steel`, and `--fog` for the main palette.
2. If you want different fonts:
   - Update the Google Fonts `<link>` in `src/index.html`.
   - Update `--font-display` and `--font-body` in `src/styles.css`.

## 4) Update sample data and labels

1. Open `src/app.js` and replace the `seedProjects` array with your own sample
   services, clients, and owners.
2. If you want to change field labels:
   - Update column headers and form labels in `src/index.html`.
   - Keep IDs the same unless you also update the JavaScript selectors in
     `src/app.js`.

## 5) Customize status, priority, and risk options

1. In `src/index.html`, update the `<select>` options:
   - `projectStatus`, `projectPriority`, `projectRisk`.
   - The filter dropdowns (`statusFilter`, `priorityFilter`, `riskFilter`).
2. In `src/app.js`, update these mappings to match your new options:
   - `statusClassMap`
   - `riskClassMap`
3. In `src/styles.css`, ensure the classes used by the maps exist and match your
   new naming (for example, `status-on-track`, `risk-critical`).

## 6) Confirm the localStorage behavior

1. The storage key is defined in `src/app.js` as `sdiDashboardProjects`.
2. If you want a company-specific key, change the constant value, but keep
   localStorage as the persistence layer.

## 7) Rebuild and verify

1. Run the build script:
   ```bash
   python3 build-web.py
   ```
2. Serve the site:
   ```bash
   python3 -m http.server 8001 --directory web
   ```
3. Confirm:
   - The logo and branding copy are updated.
   - Filters and table columns match your new labels.
   - Import/export still works as expected.

## Company-specific checklist template

Use this checklist to track progress for a specific company rollout.

- [ ] Company name: [Company Name]
- [ ] Repo link: [GitHub or internal URL]
- [ ] Brand eyebrow text: [Short label]
- [ ] Dashboard title (H1): [Primary title]
- [ ] Page title (browser tab): [Title]
- [ ] Footer copy: [Short statement]
- [ ] Logo file added under `assets/`: [Filename]
- [ ] Logo `alt` text updated in `src/index.html`: [Alt text]
- [ ] Accent colors updated in `src/styles.css`: [Hex values]
- [ ] Fonts updated in `src/index.html` and `src/styles.css`: [Font names]
- [ ] Sample services updated in `src/app.js`: [Count of sample rows]
- [ ] Table/form labels updated in `src/index.html`: [Notes]
- [ ] Status options aligned in `src/index.html`: [Values]
- [ ] Priority options aligned in `src/index.html`: [Values]
- [ ] Risk options aligned in `src/index.html`: [Values]
- [ ] `statusClassMap` updated in `src/app.js`: [Yes/No]
- [ ] `riskClassMap` updated in `src/app.js`: [Yes/No]
- [ ] Related CSS classes updated in `src/styles.css`: [Yes/No]
- [ ] localStorage key reviewed in `src/app.js`: [Key name]
- [ ] Build completed: `python3 build-web.py`
- [ ] Smoke test completed: `python3 -m http.server 8001 --directory web`
