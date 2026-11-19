from fastapi import APIRouter
from ..config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.project_name,
        "tagline": settings.tagline,
        "agents": 6,
        "version": "1.0.0",
        "mode": "autonomous",
    }
