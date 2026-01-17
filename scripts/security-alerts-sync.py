#!/usr/bin/env python3
import base64
import json
import os
import re
import ssl
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib import error, request
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

DEFAULT_ALERT_TYPES = ["ddos", "brute_force", "port_scan", "malware", "out_of_date"]


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def get_env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def get_env_bool(name: str, default: bool = False) -> bool:
    value = get_env(name)
    if not value:
        return default
    return value.lower() in {"1", "true", "yes", "y"}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def request_json(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    data: Optional[bytes] = None,
    verify_tls: bool = True,
) -> Dict[str, Any]:
    req = request.Request(url, data=data, headers=headers or {}, method=method)
    context = None if verify_tls else ssl._create_unverified_context()
    with request.urlopen(req, context=context, timeout=30) as response:
        payload = response.read().decode("utf-8")
    return json.loads(payload)


def fetch_hosting_components() -> List[Dict[str, Any]]:
    url = get_env("HOSTING_STATUS_URL")
    if not url:
        return []
    try:
        data = request_json(url)
    except error.URLError as err:
        print(f"Hosting status fetch failed: {err}")
        return []

    if isinstance(data, dict):
        components = data.get("data", {}).get("components")
        if components is None:
            components = data.get("components", [])
        return list(components or [])
    return []


