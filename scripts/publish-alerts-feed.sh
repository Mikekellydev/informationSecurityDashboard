#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

python3 scripts/security-alerts-sync.py

git add docs/alerts/alerts.json docs/alerts/summary.json

if git diff --cached --quiet; then
  echo "No alert changes to publish."
  exit 0
fi

git commit -m "chore: update alerts feed"
git push
