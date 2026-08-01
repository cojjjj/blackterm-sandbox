import json
from app.models.schemas import MalwareProfile
from app.services.analysis import build_summary


def markdown_report(profile: MalwareProfile) -> str:
    summary = build_summary(profile)
    lines = [
        f"# BLACKTERM // SANDBOX Report: {profile.name}",
        "",
        "> Safe behavioral replay. No live malware is included or executed.",
        "",
        f"- **Category:** {profile.category}",
        f"- **Risk score:** {summary.risk_score}/100 ({summary.verdict})",
        f"- **Events:** {summary.event_count}",
        f"- **MITRE techniques:** {', '.join(summary.techniques)}",
        "",
        "## Timeline",
    ]
    for event in profile.events:
        lines.append(f"- `{event.timestamp}` **{event.action}** — `{event.target}` ({event.severity})")
    lines.extend(["", "## Indicators", "", "```json", json.dumps(summary.iocs.model_dump(), indent=2), "```", ""])
    return "\n".join(lines)
