import re
from app.models.schemas import AnalysisSummary, IOCBundle, MalwareProfile

IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_RE = re.compile(r"\b(?:[a-zA-Z0-9-]+\.)+(?:invalid|com|net|org)\b")
SHA256_RE = re.compile(r"\b[a-fA-F0-9]{64}\b")


def extract_iocs(profile: MalwareProfile) -> IOCBundle:
    ips: set[str] = set()
    domains: set[str] = set()
    urls: set[str] = set()
    hashes: set[str] = set()
    files: set[str] = set()
    registry_keys: set[str] = set()
    mutexes: set[str] = set()

    for event in profile.events:
        searchable = " ".join([event.target, *[str(v) for v in event.details.values()]])
        ips.update(IP_RE.findall(searchable))
        domains.update(DOMAIN_RE.findall(searchable))
        hashes.update(SHA256_RE.findall(searchable))

        if event.target.startswith("http"):
            urls.add(event.target)
        if event.event_type == "file":
            files.add(event.target)
        elif event.event_type == "registry":
            registry_keys.add(event.target)

        mutex = event.details.get("mutex")
        if mutex:
            mutexes.add(str(mutex))

    return IOCBundle(
        ips=sorted(ips),
        domains=sorted(domains),
        urls=sorted(urls),
        hashes=sorted(hashes),
        files=sorted(files),
        registry_keys=sorted(registry_keys),
        mutexes=sorted(mutexes),
    )


def build_summary(profile: MalwareProfile) -> AnalysisSummary:
    techniques = sorted({e.mitre_technique for e in profile.events if e.mitre_technique})
    verdict = "CRITICAL" if profile.risk_score >= 90 else "HIGH" if profile.risk_score >= 70 else "MEDIUM"
    return AnalysisSummary(
        sample_id=profile.id,
        risk_score=profile.risk_score,
        verdict=verdict,
        event_count=len(profile.events),
        techniques=techniques,
        iocs=extract_iocs(profile),
    )
