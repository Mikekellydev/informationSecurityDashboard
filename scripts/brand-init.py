#!/usr/bin/env python3
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def write_text(relative_path: str, content: str) -> None:
    (ROOT / relative_path).write_text(content, encoding="utf-8")


def prompt(label: str, default: str) -> str:
    suffix = f" [{default}]" if default else " [leave blank]"
    value = input(f"{label}{suffix}: ").strip()
    return value or default


def capture(pattern: str, text: str, flags: int = 0) -> re.Match[str]:
    match = re.search(pattern, text, flags)
    if not match:
        raise ValueError(f"Pattern not found: {pattern}")
    return match


def main() -> None:
    html = read_text("src/index.html")
    css = read_text("src/styles.css")
    js = read_text("src/app.js")

    title = capture(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    brand_eyebrow = capture(r'<p class="brand-eyebrow">([^<]*)</p>', html).group(1).strip()
    heading = capture(r"<h1>([^<]*)</h1>", html).group(1).strip()
    footer_copy = capture(
        r'<footer class="footer">[\s\S]*?<p>([^<]*)</p>', html, re.S
    ).group(1).strip()
    repo_url = capture(r'<a\s+class="github-link"[^>]*?href="([^"]+)"', html).group(
        1
    ).strip()

    brand_img_match = capture(r'<div class="brand">[\s\S]*?<img[^>]*?>', html, re.S)
    brand_tag = brand_img_match.group(0)
    logo_src = capture(r'src="([^"]+)"', brand_tag).group(1)
    logo_alt = capture(r'alt="([^"]*)"', brand_tag).group(1)

    accent = capture(r'--accent:\s*([^;]+);', css).group(1).strip()
    accent_bright = capture(r'--accent-bright:\s*([^;]+);', css).group(1).strip()

    storage_key = capture(r'const STORAGE_KEY = "([^"]+)";', js).group(1).strip()

    print("Branding initialization (press Enter to keep current values).")

    company_name = prompt("Company name", logo_alt or "")
    alt_default = company_name or logo_alt

    new_title = prompt("Page title (browser tab)", title)
    new_eyebrow = prompt("Brand eyebrow", brand_eyebrow)
    new_heading = prompt("Dashboard title (H1)", heading)
    new_footer = prompt("Footer main copy", footer_copy)
    new_repo = prompt("Repo URL", repo_url)

    logo_input = prompt("Logo filename or path (relative to assets/)", logo_src)
    new_logo_src = logo_input
    if logo_input and "/" not in logo_input and not logo_input.startswith("."):
        new_logo_src = f"../assets/{logo_input}"

    new_logo_alt = prompt("Logo alt text", alt_default)

    new_accent = prompt("Accent color", accent)
    new_accent_bright = prompt("Accent bright color", accent_bright)

    new_storage_key = prompt("localStorage key", storage_key)

    updated_html = html
    updated_html = re.sub(
        r"(<title>)(.*?)(</title>)",
        lambda m: f"{m.group(1)}{new_title}{m.group(3)}",
        updated_html,
        count=1,
        flags=re.S,
    )
    updated_html = re.sub(
        r'(<p class="brand-eyebrow">)([^<]*)(</p>)',
        lambda m: f"{m.group(1)}{new_eyebrow}{m.group(3)}",
        updated_html,
        count=1,
    )
    updated_html = re.sub(
        r"(<h1>)([^<]*)(</h1>)",
        lambda m: f"{m.group(1)}{new_heading}{m.group(3)}",
        updated_html,
        count=1,
    )
    updated_html = re.sub(
        r'(<footer class="footer">[\s\S]*?<p>)([^<]*)(</p>)',
        lambda m: f"{m.group(1)}{new_footer}{m.group(3)}",
        updated_html,
        count=1,
        flags=re.S,
    )
    updated_html = re.sub(
        r'(<a\s+class="github-link"[^>]*?href=")([^"]+)(")',
        lambda m: f"{m.group(1)}{new_repo}{m.group(3)}",
        updated_html,
        count=1,
    )

    updated_brand_tag = brand_tag
    updated_brand_tag = re.sub(
        r'src="[^"]+"', f'src="{new_logo_src}"', updated_brand_tag, count=1
    )
    updated_brand_tag = re.sub(
        r'alt="[^"]*"', f'alt="{new_logo_alt}"', updated_brand_tag, count=1
    )
    if updated_brand_tag != brand_tag:
        updated_html = updated_html.replace(brand_tag, updated_brand_tag, 1)

    updated_css = css
    updated_css = re.sub(
        r"(--accent:\s*)([^;]+)(;)",
        lambda m: f"{m.group(1)}{new_accent}{m.group(3)}",
        updated_css,
        count=1,
    )
    updated_css = re.sub(
        r"(--accent-bright:\s*)([^;]+)(;)",
        lambda m: f"{m.group(1)}{new_accent_bright}{m.group(3)}",
        updated_css,
        count=1,
    )

    updated_js = re.sub(
        r'(const STORAGE_KEY = ")([^"]+)(")',
        lambda m: f"{m.group(1)}{new_storage_key}{m.group(3)}",
        js,
        count=1,
    )

    changed_files = []
    if updated_html != html:
        write_text("src/index.html", updated_html)
        changed_files.append("src/index.html")
    if updated_css != css:
        write_text("src/styles.css", updated_css)
        changed_files.append("src/styles.css")
    if updated_js != js:
        write_text("src/app.js", updated_js)
        changed_files.append("src/app.js")

    if new_logo_src.startswith("../assets/"):
        logo_path = ROOT / "assets" / new_logo_src.replace("../assets/", "")
        if not logo_path.exists():
            print(f"Warning: logo file not found at {logo_path}")

    if changed_files:
        print("Updated:")
        for changed_file in changed_files:
            print(f"  - {changed_file}")
    else:
        print("No changes made.")


if __name__ == "__main__":
    main()
