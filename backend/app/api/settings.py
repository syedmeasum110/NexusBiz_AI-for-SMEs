from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business, UserSettings
from .dependencies import get_current_business

router = APIRouter()


class SettingsUpdate(BaseModel):
    language: str | None = None
    theme: str | None = None
    email_notifications: int | None = None
    proactive_actions: int | None = None


@router.get("/settings")
def get_settings(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    s = biz.settings
    if not s:
        s = UserSettings(business_id=biz.id, language="en", theme="dark")
        db.add(s)
        db.commit()
        db.refresh(s)

    return {
        "business": {
            "name": biz.name,
            "owner_name": biz.owner_name,
            "location": biz.location,
            "currency": biz.currency,
            "tagline": biz.tagline,
            "established_year": biz.established_year,
            "email": biz.email,
        },
        "settings": {
            "language": s.language,
            "theme": s.theme,
            "email_notifications": bool(s.email_notifications),
            "proactive_actions": bool(s.proactive_actions),
        },
    }


@router.put("/settings")
def update_settings(
    update: SettingsUpdate,
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    s = biz.settings
    if not s:
        s = UserSettings(business_id=biz.id)
        db.add(s)

    if update.language is not None:
        s.language = update.language
    if update.theme is not None:
        s.theme = update.theme
    if update.email_notifications is not None:
        s.email_notifications = update.email_notifications
    if update.proactive_actions is not None:
        s.proactive_actions = update.proactive_actions

    db.commit()
    db.refresh(s)
    return {"status": "ok", "settings": {"language": s.language, "theme": s.theme}}
