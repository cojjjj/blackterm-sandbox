from fastapi import APIRouter, HTTPException, Response
from app.data.profiles import PROFILES
from app.models.schemas import MalwareProfile
from app.services.analysis import build_summary
from app.services.reports import markdown_report

router = APIRouter(prefix="/api")


def get_profile(sample_id: str) -> MalwareProfile:
    for profile in PROFILES:
        if profile.id == sample_id:
            return profile
    raise HTTPException(status_code=404, detail="Sample profile not found")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "online", "mode": "safe-replay"}


@router.get("/samples")
def list_samples() -> list[dict]:
    return [
        {
            "id": p.id,
            "name": p.name,
            "family": p.family,
            "category": p.category,
            "description": p.description,
            "first_seen": p.first_seen,
            "risk_score": p.risk_score,
            "tags": p.tags,
            "event_count": len(p.events),
        }
        for p in PROFILES
    ]


@router.get("/samples/{sample_id}")
def sample_detail(sample_id: str) -> MalwareProfile:
    return get_profile(sample_id)


@router.get("/samples/{sample_id}/summary")
def sample_summary(sample_id: str):
    return build_summary(get_profile(sample_id))


@router.get("/samples/{sample_id}/report.md")
def sample_report(sample_id: str) -> Response:
    profile = get_profile(sample_id)
    return Response(
        content=markdown_report(profile),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{sample_id}-report.md"'},
    )
