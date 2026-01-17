# Security Alerts Integration (AWS + Wazuh)

This guide wires a managed services security feed into the dashboard using:
- Wazuh on your Ubuntu iMac (open-source SIEM).
- A scheduled sync script that pulls Wazuh + hosting.com status data.
- AWS S3 (us-east-1) to host `alerts.json` and `summary.json`.

The dashboard stays localStorage-based for service tracking. The alerts feed is
read-only and refreshed on a schedule.

## Architecture

1) Wazuh runs locally (Docker) and exposes its API.
2) A cron job calls `scripts/security-alerts-sync.py` every 15 minutes.
3) The script uploads `alerts.json` and `summary.json` to S3.
4) The dashboard fetches those files and renders the Security Alerts panel.

## 1) Set up Wazuh (on the Ubuntu iMac)

Use the official Wazuh Docker compose bundle (manager + indexer + dashboard).
Make sure the Wazuh API is reachable locally, typically at:

- `https://localhost:55000`

If you use self-signed certificates, you can disable TLS verification with
`WAZUH_VERIFY_TLS=false` in the environment file.

## 2) Configure the sync script

Create `.env.local` in the repo root (do not commit it). Example:

```
HOSTING_STATUS_URL=https://status.hosting.com/api/v1/components
WAZUH_API_URL=https://localhost:55000
WAZUH_API_USER=your_wazuh_user
WAZUH_API_PASSWORD=your_wazuh_password
WAZUH_VERIFY_TLS=false

AWS_REGION=us-east-1
S3_BUCKET=your-alerts-bucket
S3_PREFIX=security

ALERT_MAX_ITEMS=50
ALERTS_OUTPUT_DIR=
```

Optional tuning:
- `WAZUH_ALERT_LIMIT` (default 200) to control API pull size.
- `WAZUH_ALERT_QUERY` to pre-filter alerts server-side.
- `ALERT_MAX_ITEMS` to cap the uploaded list.

Notes:
- `HOSTING_STATUS_URL` is availability-only. DDoS/WAF events typically require
  hosting.com security logs (if available) or a WAF feed.
- To test locally, set `ALERTS_OUTPUT_DIR=web/alerts` and point the dashboard at
  `/alerts` (see step 4).

Run a manual sync:

```bash
python3 scripts/security-alerts-sync.py
```

The sync script uploads to S3 using `boto3` if installed, otherwise it falls
back to the AWS CLI. Install one of them on the iMac:

```bash
pip3 install boto3
```

or:

```bash
sudo apt-get install awscli
```

## Option A: GitHub Pages (simplest free hosting)

1) Enable GitHub Pages for this repo:
   - Settings → Pages → Build from branch → `main` + `/docs`.
2) Set the output folder in `.env.local`:

```
ALERTS_OUTPUT_DIR=docs/alerts
```

3) After each sync, commit `docs/alerts/alerts.json` and `docs/alerts/summary.json`
   so Pages can serve them.
4) Point the dashboard to:

```
data-alerts-base-url="https://YOUR_GH_USERNAME.github.io/YOUR_REPO/alerts"
```

Optional helper (auto-commit + push):

```bash
./scripts/publish-alerts-feed.sh
```

Cron example (every 15 minutes):

```bash
*/15 * * * * /path/to/repo/scripts/publish-alerts-feed.sh >> /var/log/alerts-feed.log 2>&1
```

Tip: Cron runs with a minimal environment. If you hit `python3` not found, use
the full path inside the script or prefix the cron entry with a PATH, e.g.:

```bash
PATH=/usr/local/bin:/usr/bin:/bin
*/15 * * * * /path/to/repo/scripts/publish-alerts-feed.sh >> /var/log/alerts-feed.log 2>&1
```

## Option B: Create the S3 bucket (us-east-1)

1) Create a bucket, e.g. `sparkwave-alerts` in `us-east-1`.
2) Allow public read for the two JSON files or use CloudFront.

Example bucket policy (public read for the prefix):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadAlerts",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sparkwave-alerts/security/*"
    }
  ]
}
```

Example CORS config (allow dashboard fetches):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 4) Point the dashboard to S3

Open `src/index.html` and set the S3 base URL on the `<body>` tag:

```
data-alerts-base-url="https://sparkwave-alerts.s3.amazonaws.com/security"
```

Optional overrides:
- `data-alerts-url` for a custom alerts JSON path.
- `data-alerts-summary-url` for a custom summary JSON path.
- `data-alerts-refresh-ms` to change the refresh cadence.

## 5) Schedule the sync (every 15 minutes)

On the iMac, add a cron entry:

```bash
*/15 * * * * /usr/bin/python3 /path/to/repo/scripts/security-alerts-sync.py >> /var/log/security-alerts-sync.log 2>&1
```

## Output schema

`alerts.json` (array):

```
[
  {
    "id": "wazuh-...",
    "source": "wazuh",
    "type": "brute_force",
    "severity": "high",
    "title": "SSH authentication failed",
    "summary": "203.0.113.12, admin",
    "entity": "client-host-1",
    "timestamp": "2026-01-16T12:10:00Z"
  }
]
```

`summary.json`:

```
{
  "generatedAt": "2026-01-16T12:15:00Z",
  "counts": {
    "ddos": 0,
    "brute_force": 3,
    "port_scan": 1,
    "malware": 0,
    "out_of_date": 4,
    "other": 0
  }
}
```
