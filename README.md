# SparkwaveIT MSP Tracker

![Status](https://img.shields.io/badge/status-active-success)
![Build](https://img.shields.io/badge/build-static-blue)
![Storage](https://img.shields.io/badge/storage-localStorage-informational)

Static dashboard to track managed services across client accounts. It runs fully in the browser with localStorage-backed data entry, plus JSON import/export for sharing or backup.

## Structure

- `src/` application files (HTML/CSS/JS)
- `assets/` static assets (logo)
- `web/` build output (generated)
- `tests/` placeholder for tests
- `scripts/` placeholder for tooling
- `docs/` placeholder for notes


## Quick start

Build the static output:

```bash
python3 build-web.py
```

Serve it locally:

```bash
python3 -m http.server 8001 --directory web
```

Open `http://127.0.0.1:8001/`.

## Screenshots

![Dashboard overview](assets/screenshots/dashboard.png)

## How to build

Build the static bundle into `web/`:

```bash
python3 build-web.py
```

Serve the output locally:

```bash
python3 -m http.server 8001 --directory web
```

Open `http://127.0.0.1:8001/`.

## Data entry

- Use **Add service** to create entries.
- Use **Edit/Delete** actions on each row.
- Data is saved in browser localStorage under the key `sdiDashboardProjects` (rename in `src/app.js` if needed).
- Use **Export JSON** / **Import JSON** to back up or share service lists.

## Notes

- This is a static site; there is no backend yet.
- Persistence is intentionally localStorage-based.
- If you want shared persistence, add a small API (Flask/Express) and swap the localStorage layer.

## Security alerts (serverless)

See `docs/security-alerts-integration.md` for an AWS + Wazuh setup that adds a
read-only security alerts feed (DDoS, brute force, port scans, malware, out-of-date
software) while keeping localStorage for service tracking.

## Adapting for another company

See `docs/branding-and-customization.md` for detailed steps.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Build script

- `build-web.py` generates the `web/` folder used by the local web server.
