from typing import Literal
from pydantic import BaseModel, Field

EventType = Literal["process", "file", "registry", "network", "service", "memory"]
Severity = Literal["info", "low", "medium", "high", "critical"]


class SandboxEvent(BaseModel):
    id: int
    timestamp: str
    event_type: EventType
    action: str
    target: str
    process: str
    pid: int | None = None
    severity: Severity = "info"
    mitre_technique: str | None = None
    details: dict[str, str | int | bool] = Field(default_factory=dict)


class MalwareProfile(BaseModel):
    id: str
    name: str
    family: str
    category: str
    description: str
    first_seen: int
    status: Literal["ready", "analyzing", "complete"] = "ready"
    risk_score: int = Field(ge=0, le=100)
    tags: list[str]
    events: list[SandboxEvent]


class IOCBundle(BaseModel):
    ips: list[str] = Field(default_factory=list)
    domains: list[str] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    hashes: list[str] = Field(default_factory=list)
    files: list[str] = Field(default_factory=list)
    registry_keys: list[str] = Field(default_factory=list)
    mutexes: list[str] = Field(default_factory=list)


class AnalysisSummary(BaseModel):
    sample_id: str
    risk_score: int
    verdict: str
    event_count: int
    techniques: list[str]
    iocs: IOCBundle
