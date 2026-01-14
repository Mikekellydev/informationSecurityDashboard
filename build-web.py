#!/usr/bin/env python3
"""Build static web output into the web/ directory."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
ASSETS_DIR = ROOT / "assets"
WEB_DIR = ROOT / "web"


def copy_tree(source: Path, destination: Path) -> int:
    if not source.exists():
        return 0
    shutil.copytree(source, destination)
    return sum(1 for _ in destination.rglob("*"))


def main() -> int:
    if WEB_DIR.exists():
        shutil.rmtree(WEB_DIR)

    WEB_DIR.mkdir()

    html_files = list(ROOT.glob("*.html"))
    for html_file in html_files:
        shutil.copy2(html_file, WEB_DIR / html_file.name)

    copy_tree(SRC_DIR, WEB_DIR / "src")
    copy_tree(ASSETS_DIR, WEB_DIR / "assets")

    print(f"Built {len(html_files)} root html file(s).")
    print(f"Copied src/ to {WEB_DIR / 'src'}")
    print(f"Copied assets/ to {WEB_DIR / 'assets'}")
    print("Output ready in web/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