def normalize_hosting_alerts(components: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    alerts: List[Dict[str, Any]] = []
    status_severity = {
        "degraded_performance": "medium",
        "partial_outage": "high",
        "major_outage": "critical",
        "under_maintenance": "low",
    }

    for component in components:
        status = str(component.get("status", "operational")).lower()
        if status in {"operational", "available"}:
            continue
        severity = status_severity.get(status, "medium")
        name = component.get("name", "hosting.com")
        timestamp = component.get("updated_at") or now_iso()
        alerts.append(
            {
                "id": f"hosting-{component.get('id', name)}",
                "source": "hosting.com",
                "type": "availability",
                "severity": severity,
                "title": f"{name} status: {status.replace('_', ' ')}",
                "summary": component.get("description", ""),
                "entity": name,
                "timestamp": timestamp,
            }
        )
    return alerts


def fetch_wazuh_token(api_url: str, verify_tls: bool) -> Optional[str]:
    token = get_env("WAZUH_API_TOKEN")
    if token:
        return token

    user = get_env("WAZUH_API_USER")
    password = get_env("WAZUH_API_PASSWORD")
    if not user or not password:
        return None

    auth = base64.b64encode(f"{user}:{password}".encode("utf-8")).decode("utf-8")
    headers = {"Authorization": f"Basic {auth}"}
    try:
        response = request_json(
            f"{api_url}/security/user/authenticate",
            method="POST",
            headers=headers,
            verify_tls=verify_tls,
        )
    except error.URLError as err:
        print(f"Wazuh auth failed: {err}")
        return None

    token = (
        response.get("data", {}).get("token")
        or response.get("data", {}).get("items", {}).get("token")
        or response.get("token")
    )
    return token


def fetch_wazuh_alerts() -> List[Dict[str, Any]]:
    api_url = get_env("WAZUH_API_URL")
    if not api_url:
        return []
    api_url = api_url.rstrip("/")
    verify_tls = get_env_bool("WAZUH_VERIFY_TLS", default=True)

    token = fetch_wazuh_token(api_url, verify_tls=verify_tls)
    if not token:
        print("Wazuh token not available; skipping Wazuh alerts.")
        return []

    headers = {"Authorization": f"Bearer {token}"}
    limit = int(get_env("WAZUH_ALERT_LIMIT", "200"))
    query = get_env("WAZUH_ALERT_QUERY")
    params = f"limit={limit}&sort=-timestamp"
    if query:
        params = f"{params}&q={quote(query)}"
    url = f"{api_url}/alerts?{params}"

    try:
        data = request_json(url, headers=headers, verify_tls=verify_tls)
    except error.URLError as err:
        print(f"Wazuh alerts fetch failed: {err}")
        return []

    items = data.get("data", {}).get("affected_items")
    if items is None:
        items = data.get("data", {}).get("items")
    if items is None and isinstance(data.get("data"), list):
        items = data.get("data")
    return list(items or [])


def severity_from_level(level: Optional[int]) -> str:
    if level is None:
        return "low"
    if level >= 12:
        return "critical"
    if level >= 9:
        return "high"
    if level >= 5:
        return "medium"
    return "low"


def classify_alert(description: str, groups: Iterable[str]) -> Optional[str]:
    text = description.lower()
    group_text = " ".join(groups).lower()

    if "ddos" in text or "dos" in group_text or "ddos" in group_text:
        return "ddos"
    if "brute force" in text or "authentication_failed" in group_text or "failed password" in text:
        return "brute_force"
    if "port scan" in text or "nmap" in text or "scan" in group_text:
        return "port_scan"
    if "malware" in text or "virus" in text or "trojan" in text or "malicious" in text:
        return "malware"
    if "vulnerability" in text or "cve" in text or "vulnerability_detector" in group_text:
        return "out_of_date"
    return None


def normalize_wazuh_alert(alert: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    rule = alert.get("rule", {}) if isinstance(alert.get("rule"), dict) else {}
    description = str(rule.get("description", "")).strip()
    groups = rule.get("groups", []) or []
    alert_type = classify_alert(description, groups)
    if not alert_type:
        return None

    timestamp = alert.get("timestamp") or alert.get("@timestamp") or alert.get("data", {}).get("timestamp")
    agent = alert.get("agent", {}) if isinstance(alert.get("agent"), dict) else {}
    entity = agent.get("name") or agent.get("id") or alert.get("location") or "Unknown"
    src_ip = alert.get("data", {}).get("srcip") or alert.get("srcip")
    user = alert.get("data", {}).get("user") or alert.get("user")
    summary_parts = [part for part in [src_ip, user] if part]
    summary = ", ".join(summary_parts) if summary_parts else description

    return {
        "id": alert.get("id") or alert.get("_id") or f"wazuh-{entity}-{timestamp}",
        "source": "wazuh",
        "type": alert_type,
        "severity": severity_from_level(rule.get("level")),
        "title": description or "Wazuh alert",
        "summary": summary,
        "entity": entity,
        "timestamp": timestamp or now_iso(),
    }


def normalize_wazuh_alerts(alerts: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    normalized = []
    for alert in alerts:
        if not isinstance(alert, dict):
            continue
        entry = normalize_wazuh_alert(alert)
        if entry:
            normalized.append(entry)
    return normalized


def build_summary(alerts: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    counts = {key: 0 for key in DEFAULT_ALERT_TYPES}
    counts["other"] = 0

    for alert in alerts:
        alert_type = alert.get("type", "other")
        if alert_type in counts:
            counts[alert_type] += 1
        else:
            counts["other"] += 1

    return {"generatedAt": now_iso(), "counts": counts}


def parse_timestamp(value: str) -> float:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


def upload_json_to_s3(payload: Dict[str, Any], bucket: str, key: str, region: str) -> None:
    body = json.dumps(payload, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
    cache_control = "no-store, max-age=0"
    content_type = "application/json"

    try:
        import boto3  # type: ignore

        client = boto3.client("s3", region_name=region or None)
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
            CacheControl=cache_control,
        )
        return
    except ImportError:
        pass

    with tempfile.NamedTemporaryFile(delete=False) as temp:
        temp.write(body)
        temp_path = temp.name

    try:
        subprocess.run(
            [
                "aws",
                "s3",
                "cp",
                temp_path,
                f"s3://{bucket}/{key}",
                "--content-type",
                content_type,
                "--cache-control",
                cache_control,
            ],
            check=True,
        )
    finally:
        Path(temp_path).unlink(missing_ok=True)


def main() -> int:
    load_env_file(ENV_FILE)

    hosting_alerts = normalize_hosting_alerts(fetch_hosting_components())
    wazuh_alerts = normalize_wazuh_alerts(fetch_wazuh_alerts())
    alerts = hosting_alerts + wazuh_alerts

    alerts.sort(
        key=lambda alert: parse_timestamp(alert.get("timestamp", "")),
        reverse=True,
    )

    max_alerts = int(get_env("ALERT_MAX_ITEMS", "50"))
    alerts = alerts[:max_alerts]
    summary = build_summary(alerts)

    output_dir = get_env("ALERTS_OUTPUT_DIR")
    if output_dir:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        (output_path / "alerts.json").write_text(
            json.dumps(alerts, indent=2, ensure_ascii=True), encoding="utf-8"
        )
        (output_path / "summary.json").write_text(
            json.dumps(summary, indent=2, ensure_ascii=True), encoding="utf-8"
        )

    bucket = get_env("S3_BUCKET")
    prefix = get_env("S3_PREFIX", "").strip("/")
    region = get_env("AWS_REGION", "us-east-1")
    if bucket and not get_env_bool("DRY_RUN", default=False):
        alerts_key = f"{prefix}/alerts.json" if prefix else "alerts.json"
        summary_key = f"{prefix}/summary.json" if prefix else "summary.json"
        upload_json_to_s3(alerts, bucket, alerts_key, region)
        upload_json_to_s3(summary, bucket, summary_key, region)
        print(f"Uploaded alerts to s3://{bucket}/{alerts_key}")
        print(f"Uploaded summary to s3://{bucket}/{summary_key}")
    else:
        print("S3 upload skipped. Set S3_BUCKET to enable uploads.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
