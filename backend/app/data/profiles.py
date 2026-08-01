from app.models.schemas import MalwareProfile, SandboxEvent


def _events(seed: int, family: str) -> list[SandboxEvent]:
    base = seed * 100
    return [
        SandboxEvent(
            id=base + 1,
            timestamp="00:00:01",
            event_type="process",
            action="Process created",
            target=f"C:\\Users\\Public\\{family.lower()}-loader.exe",
            process="explorer.exe",
            pid=4120 + seed,
            severity="medium",
            mitre_technique="T1204.002",
            details={"parent_pid": 1884, "command_line": f"{family.lower()}-loader.exe /start"},
        ),
        SandboxEvent(
            id=base + 2,
            timestamp="00:00:04",
            event_type="file",
            action="File created",
            target=f"C:\\ProgramData\\{family}\\cache.dat",
            process=f"{family.lower()}-loader.exe",
            pid=4120 + seed,
            severity="high",
            mitre_technique="T1105",
            details={"sha256": f"{seed:064x}"[-64:]},
        ),
        SandboxEvent(
            id=base + 3,
            timestamp="00:00:07",
            event_type="registry",
            action="Registry value set",
            target=f"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\{family}Update",
            process=f"{family.lower()}-loader.exe",
            pid=4120 + seed,
            severity="high",
            mitre_technique="T1060",
            details={"value": f"C:\\ProgramData\\{family}\\cache.dat"},
        ),
        SandboxEvent(
            id=base + 4,
            timestamp="00:00:11",
            event_type="network",
            action="Outbound connection",
            target=f"https://node-{seed}.example.invalid/api/checkin",
            process=f"{family.lower()}-loader.exe",
            pid=4120 + seed,
            severity="critical",
            mitre_technique="T1071.001",
            details={"remote_ip": f"192.0.2.{10 + seed}", "port": 443, "simulated": True},
        ),
        SandboxEvent(
            id=base + 5,
            timestamp="00:00:15",
            event_type="process",
            action="Remote thread simulation",
            target="explorer.exe",
            process=f"{family.lower()}-loader.exe",
            pid=4120 + seed,
            severity="critical",
            mitre_technique="T1055",
            details={"target_pid": 1884, "simulated": True},
        ),
    ]


_PROFILE_DATA = [
    ("emotet", "Emotet", "Loader", "Modular loader behavior replay", 2014, 92, ["loader", "email", "persistence"]),
    ("trickbot", "TrickBot", "Banking Trojan", "Credential theft and discovery replay", 2016, 94, ["credential-access", "discovery"]),
    ("qakbot", "QakBot", "Loader", "Command-and-control and persistence replay", 2008, 90, ["loader", "c2"]),
    ("wannacry", "WannaCry", "Ransomware", "Safe ransomware execution-chain replay", 2017, 98, ["ransomware", "impact"]),
    ("ryuk", "Ryuk", "Ransomware", "Enterprise ransomware behavior replay", 2018, 97, ["ransomware", "lateral-movement"]),
    ("lockbit", "LockBit", "Ransomware", "Safe LockBit-inspired behavior dataset", 2019, 96, ["ransomware", "exfiltration"]),
    ("redline", "RedLine", "Infostealer", "Browser and credential collection replay", 2020, 88, ["stealer", "collection"]),
    ("asyncrat", "AsyncRAT", "RAT", "Remote-access behavior replay", 2019, 86, ["rat", "c2"]),
    ("agenttesla", "Agent Tesla", "Infostealer", "Credential and application-data replay", 2014, 85, ["stealer", "keylogging"]),
    ("darkgate", "DarkGate", "Loader", "Multi-stage loader behavior replay", 2017, 91, ["loader", "defense-evasion"]),
]

PROFILES: list[MalwareProfile] = [
    MalwareProfile(
        id=slug,
        name=name,
        family=name,
        category=category,
        description=description,
        first_seen=first_seen,
        risk_score=score,
        tags=tags,
        events=_events(index + 1, name.replace(" ", "")),
    )
    for index, (slug, name, category, description, first_seen, score, tags) in enumerate(_PROFILE_DATA)
]
